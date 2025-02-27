import { Navigate, Outlet } from "react-router-dom";

const LibrarianPrivateRoutes = () => {
  const token = localStorage.getItem("librarian_token");

  return token ? <Outlet /> : <Navigate to="/librarian" replace />;
};

export default LibrarianPrivateRoutes;
