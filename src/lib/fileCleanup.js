import { promises as fs } from 'fs';
import path from 'path';

/**
 * Deletes the physical uploaded file from disk if workSampleUrl points to /uploads/...
 * @param {string|null} url 
 */
export async function removeWorkSampleFile(url) {
  if (!url || typeof url !== 'string') return;

  let relativePath = url;
  if (url.includes('/uploads/')) {
    relativePath = '/uploads/' + url.split('/uploads/')[1];
  } else if (!url.startsWith('/uploads/')) {
    return;
  }

  try {
    const cleanPath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(process.cwd(), 'public', cleanPath);

    await fs.unlink(fullPath);
    console.log(`[fileCleanup] Deleted uploaded media file: ${fullPath}`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn(`[fileCleanup] Could not delete media file ${url}:`, err.message);
    }
  }
}

/**
 * Returns true ONLY if the status is explicitly "Posted" or "Posted / Completed".
 * @param {string} status 
 * @returns {boolean}
 */
export function isPostedStatus(status) {
  if (!status) return false;
  const s = status.toLowerCase().trim();
  return s === 'posted' || s === 'posted / completed';
}
