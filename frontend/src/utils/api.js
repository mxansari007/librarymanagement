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
    return { 
      success: true, 
      data: response.data,
      statusCode: response.status // Include status code in successful responses
    };
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
    const statusCode = error.response?.status || 500; // Default to 500 if no status code
    
    return { 
      success: false, 
      error: errorMessage,
      statusCode // Include status code in error responses
    };
  }
};

const apiRequest = (method, endpoint, data = {}, options = {}) => {
  const { token, headers = {} } = options;
  
  // Merge authorization token with custom headers if token is provided
  const requestHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers
  };

  return handleResponse(
    API({
      method,
      url: endpoint,
      data: method !== "GET" ? data : {},
      headers: requestHeaders,
      params: method === "GET" ? data : {},
    })
  );
};

export default apiRequest;