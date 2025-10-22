/**
 * Generates a unique SKU with the structure: vendorid-uniquecode
 * @param vendorId - The vendor's ID
 * @param productName - Optional product name to create a more meaningful unique code
 * @returns A unique SKU string
 */
export function generateUniqueSKU(vendorId: number, productName?: string): string {
  // Create a timestamp-based unique code
  const shortId1 = crypto.randomUUID().substring(0, 6);
  const shortId2 = crypto.randomUUID().substring(0, 6);

  // If product name is provided, create a meaningful prefix
  let productPrefix = '';
  if (productName) {
    // Take first 3 characters of each word, max 2 words
    const words = productName.trim().split(/\s+/).slice(0, 2);
    productPrefix = words
      .map(word => word.substring(0, 3).toUpperCase())
      .join('')
      .substring(0, 6); // Max 6 characters
  }
  
  // Combine components: vendorid-productprefix-shortId1-shortId2
  const uniqueCode = [
    productPrefix,
    shortId1,
    shortId2
  ].filter(Boolean).join('-');
  
  return `${vendorId}-${uniqueCode}`;
}

/**
 * Generates a simple unique SKU with just vendor ID and shortId
 * @param vendorId - The vendor's ID
 * @returns A simple unique SKU string
 */
export function generateSimpleSKU(vendorId: number): string {
  const shortId = crypto.randomUUID().substring(0, 6);
  return `${vendorId}-${shortId}`;
}
