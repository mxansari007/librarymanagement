import {Routes,Route} from 'react-router-dom'
import OwnerLoginSignUp from './pages/owner/OwnerLoginSignUp.jsx'
import OwnerDashboard from './pages/owner/Dashboard.jsx'
import Owner from './pages/owner/Owner.jsx'


function App() {

  return (
    <>
    <Routes>
      <Route path="owner" element={<Owner />}>
          <Route index element={<OwnerLoginSignUp />} />
        <Route path="dashboard" element={<OwnerDashboard />} />
      </Route>
    </Routes>
   </>
  )
}

export default App
