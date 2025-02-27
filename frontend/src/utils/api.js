import axios from "axios";
import { logout } from "./auth";

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
      // Handle 401 Unauthorized errors by logging out the user
      if (error.response && error.response.status === 401) {
        // Get user role from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = user.role || '';
        
        // Call logout function with the appropriate role
        logout(role);
      }
      
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