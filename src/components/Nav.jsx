import React from 'react'
import useAuth from '../hooks/useAuth';
import {NavLink , useNavigate} from 'react-router-dom'
import axios from '../api/axios';
import defualImg from '../assets/defualt.png'


function Nav(props) {
  const socket = props.socket ;
  const req = props.req;
  const unreadMsg = props.unreadMsg;
  const  {auth , setAuth}  = useAuth();

  const navigate = useNavigate();

  const axiosPrivate = axios.create({
    headers : {
        'Authorization' : `Bearer ${auth?.currentUser?.accessToken}`
    },
    withCredentials: true
  });
  

  const logOut = async () => {
    props.setLoading(true);
    try{
      await axios.get('/logout').then(res => {
        props.setLoading(false)
        setAuth({}); 
        navigate('/login');
      })
      await socket?.emit('logout');
    } catch (err) {
      props.setLoading(false)
      console.log(err);
      setAuth({});
    }
  }

  console.log(auth)


  return (
    <nav className='nav'>
          {auth?.currentUser ? (
            <ul>
                <li title='frinds'>
                    <NavLink to='/friends'>
                      <i className="fa-solid fa-users"></i>
                      {req?.length > 0 && 
                        <span className='req'>{req?.length}</span>
                      }
                    </NavLink>
                </li>
                <li title='search for frinds'><NavLink to='/search'><i className="fa-solid fa-magnifying-glass"></i></NavLink></li>
                <li title='start chating with friends'>
                  <NavLink to='/chats'>
                    <i className="fa-solid fa-comment-dots"></i>
                    {unreadMsg.length > 0 &&
                      <span className='req'>{unreadMsg?.length}</span>
                    }
                  </NavLink>
                </li>
                <li title='settings'>
                  <NavLink to='/settings'>
                    <div className='user-info'>
                      <img src={auth?.currentUser?.image ? auth.currentUser.image : defualImg} alt='your-img' />
                      <h3>@{auth.currentUser.username}</h3>
                    </div>
                  </NavLink>
                </li>
                <li onClick={logOut} title='logout'><i className="fa-solid fa-right-from-bracket"></i></li>
            </ul>
          ):
          (
            <ul>
              <li title='register'>
                <NavLink to='/register'>
                  <i className="fa-solid fa-user-plus"></i>
                </NavLink>
              </li>
              <li title='Login'>
                <NavLink to='/login'>
                  <i className="fa-solid fa-right-to-bracket"></i>
                </NavLink>
              </li>
            </ul>
          )
            
          }
  

    </nav>
  )
}

export default Nav