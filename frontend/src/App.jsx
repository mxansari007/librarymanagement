import { Routes, Route } from "react-router-dom";
import OwnerLoginSignUp from "./pages/owner/OwnerLoginSignUp.jsx";
import OwnerDashboard from "./pages/owner/Dashboard.jsx";
import Owner from "./pages/owner/Owner.jsx";
import Home from "./pages/owner/Home.jsx";
import OwnerManageLibrary from "./pages/owner/Library.jsx";
import OwnerManageLibrarian from "./pages/owner/Librarian.jsx";
import OwnerSettings from "./pages/owner/Settings.jsx";
import Landing from "./pages/Landing.jsx";

// librarian imports
import Librarian from "./pages/librarian/Librarian.jsx";
import LibrarianLoginSignUp from "./pages/librarian/LibrarianLoginSignUp.jsx";
import LibrarianDashboard from "./pages/librarian/Dashboard.jsx";
import LibrarianHome from "./pages/librarian/Home.jsx";
import ManageBooks from "./pages/librarian/ManageBooks.jsx";
import ManageMembers from "./pages/librarian/ManageMembers.jsx";
import ManageTransactions from "./pages/librarian/ManageTransactions.jsx";
import LibrarianSettings from "./pages/librarian/Settings.jsx";

// member imports
import Member from "./pages/member/Member.jsx";
import MemberLoginSignUp from "./pages/member/MemberLoginSignUp.jsx";
import MemberDashboard from "./pages/member/Dashboard.jsx";
import MemberHome from "./pages/member/Home.jsx";
import RequestBook from "./pages/member/RequestBook.jsx";
import MyBooks from "./pages/member/MyBooks.jsx";
import Pending from "./pages/member/Pending.jsx";
import PendingPrivateRoutes from "./PendingPrivateRoute.jsx";
import MemberSettings from "./pages/member/Settings.jsx";

import OwnerPrivateRoutes from "./OwnerPrivateRoutes.jsx";
import LibrarianPrivateRoutes from "./LibrarianPrivateRoutes.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="owner" element={<Owner />}>
          <Route index element={<OwnerLoginSignUp />} />

          <Route element={<OwnerPrivateRoutes />}>
            <Route path="dashboard" element={<OwnerDashboard />}>
              <Route index element={<Home />} />
              <Route path="library" element={<OwnerManageLibrary />} />
              <Route path="librarian" element={<OwnerManageLibrarian />} />
              <Route path="settings" element={<OwnerSettings />} />
            </Route>
          </Route>
        </Route>

        <Route path="librarian" element={<Librarian />}>
          <Route index element={<LibrarianLoginSignUp />} />
          <Route element={<LibrarianPrivateRoutes />}>
            <Route path="dashboard" element={<LibrarianDashboard />}>
              <Route index element={<LibrarianHome />} />
              <Route path="books" element={<ManageBooks />} />
              <Route path="members" element={<ManageMembers />} />
              <Route path="transactions" element={<ManageTransactions />} />
              <Route path="settings" element={<LibrarianSettings />} />
            </Route>
          </Route>
        </Route>

        <Route path="member" element={<Member />}>
          <Route element={<PendingPrivateRoutes />}>
            <Route path="pending" element={<Pending />} />
          </Route>
          <Route index element={<MemberLoginSignUp />} />
          <Route path="dashboard" element={<MemberDashboard />}>
            <Route index element={<MemberHome />} />
            <Route path="request-book" element={<RequestBook />} />
            <Route path="mybooks" element={<MyBooks />} />
            <Route path="settings" element={<MemberSettings />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
