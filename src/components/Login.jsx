import axios from '../api/axios';
import React from 'react'
import { NavLink , useNavigate} from 'react-router-dom'
import useAuth from '../hooks/useAuth';
import Loading from './Loading';

const LOGIN_URL = '/login';

function Login() {

  const { auth , setAuth } = useAuth();

  const [inputs , setInputs] = React.useState({
    'user' : '',
    'pwd' : '',
  });

  const [errMsg , setErrMsg] = React.useState('');
  const [loading , setLoading] = React.useState(false)

  const navigate = useNavigate();

  const userRef = React.useRef();
  const pwdRef = React.useRef();

  React.useEffect(() => {
    userRef.current.classList.remove('invailed');
    pwdRef.current.classList.remove('invailed');
    setErrMsg(null);
  },[inputs])

  const inputHandler = (e) => {
    const { name , value } = e.target ;
    setInputs((prevInputs) => {
      return {...prevInputs , [name] : value} ;
    })
  }


  const submitHandler = async (e) => {
    setLoading(true)
    setErrMsg('');
    e.preventDefault();
    try {
      const response = await axios.post(LOGIN_URL,
        JSON.stringify(inputs),
        {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        }
      );
      const currentUser = response?.data;
      setAuth({currentUser});
      navigate('/')
      setLoading(false)
      console.log(response)
    } catch (err) {
      setLoading(false)
      if(err?.response?.status === 400) {
          if(inputs.user === ''){
            userRef.current.classList.add('invailed');
          }
          if(inputs.pwd === ''){
            pwdRef.current.classList.add('invailed');
          }
          setErrMsg('All Filed Are Required');
      } else if (err?.response?.status === 401) {
          userRef.current.classList.add('invailed');
          pwdRef.current.classList.add('invailed');
          setErrMsg('Please Enter Vailed User And Password');
      } else {
        setErrMsg('Something Went Wrong Please Try Again Later !');
      }
    }

 
  }

  return (
    <main className='login'>
      {errMsg && <div className='errMsg'><p>{errMsg}</p></div>}
      <div className='container'>
        <h2>Welcome Back</h2>
        <h3>Sign In To Your Account</h3>
        <h4>Let's get you signed in and straight to chat with your friends</h4>
        <form onSubmit={submitHandler}>
          <label htmlFor='username'>User Name</label>
          <input type='text' placeholder='UserName...' name='user' id='username' onChange={inputHandler} ref={userRef}/>
          <label htmlFor='pwd'>Password</label>
          <input type='password' placeholder='Password...' name='pwd' id='pwd' onChange={inputHandler} ref={pwdRef}/>
          {loading ? (
              <Loading />
            ) : (
              <button>
                Sing In 
                <i className="fa-solid fa-right-to-bracket"></i>
              </button>
            )}
        </form>
        <p>Don't have an account? <NavLink to='/register'>Sign up and get started!</NavLink></p>
      </div>
    </main>
  )
}

export default Login