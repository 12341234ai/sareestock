# ARUNIKA — Saree Collection Studio

A website-first, pink-and-white saree organizer that runs in a browser and stores its collection locally in IndexedDB. The optional install/offline shell is an enhancement; the project is a website and does not require an APK or native Android app.

## Run the website locally

Serve the project folder over HTTP (rather than `file://`):

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## Features

- Dashboard, supplier groups, gallery, local photo search, guide, and settings
- Separate Item ID, selling price, purchase price, and supplier group per uploaded photo
- Image decoding validation, JPEG compression, Blob-to-data-URL conversion, and safe staged batch saves
- Duplicate Item ID warning that shows saved listing details/photos and each pending photo's correct preview/details
- Confirmed individual deletion from Gallery and Photo Search
- Photo similarity uses normalized RGB histogram and difference hash; it is an estimate, not AI or proof of identity
- 30-day expiry and cleanup when the website opens or returns to the foreground (not while closed)
- JSON backup/restore validation and atomic IndexedDB restore
- Optional PWA manifest and offline shell cache

## GitHub Pages deployment

From the repository root after uploading `Arunika-Final-Working.zip` into Codespaces:

```bash
unzip -o Arunika-Final-Working.zip -d /tmp/arunika-working
cp -r /tmp/arunika-working/Arunika/. .
git add .
git commit -m "Fix Arunika photo upload conversion and duplicate review"
git push
```

Then GitHub: **Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save**.

## Data safety

The website retains `ArunikaDB`, the `records` object store, and its `groups` and `offers` records. Deploying to the same origin keeps access to the existing browser database. Back up regularly. Browser/site-data clearing may erase saved data. Expiry cleanup only happens while the website is running or is reactivated.

## Verification report

JavaScript syntax checks and ZIP integrity are verified. I attempted a Playwright/Chromium live test, but this environment blocks both `http://127.0.0.1` and `file://` navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`; therefore browser upload/persistence, photo search, deletion, backup/restore, mobile viewport, and offline behavior could not be honestly marked as end-to-end passed in this session.
