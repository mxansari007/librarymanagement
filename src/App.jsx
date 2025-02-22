import {Routes,Route} from 'react-router-dom'
import OwnerLoginSignUp from './pages/owner/OwnerLoginSignUp.jsx'
import OwnerDashboard from './pages/owner/Dashboard.jsx'
import Owner from './pages/owner/Owner.jsx'
import Home from './pages/owner/Home.jsx'
import OwnerManageLibrary from './pages/owner/Library.jsx'
import OwnerManageAdmins from './pages/owner/Admin.jsx'
import OwnerSettings from './pages/owner/Settings.jsx'
import Landing from './pages/Landing.jsx'


// librarian imports
import Librarian from './pages/librarian/Librarian.jsx'
import LibrarianLoginSignUp from './pages/librarian/LibrarianLoginSignUp.jsx'
import LibrarianDashboard from './pages/librarian/Dashboard.jsx'
import LibrarianHome from './pages/librarian/Home.jsx'


// member imports
import Member from './pages/member/Member.jsx'
import MemberLoginSignUp from './pages/member/MemberLoginSignUp.jsx'
import MemberDashboard from './pages/member/Dashboard.jsx'
import MemberHome from './pages/member/Home.jsx'


function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="owner" element={<Owner />}>
          <Route index element={<OwnerLoginSignUp />} />
        <Route path="dashboard" element={<OwnerDashboard />}>
          <Route index element={<Home />} />
          <Route path="library" element={<OwnerManageLibrary />} />
          <Route path="admin" element={<OwnerManageAdmins />} />
          <Route path="settings" element={<OwnerSettings />} />
        </Route>


      </Route>

      <Route path="librarian" element={<Librarian />} >
        <Route index element={<LibrarianLoginSignUp />} />
        <Route path="dashboard" element={<LibrarianDashboard />}>
          <Route index element={<LibrarianHome />} />
        </Route>
      </Route>


        <Route path="member" element={<Member />} >
          <Route index element={<MemberLoginSignUp />} />
          <Route path="dashboard" element={<MemberDashboard />}>
            <Route index element={<MemberHome />} />
          </Route>
      </Route>


    </Routes>
   </>
  )
}

export default App
