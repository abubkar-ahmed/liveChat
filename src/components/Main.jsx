import React from 'react'
import useAuth from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom' ;

function Main() {
  const {auth} = useAuth() ;
  const navigate = useNavigate();
  React.useEffect(() => {
    if(auth?.currentUser){
      navigate('/friends');
    }else{
      navigate('/login');
    }
  },[auth])
  return (
    <>
    </>
  )
}

export default Main