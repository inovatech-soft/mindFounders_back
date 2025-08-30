/**
 * Server-Sent Events utilities for real-time chat streaming
 */

/**
 * Initialize SSE connection
 */
export function initSSE(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection event
  res.write('data: {"type":"connected"}\n\n');

  return res;
}

/**
 * Send SSE event
 */
export function sendSSEEvent(res, eventType, data) {
  try {
    const eventData = JSON.stringify({
      type: eventType,
      data,
      timestamp: new Date().toISOString()
    });
    
    res.write(`data: ${eventData}\n\n`);
  } catch (error) {
    console.error('SSE Error:', error);
  }
}

/**
 * Send SSE error
 */
export function sendSSEError(res, error, statusCode = 500) {
  const errorData = JSON.stringify({
    type: 'error',
    error: {
      message: error.message || 'Unknown error',
      statusCode
    },
    timestamp: new Date().toISOString()
  });
  
  res.write(`data: ${errorData}\n\n`);
}

/**
 * Close SSE connection
 */
export function closeSSE(res) {
  try {
    res.write('data: {"type":"close"}\n\n');
    res.end();
  } catch (error) {
    console.error('SSE Close Error:', error);
  }
}

/**
 * Send heartbeat to keep connection alive
 */
export function sendHeartbeat(res) {
  res.write(': heartbeat\n\n');
}
