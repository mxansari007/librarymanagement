import { Navigate, Outlet } from "react-router-dom";
const OwnerPrivateRoutes = () => {
  let auth = { token: localStorage.getItem("owner_token") };

  return auth.token ? <Outlet /> : <Navigate to="/owner" />;
};

export default OwnerPrivateRoutes;
