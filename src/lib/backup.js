
import {
  clearEverything,
  createGroup,
  createSaree,
  deleteGroup,
  deleteSaree,
  fetchAllSarees,
  fetchGroups,
} from "@/lib/data";
import { computeSignature, dataUrlToFile } from "@/lib/imageUtils";

export const BACKUP_APP = "ARUNIKA";
export const BACKUP_VERSION = 1;

export async function buildBackup(onProgress) {
  const [groups, sarees] = await Promise.all([
    fetchGroups(),
    fetchAllSarees(5000),
  ]);

  const listings = [];
  let missingPhotos = 0;

  for (let i = 0; i < sarees.length; i++) {
    const saree = sarees[i];

    const photoData =
      typeof saree.photo_uri === "string" &&
      saree.photo_uri.startsWith("data:image/")
        ? saree.photo_uri
        : null;

    if (!photoData) missingPhotos += 1;

    listings.push({
      item_id: saree.item_id,
      selling_price: saree.selling_price,
      purchase_price: saree.purchase_price,
      group_name: saree.group_name || "",
      upload_date: saree.upload_date,
      signature: saree.signature || null,
      photo_data: photoData,
    });

    onProgress?.(i + 1, sarees.length);
  }

  return {
    backup: {
      app: BACKUP_APP,
      version: BACKUP_VERSION,
      exported_at: new Date().toISOString(),
      currency: "INR",
      groups: groups.map((group) => ({
        name: group.name,
      })),
      sarees: listings,
    },
    missingPhotos,
  };
}

export function downloadJson(data, filename) {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" },
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function validateBackup(raw) {
  const errors = [];

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      ok: false,
      errors: ["This file is not an Arunika backup."],
    };
  }

  if (raw.app !== BACKUP_APP) {
    errors.push("This file was not exported by Arunika.");
  }

  if (typeof raw.version !== "number") {
    errors.push("The backup version is missing.");
  } else if (raw.version > BACKUP_VERSION) {
    errors.push(
      `This backup was made with a newer version (v${raw.version}).`,
    );
  }

  if (!Array.isArray(raw.groups)) {
    errors.push("The supplier groups in this backup are missing.");
  }

  if (!Array.isArray(raw.sarees)) {
    errors.push("The saree listings in this backup are missing.");
  }

  if (errors.length) {
    return { ok: false, errors };
  }

  const groupNames = [];

  raw.groups.forEach((group, index) => {
    const name = String(group?.name ?? "").trim();

    if (!name) {
      errors.push(`Group ${index + 1} has no name.`);
      return;
    }

    if (
      groupNames.some(
        (existing) => existing.toLowerCase() === name.toLowerCase(),
      )
    ) {
      errors.push(`The group "${name}" appears more than once.`);
      return;
    }

    groupNames.push(name);
  });

  const listings = [];
  const now = Date.now();

  raw.sarees.forEach((saree, index) => {
    const label = `Listing ${index + 1}`;
    const itemId = String(saree?.item_id ?? "").trim();

    if (!itemId) {
      errors.push(`${label} has no Item ID.`);
    }

    const selling = Number(saree?.selling_price);
    const purchase = Number(saree?.purchase_price);

    if (!Number.isFinite(selling) || selling < 0) {
      errors.push(`${label} has an invalid selling price.`);
    }

    if (!Number.isFinite(purchase) || purchase < 0) {
      errors.push(`${label} has an invalid purchase price.`);
    }

    const uploadDate = new Date(saree?.upload_date);

    if (Number.isNaN(uploadDate.getTime())) {
      errors.push(`${label} has an invalid upload date.`);
    }

    const photoData =
      typeof saree?.photo_data === "string"
        ? saree.photo_data
        : "";

    if (!photoData.startsWith("data:image/")) {
      errors.push(`${label} is missing its photo data.`);
    }

    const groupName = String(saree?.group_name ?? "").trim();

    if (
      groupName &&
      !groupNames.some(
        (name) => name.toLowerCase() === groupName.toLowerCase(),
      )
    ) {
      groupNames.push(groupName);
    }

    listings.push({
      item_id: itemId,
      selling_price: selling,
      purchase_price: purchase,
      group_name: groupName,
      upload_date: Number.isNaN(uploadDate.getTime())
        ? new Date(now).toISOString()
        : uploadDate.toISOString(),
      signature:
        saree?.signature && Array.isArray(saree.signature.hist)
          ? saree.signature
          : null,
      photo_data: photoData,
    });
  });

  return {
    ok: errors.length === 0,
    errors: errors.slice(0, 10),
    groupNames,
    listings,
    counts: {
      groups: raw.groups.length,
      sarees: raw.sarees.length,
    },
    exportedAt: raw.exported_at || null,
  };
}

export async function restoreBackup(validated, onProgress) {
  const existing = await fetchGroups();

  const byName = new Map(
    existing.map((group) => [
      group.name.trim().toLowerCase(),
      group,
    ]),
  );

  const createdGroupIds = [];
  const createdSareeIds = [];

  try {
    for (const name of validated.groupNames) {
      const key = name.toLowerCase();

      if (!byName.has(key)) {
        const created = await createGroup(name);

        byName.set(key, created);
        createdGroupIds.push(created.id);
      }
    }

    for (let i = 0; i < validated.listings.length; i++) {
      const listing = validated.listings[i];

      let signature = listing.signature;

      if (!signature) {
        try {
          signature = await computeSignature(
            dataUrlToFile(
              listing.photo_data,
              `${listing.item_id || "saree"}.jpg`,
            ),
          );
        } catch {
          signature = null;
        }
      }

      const group = listing.group_name
        ? byName.get(listing.group_name.toLowerCase())
        : null;

      const created = await createSaree({
        item_id: listing.item_id,
        selling_price: listing.selling_price,
        purchase_price: listing.purchase_price,
        group_id: group?.id || "",
        group_name: group?.name || "",
        photo_uri: listing.photo_data,
        upload_date: listing.upload_date,
        signature,
      });

      createdSareeIds.push(created.id);

      onProgress?.(i + 1, validated.listings.length);
    }

    return {
      sarees: createdSareeIds.length,
      groups: createdGroupIds.length,
    };
  } catch (error) {
    try {
      for (const id of createdSareeIds) {
        await deleteSaree(id);
      }
    } catch {
      /* Keep the original error. */
    }

    try {
      for (const id of createdGroupIds) {
        await deleteGroup(id);
      }
    } catch {
      /* Keep the original error. */
    }

    throw error;
  }
}

export { clearEverything };
