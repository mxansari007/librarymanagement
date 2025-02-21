import {Routes,Route} from 'react-router-dom'
import OwnerLoginSignUp from './pages/owner/OwnerLoginSignUp.jsx'
import OwnerDashboard from './pages/owner/Dashboard.jsx'
import Owner from './pages/owner/Owner.jsx'
import Home from './pages/owner/Home.jsx'
import OwnerManageLibrary from './pages/owner/Library.jsx'
import OwnerManageAdmins from './pages/owner/Admin.jsx'
import OwnerSettings from './pages/owner/Settings.jsx'
import Landing from './pages/Landing.jsx'
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
    </Routes>
   </>
  )
}

export default App
