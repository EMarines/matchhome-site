const API_KEY = 'pqnjps13ry7iaudododsi455mg22mt'; // Staging Key
const BASE_URL = '/api'; // Using proxy to avoid CORS

export const getProperties = async (page = 1, limit = 20) => {
  try {
    // Note: We are ignoring the search param here because the API doesn't support generic text search.
    // We will handle search client-side by fetching a larger batch if needed.
    // However, to keep pagination working for the initial load, we respect page/limit.
    // But for search to work effectively client-side, the hook needs to handle it.
    
    const response = await fetch(`${BASE_URL}/properties?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'X-Authorization': API_KEY,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

export const getAllProperties = async () => {
  try {
    // Fetch up to 100 properties for client-side search
    // This respects the rate limit (1 request)
    const response = await fetch(`${BASE_URL}/properties?page=1&limit=100`, {
      method: 'GET',
      headers: {
        'X-Authorization': API_KEY,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.content || [];
  } catch (error) {
    console.error('Error fetching all properties:', error);
    return [];
  }
};

export const getCollaborations = async (page = 1, limit = 20) => {
  try {
    const response = await fetch(`${BASE_URL}/collaborations?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'X-Authorization': API_KEY,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    throw error;
  }
};

export const getProperty = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/properties/${id}`, {
      method: 'GET',
      headers: {
        'X-Authorization': API_KEY,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
};
