/**
 * Saree photos are stored in this browser as image data, so the stored value
 * is already displayable. No signing or downloading is needed.
 */

export async function getSignedUrl(photoData) {
  return photoData || null;
}

export function clearSignedUrlCache() {
  /* nothing to clear: photos live in browser storage */
}