# Arunika — Saree Organizer

A static, Android-friendly saree supplier offer organizer for GitHub Pages.

## Features
- Pink and white Arunika branding and dedication.
- Supplier groups and multiple saree photos per upload.
- Optional item ID and required selling price for every photo.
- Gallery with supplier, item/design ID and price search, filters and sorting.
- Photo Search by item ID or reference photo.
- Clickable search results show the supplier, item ID and selling price; listings can be deleted from the result.
- Exact matching item IDs are displayed as 100% ID matches.
- Photo similarity is a lightweight colour-histogram estimate, not AI and not proof of identity.
- Manual JSON backup and restore; clear-all confirmation.
- Beginner-friendly How to Use page and PWA service worker.

## Privacy and storage
Records are stored in IndexedDB in the current browser profile on the current device. There is no server, login, cloud sync, or automatic backup. Export and transfer backups manually. Browser storage may be cleared or evicted.

## Publish using GitHub Codespaces
1. Upload `Arunika-GitHub-Pages.zip` into your Codespaces file explorer.
2. In the terminal run:
   ```bash
   unzip -o "Arunika-GitHub-Pages.zip"
   ```
   If your uploaded file has `(1)` in its name, use that exact name in the command.
3. Copy the contents of the extracted folder into the repository root:
   ```bash
   cp -r Arunika/* .
   ```
4. Commit and push:
   ```bash
   git add .
   git commit -m "Update Arunika saree organizer"
   git push
   ```
5. In GitHub open **Settings → Pages → Build and deployment**. Select **Deploy from a branch**, choose `main` and `/(root)`, then Save.

Expected site: https://12341234ai.github.io/sareestock/

## Important limitation
The photo percentage is a rough colour-profile similarity score. Different sarees with similar colours may score highly, and the same saree photographed under different lighting may score lower. A 100% result means the entered item ID matches exactly; it is not an independent visual verification.
\n\n### Add Sarees price fields\nFor each uploaded saree photo, enter a required Item ID, your Selling Price, and the Bought/Purchase Price you paid. Both prices are saved in local browser storage and included in JSON backups. Gallery cards and listing details show both prices.\n