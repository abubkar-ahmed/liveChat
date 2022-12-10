import React from 'react'
import { Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth';
import Login from '../components/Login';

function ProtectedRoutes2() {
    const { auth } = useAuth();


  return (
    <>
        {auth.currentUser ? (<Outlet />) : (<Login />)}
    </>
  )
}

export default ProtectedRoutes2