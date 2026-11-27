

import {
  clearStore,
  getAll,
  newId,
  put,
  putMany,
  remove,
} from "@/lib/localStore";

const SAREES = "sarees";
const GROUPS = "groups";
const ITEM_ID_COUNTER_KEY = "arunika_next_item_number";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price_high", label: "Selling price: high to low" },
  { value: "price_low", label: "Selling price: low to high" },
  { value: "purchase_high", label: "Purchase price: high to low" },
  { value: "purchase_low", label: "Purchase price: low to high" },
];

const time = (value) => new Date(value || 0).getTime();

function sortSarees(list, sort) {
  const copy = [...list];

  switch (sort) {
    case "oldest":
      copy.sort((a, b) => time(a.upload_date) - time(b.upload_date));
      break;
    case "price_high":
      copy.sort((a, b) => (b.selling_price || 0) - (a.selling_price || 0));
      break;
    case "price_low":
      copy.sort((a, b) => (a.selling_price || 0) - (b.selling_price || 0));
      break;
    case "purchase_high":
      copy.sort((a, b) => (b.purchase_price || 0) - (a.purchase_price || 0));
      break;
    case "purchase_low":
      copy.sort((a, b) => (a.purchase_price || 0) - (b.purchase_price || 0));
      break;
    default:
      copy.sort((a, b) => time(b.upload_date) - time(a.upload_date));
  }

  return copy;
}

export async function fetchGroups() {
  const groups = await getAll(GROUPS);
  return groups.sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""))
  );
}

export async function countGroups() {
  return (await getAll(GROUPS)).length;
}

export async function fetchSarees({
  search = "",
  groupId = "all",
  sort = "newest",
  limit = 500,
} = {}) {
  const term = String(search || "").trim().toLowerCase();
  let list = await getAll(SAREES);

  if (term) {
    list = list.filter((saree) =>
      (saree.item_id_search || "").includes(term)
    );
  }

  if (groupId === "unassigned") {
    list = list.filter((saree) => !saree.group_id);
  } else if (groupId && groupId !== "all") {
    list = list.filter((saree) => saree.group_id === groupId);
  }

  return sortSarees(list, sort).slice(0, limit);
}

export async function countSarees() {
  return (await getAll(SAREES)).length;
}

/**
 * Automatically reserves the next available AR numbers.
 */
export async function reserveNextItemNumbers(count = 1) {
  const amount = Math.max(0, Math.floor(Number(count) || 0));

  if (amount === 0) return [];

  const sarees = await getAll(SAREES);
  let highestNumber = 100;

  for (const saree of sarees) {
    const match = String(saree.item_id || "")
      .trim()
      .match(/^AR(\d+)$/i);

    if (match) {
      highestNumber = Math.max(highestNumber, Number(match[1]));
    }
  }

  try {
    const savedNext = Number(
      window.localStorage.getItem(ITEM_ID_COUNTER_KEY)
    );

    if (Number.isSafeInteger(savedNext) && savedNext > 100) {
      highestNumber = Math.max(highestNumber, savedNext - 1);
    }
  } catch {
    // Continue using existing records.
  }

  const firstNumber = highestNumber + 1;
  const nextNumber = firstNumber + amount;

  try {
    window.localStorage.setItem(
      ITEM_ID_COUNTER_KEY,
      String(nextNumber)
    );
  } catch {
    // Continue without persistent counter.
  }

  return Array.from(
    { length: amount },
    (_, index) =>
      `AR${String(firstNumber + index).padStart(3, "0")}`
  );
}

export async function findDuplicates(itemId) {
  const term = String(itemId || "").trim().toLowerCase();

  if (!term) return [];

  const list = await getAll(SAREES);

  return list.filter(
    (saree) => saree.item_id_search === term
  );
}

export async function findByIds(itemId) {
  const term = String(itemId || "").trim().toLowerCase();

  if (!term) return [];

  const list = await getAll(SAREES);

  return list.filter(
    (saree) => (saree.item_id_search || "").includes(term)
  );
}

export async function fetchAllSarees(limit = 1000) {
  const list = await getAll(SAREES);
  return sortSarees(list, "newest").slice(0, limit);
}

export async function fetchGroupCounts() {
  const list = await getAll(SAREES);
  const map = {};

  list.forEach((saree) => {
    const key = saree.group_id || "";
    map[key] = (map[key] || 0) + 1;
  });

  return map;
}

export async function fetchDashboard() {
  const now = Date.now();
  const weekAgo = now - 7 * 86400000;

  const [sarees, groups] = await Promise.all([
    getAll(SAREES),
    getAll(GROUPS),
  ]);

  return {
    total: sarees.length,
    groups: groups.length,
    expiring: 0,
    recent: sarees.filter(
      (saree) => time(saree.upload_date) >= weekAgo
    ).length,
    latest: sortSarees(sarees, "newest").slice(0, 4),
  };
}

export async function createSaree(input) {
  const uploadDate = input.upload_date || new Date().toISOString();

  const record = {
    id: newId(),
    created_date: new Date().toISOString(),
    item_id: input.item_id,
    item_id_search: String(input.item_id || "").trim().toLowerCase(),
    selling_price: input.selling_price,
    purchase_price: input.purchase_price,
    group_id: input.group_id || "",
    group_name: input.group_name || "",
    group_name_search: String(input.group_name || "").toLowerCase(),
    photo_uri: input.photo_uri || "",
    upload_date: uploadDate,
    expiry_date: null,
    signature: input.signature || null,
  };

  await put(SAREES, record);
  return record;
}

export async function deleteSaree(id) {
  await remove(SAREES, id);
}

export async function createGroup(name) {
  const clean = String(name || "").trim();

  const record = {
    id: newId(),
    created_date: new Date().toISOString(),
    name: clean,
    name_search: clean.toLowerCase(),
  };

  await put(GROUPS, record);
  return record;
}

export async function saveGroup({ id, name }) {
  const clean = String(name || "").trim();

  if (!id) return createGroup(clean);

  const groups = await getAll(GROUPS);
  const existing = groups.find((group) => group.id === id);

  if (!existing) return createGroup(clean);

  const updated = {
    ...existing,
    name: clean,
    name_search: clean.toLowerCase(),
  };

  await put(GROUPS, updated);

  const sarees = await getAll(SAREES);
  const affected = sarees.filter((saree) => saree.group_id === id);

  if (affected.length) {
    await putMany(
      SAREES,
      affected.map((saree) => ({
        ...saree,
        group_name: clean,
        group_name_search: clean.toLowerCase(),
      }))
    );
  }

  return updated;
}

export async function unassignGroup(groupId) {
  const sarees = await getAll(SAREES);

  const affected = sarees.filter(
    (saree) => saree.group_id === groupId
  );

  if (affected.length) {
    await putMany(
      SAREES,
      affected.map((saree) => ({
        ...saree,
        group_id: "",
        group_name: "",
        group_name_search: "",
      }))
    );
  }
}

export async function deleteGroup(groupId) {
  await remove(GROUPS, groupId);
}

/**
 * Automatic expiry is disabled.
 * Sarees remain saved until manually deleted.
 */
export async function cleanupExpired() {
  return 0;
}

export async function clearEverything() {
  await clearStore(SAREES);
  await clearStore(GROUPS);
}
