// API base URL - change this to match your backend URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
};

// Helper function to set auth token in localStorage
const setAuthToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
};

// Helper function to remove auth token from localStorage
const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
  }
};

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add auth token if available
  if (token) {
    headers["auth-token"] = token;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.errors?.[0]?.msg || "Request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// -------------------- AUTH API --------------------
export const authAPI = {
  signUp: async (name, email, password) => {
    const data = await apiCall("/api/auth/signUp", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (data.authToken) setAuthToken(data.authToken);
    return data;
  },

  login: async (email, password) => {
    const data = await apiCall("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.authToken) setAuthToken(data.authToken);
    return data;
  },

  getUser: async () => {
    return apiCall("/api/auth/getUser", { method: "POST" });
  },

  logout: () => removeAuthToken(),

  isAuthenticated: () => !!getAuthToken(),
};

// -------------------- PASSWORD API --------------------
export const passwordAPI = {
  getPasswords: async (searchQuery = "") => {
    const query = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : "";
    return apiCall(`/api/password/getPasswords${query}`, { method: "GET" });
  },

  addPassword: async (title, username, password) => {
    return apiCall("/api/password/addPassword", {
      method: "POST",
      body: JSON.stringify({ title, username, password }),
    });
  },

  updatePassword: async (id, title, username, password) => {
    const body = {};
    if (title) body.title = title;
    if (username) body.username = username;
    if (password) body.password = password;

    return apiCall(`/api/password/updatePassword/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  deletePassword: async (id) => {
    return apiCall(`/api/password/deletePassword/${id}`, { method: "DELETE" });
  },

  checkStrength: async (id) => {
    return apiCall(`/api/password/checkstrength/${id}`, { method: "POST" });
  },
};

export { getAuthToken, setAuthToken, removeAuthToken };
