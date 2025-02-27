import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // Replace with your actual API base URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Ensures cookies are sent with requests
});

const handleResponse = async (request) => {
    try {
      const response = await request;
      return { success: true, data: response.data }; // ✅ Return success flag
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Something went wrong";
      return { success: false, error: errorMessage };  // ❌ Don't throw an error
    }
  };
  

const apiRequest = (method, endpoint, data = {}, token = "") => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return handleResponse(
    API({
      method,
      url: endpoint,
      data: method !== "GET" ? data : {},
      headers,
      params: method === "GET" ? data : {},
    })
  );
};

export default apiRequest;

// apiRequest("post", "/book-request", { bookId: 1 }, userToken)