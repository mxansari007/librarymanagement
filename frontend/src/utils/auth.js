import { useNavigate } from 'react-router-dom';

/**
 * Logout function that removes the appropriate token based on user role
 * and redirects to the corresponding login page
 * 
 * @param {string} role - The user role ('owner', 'librarian', or 'member')
 * @param {function} navigateFunc - Optional navigate function from useNavigate hook
 */
export const logout = (role, navigateFunc) => {
  // Clear user data from localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('route');
  
  // Remove the specific token based on role
  switch (role) {
    case 'owner':
      localStorage.removeItem('owner_token');
      if (navigateFunc) navigateFunc('/owner');
      break;
    case 'librarian':
      localStorage.removeItem('librarian_token');
      if (navigateFunc) navigateFunc('/librarian');
      break;
    case 'member':
      localStorage.removeItem('member_token');
      if (navigateFunc) navigateFunc('/member');
      break;
    default:
      // If role is not specified, clear all possible tokens
      localStorage.removeItem('owner_token');
      localStorage.removeItem('librarian_token');
      localStorage.removeItem('member_token');
      if (navigateFunc) navigateFunc('/');
  }
};

/**
 * Custom hook for logout functionality
 * @returns {Function} logout function that handles token removal and navigation
 */
export const useLogout = () => {
  const navigate = useNavigate();
  
  return (role) => {
    logout(role, navigate);
  };
};