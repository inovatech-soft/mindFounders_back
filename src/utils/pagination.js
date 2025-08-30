/**
 * Pagination utilities
 */

/**
 * Calculate pagination metadata
 */
export function getPaginationData(page, pageSize, totalCount) {
  const currentPage = Math.max(1, parseInt(page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(pageSize) || 20));
  const offset = (currentPage - 1) * limit;
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    currentPage,
    limit,
    offset,
    totalPages,
    totalCount,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
}

/**
 * Create cursor-based pagination for messages
 */
export function createMessageCursor(message) {
  return Buffer.from(`${message.createdAt.getTime()}-${message.id}`).toString('base64');
}

/**
 * Parse cursor for message pagination
 */
export function parseMessageCursor(cursor) {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const [timestamp, id] = decoded.split('-');
    return {
      timestamp: new Date(parseInt(timestamp)),
      id
    };
  } catch (error) {
    return null;
  }
}

/**
 * Build pagination response
 */
export function buildPaginationResponse(items, pagination, cursor = null) {
  return {
    items,
    pagination: {
      ...pagination,
      ...(cursor && { cursor })
    }
  };
}
