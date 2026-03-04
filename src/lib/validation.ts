/**
 * Validation utilities for API endpoints
 */

/**
 * Validate UUID format (v4)
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validate and sanitize pagination parameters
 * @param limit - Items per page (default: 10, max: 100)
 * @param offset - Starting position (default: 0, min: 0)
 * @returns Validated { limit, offset } or error message
 */
export function validatePaginationParams(
  limit?: string | null,
  offset?: string | null
): { valid: boolean; limit: number; offset: number; error?: string } {
  let parsedLimit = 10;
  let parsedOffset = 0;

  // Validate limit
  if (limit) {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum)) {
      return { valid: false, limit: 0, offset: 0, error: 'Invalid limit parameter - must be an integer' };
    }
    if (limitNum < 0) {
      return { valid: false, limit: 0, offset: 0, error: 'Limit must be non-negative' };
    }
    if (limitNum > 100) {
      return { valid: false, limit: 0, offset: 0, error: 'Limit cannot exceed 100' };
    }
    parsedLimit = limitNum;
  }

  // Validate offset
  if (offset) {
    const offsetNum = parseInt(offset, 10);
    if (isNaN(offsetNum)) {
      return { valid: false, limit: 0, offset: 0, error: 'Invalid offset parameter - must be an integer' };
    }
    if (offsetNum < 0) {
      return { valid: false, limit: 0, offset: 0, error: 'Offset must be non-negative' };
    }
    parsedOffset = offsetNum;
  }

  return { valid: true, limit: parsedLimit, offset: parsedOffset };
}

/**
 * Validate accountId as UUID
 */
export function validateAccountId(accountId: string | null): { valid: boolean; error?: string } {
  if (!accountId) {
    return { valid: true }; // accountId is optional
  }

  if (!isValidUUID(accountId)) {
    return { valid: false, error: 'Invalid accountId format - must be a valid UUID' };
  }

  return { valid: true };
}
