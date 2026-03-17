const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
}