import React from "react";
import { useState } from 'react';
import {Routes , Route} from 'react-router-dom';
import Header from './components/Header';
import Nav from './components/Nav';
import Register from './components/Register';
import Login from './components/Login';
import Main from './components/Main';
import Search from './components/Search';
import Chat from './components/Chat';
import Settings from './components/Settings';
import useAuth from './hooks/useAuth';
import useRefreshToken from './hooks/useRefreshToken';
import Friends from "./components/Friends";
import io from 'socket.io-client' ;
import ProtectedRoutes from "./protectedRoutes/ProtectedRoutes";
import ProtectedRoutes2 from "./protectedRoutes/ProtectedRoutes2";
import axios from './api/axios';
import Loading from "./components/Loading";
function App() {

  const  {auth , setAuth}  = useAuth();
  const [socket , setSocket] = React.useState(null)
  const [req , setReq] = React.useState('');
  const [unreadMsg , setUnreadMsg] = React.useState([]);
  const [loading , setLoading] = React.useState(true);

  React.useEffect(() => {
    if(auth?.currentUser){
      setSocket(io.connect("https://livechatapi.onrender.com" , {
        auth : {
          token : auth?.currentUser?.accessToken,
          user : auth?.currentUser?.username
        }
      }))
    }
    setReq(auth?.currentUser?.friendsList.filter(e => {
      return e.status === 2 ; 
    }))
    
  },[auth])

  const refresh = useRefreshToken();

  const refreshFunction = async () => {
    try {
      const ref = await refresh();
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refreshFunction() ; 
  },[])

  React.useEffect(() => {
    socket?.on('unreadMsg' , (data) => {
      setUnreadMsg(data.filter(e => {
        return e.msgs !== 0
      }));
    })
  },[socket]);
  

  
  return (
    <>
      {
        loading ? (
          <div className="main-loading">
            <Loading />
          </div>
        )
        :
        (
          <>
          <Header/>
          <div className="main">
            <Nav 
              socket={socket} 
              req={req} 
              setReq={setReq} 
              unreadMsg = {unreadMsg}
              loading= {loading}
              setLoading={setLoading}
            />
            <Routes >
              <Route element={<ProtectedRoutes2/>}>
                  <Route path='/' element={<Main />} />
                  <Route path='/friends' element={<Friends req={req} setReq={setReq} />} />
                  <Route path='/search' element={<Search />} />
                  <Route path='/chats' element={<Chat socket={socket} unreadMsg = {unreadMsg} setUnreadMsg={setUnreadMsg}/>} />
                  <Route path='/settings' element={<Settings />} />
              </Route>
              <Route element={<ProtectedRoutes/>}>
                <Route path='/register' element={<Register />} />
                <Route path='/login' element={<Login/>} />
              </Route>
            </Routes>
          </div>
          </>
        )
      }
    </>


  )
}

export default App
