export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function shouldRetryRequest(statusCode) {
  return statusCode === 429 || statusCode === 408 || statusCode === 503;
}

export function getRetryDelayMs(attempt, baseDelayMs = 1200) {
  return baseDelayMs * (attempt + 1);
}

export async function fetchJsonWithRetry(url, headers, { retries = 4, baseDelayMs = 1200, fetchImpl = fetch } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetchImpl(url, { headers });

    if (shouldRetryRequest(response.status)) {
      if (attempt >= retries) {
        throw new Error(`EasyBroker API error: ${response.statusText || 'Too Many Requests'}`);
      }

      const waitMs = getRetryDelayMs(attempt, baseDelayMs);
      console.warn(`EasyBroker rate limit hit. Retrying in ${waitMs}ms...`);
      await sleep(waitMs);
      continue;
    }

    if (!response.ok) {
      throw new Error(`EasyBroker API error: ${response.statusText}`);
    }

    return response.json();
  }

  throw lastError || new Error('EasyBroker request failed');
}
