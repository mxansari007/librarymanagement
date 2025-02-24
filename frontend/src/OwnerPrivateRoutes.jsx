import { Navigate, Outlet } from 'react-router-dom'
import { useEffect,useState } from 'react'
const OwnerPrivateRoutes = () => {
  
  let auth = {token:localStorage.getItem('token')}


return (
    auth.token? <Outlet/> : <Navigate to='/owner'/>
  )
}

export default OwnerPrivateRoutes;