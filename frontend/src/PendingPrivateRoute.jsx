
import { Navigate, Outlet } from 'react-router-dom'
const PendingPrivateRoutes = () => {
  
  let pending = {isPending:localStorage.getItem('pending_member')}


return (
    pending.isPending? <Outlet/> : <Navigate to='/member'/>
  )
}

export default PendingPrivateRoutes;