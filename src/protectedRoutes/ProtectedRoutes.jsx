import React from 'react'
import { Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth';
import Friends from '../components/Friends';


function ProtectedRoutes() {
    const { auth } = useAuth();

    return (
        <>
            {auth.currentUser ? (<Friends />) : (<Outlet />)}
        </>
    )
}

export default ProtectedRoutes



