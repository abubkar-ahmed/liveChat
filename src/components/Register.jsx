import React from 'react'
import { useState } from 'react'
import { NavLink , useNavigate } from 'react-router-dom'
import axios from 'axios';
import defualImg from '../assets/defualt.png'
import Loading from './Loading';

function Register() {

  const [img , setImg] = useState('');
  const [imgPrev, setImgPrev] = useState(defualImg);
  const [inputs , setInputs] = useState({
    'fullname' : '',
    'user' : '',
    'email' : '',
    'pwd' : '',
    'rPwd' : '',
  });
  const [errMsg , setErrMsg] = useState('');
  const [ab, setAb]= React.useState('');
  const [loading , setLoading] = React.useState(false);

  const navigate = useNavigate();

  const imgRef = React.useRef();
  const nameRef = React.useRef();
  const userRef = React.useRef();
  const emailRef = React.useRef();
  const pwdRef = React.useRef();
  const rPwdRef = React.useRef();



  React.useEffect(() => {
    userRef.current.classList.remove('invailed');
    nameRef.current.classList.remove('invailed');
    imgRef.current.classList.remove('invailed');
    emailRef.current.classList.remove('invailed');
    pwdRef.current.classList.remove('invailed');
    rPwdRef.current.classList.remove('invailed');
    setErrMsg(null)
    
  },[inputs])

  const fileHandle = (e) => {
    setImg(e.target.files[0])
    setImgPrev(URL.createObjectURL(e.target.files[0]));
    console.log(e.target.files[0])
  }

  const inputHandler = (e) => {
    const { name , value } = e.target ;
    setInputs((prevInputs) => {
      return {...prevInputs , [name] : value} ;
    })
  }

  const submitHandler = (e) => {
    e.preventDefault();

    setLoading(true)
    let formData = new FormData();

    formData.append('img' , img);
    formData.append('fullname' , inputs.fullname);
    formData.append('user' , inputs.user);
    formData.append('email' , inputs.email);
    formData.append('pwd' , inputs.pwd);
    formData.append('rPwd' , inputs.rPwd);
    



    

    const axios1 = axios.create({
      baseURL: 'https://livechatapi.onrender.com',
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    });

    axios1.post("/register" ,formData).then((res) => {
      setErrMsg('');
      setLoading(false)
      navigate('/login')
    }).catch(err => {
      setLoading(false)
      console.log(err)
      if(err?.response?.status === 400) {
        if(err?.response?.data?.message === 'Please Add An Image'){
          setErrMsg('Please Add An Image');
          imgRef.current.classList.add('invailed');
        }else{
          emptyInputs();
          setErrMsg('All Fileds Are Required');
        }
      } else if (err?.response?.status === 409) {
        if(err?.response?.data?.message === 'Username is Already Taken'){
          userRef.current.classList.add('invailed');
          setErrMsg('Username is Already Taken');
        }
        if(err?.response?.data?.message === 'Email is Already Registerd'){
          emailRef.current.classList.add('invailed');
          setErrMsg('Email is Already Taken');
        }
        if(err?.response?.data?.message === 'Password Must Be same As Repeated Password'){
          rPwdRef.current.classList.add('invailed');
          setErrMsg('Passwords do not match');
        }
        if(err?.response?.data?.message === 'Invalied User Name'){
          userRef.current.classList.add('invailed');
          setErrMsg('username must start with a letter or a digit and have no spaces or special character except - or _ , and have to be 3 To 12 Character');
        }
        else{
          setErrMsg(err?.response?.data?.message);
        }
      }else{
        setErrMsg('Something Went Wrong Please Try Again Later!')
      }
    })
  }



  const emptyInputs = () => {
    if(inputs.fullname === ''){
      nameRef.current.classList.add('invailed');
    }
    if(inputs.user === ''){
      userRef.current.classList.add('invailed');
    }
    if(inputs.email === ''){
      emailRef.current.classList.add('invailed');
    }
    if(inputs.pwd === ''){
      pwdRef.current.classList.add('invailed');
    }
    if(inputs.rPwd === ''){
      rPwdRef.current.classList.add('invailed');
    }
  }

  
  return (
    <main className='register'>
      {errMsg && <div className='errMsg'><p>{errMsg}</p></div>}
      <div className='container'>
          <h3>Sign Up</h3>
          <form onSubmit={submitHandler}>
          <div className='img-upload'>
            <label htmlFor="file"><i className="fa-solid fa-pencil"></i></label>
            <input type='file' name='file' onChange={fileHandle} ref={imgRef} id='file' />
            <div className="img-prev">
    
              <div className='img' style= {{"backgroundImage": `url(${imgPrev})`}}>
              </div>
            </div>
          </div>
          <input type='text' placeholder='Name...' name='fullname' onChange={inputHandler} ref={nameRef}/>
            <input type='text' placeholder='User Name...' name='user' onChange={inputHandler} ref={userRef}/>
            <input type='email' placeholder='Email...' name='email' onChange={inputHandler} ref={emailRef}/>
            <input type='password' placeholder='Password...' name='pwd' onChange={inputHandler} ref={pwdRef}/>
            <input type='password' placeholder='Repeated Password...' name='rPwd' onChange={inputHandler} ref={rPwdRef}/>
            {loading ? (
                <Loading />
            ) : (
              <button>
                Sing Up 
                <i className="fa-solid fa-share-from-square"></i>
              </button>
            )}
          </form>
          <p>Already have an account? <NavLink to='/login'> Sign in and get started!</NavLink></p>
      </div>
    </main>
  )
}

export default Register