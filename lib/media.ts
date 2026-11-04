/**
 * Centralized helper for generating URLs for images:
 * - If ID is a local URL (/api/images/..., /uploads/...), return as-is
 * - If ID is a full http/https URL, return as-is
 * - If ID is a Google Drive file ID, route through our fast local /api/drive-proxy
 *   which pulls the image, converts to raw binary bytes, and caches it in PostgreSQL (BYTEA)!
 */
export function getThumbUrl(id?: string | null, width = 800): string {
  if (!id) return '';
  const cleanId = String(id).trim();

  // If already a local route or full web URL
  if (cleanId.startsWith('/api/') || cleanId.startsWith('/uploads/') || cleanId.startsWith('http://') || cleanId.startsWith('https://')) {
    return cleanId;
  }

  // Google Drive file ID: route through our local byte-caching proxy
  return `/api/drive-proxy?id=${encodeURIComponent(cleanId)}&w=${width}`;
}
