import React from 'react'
import useAuth from '../hooks/useAuth'
import axios from '../api/axios';
import defualImg from '../assets/defualt.png'



function Settings() {
  const {auth , setAuth} = useAuth();

  const [showNameEdit , setShowNameEdit] = React.useState(false);
  const [showPwdEdit , setShowPwdEdit] = React.useState(false);

  const [img , setImg] = React.useState('');
  const [displayImg , setdisplayImg] = React.useState(auth?.currentUser?.image ? auth.currentUser.image : defualImg);
  const [newName , setNewName] = React.useState('');
  const [newPwd , setNewPwd] = React.useState({
    oldPwd : '',
    newPwd : '',
    rNewPwd : ''
  });

  const [errMsg , setErrMsg] = React.useState(null);

  const nameRef = React.useRef();
  const oldRef = React.useRef();
  const newRef = React.useRef();
  const rNewRef = React.useRef();


  const axiosPrivate = axios.create({
    headers : {
        'Authorization' : `Bearer ${auth?.currentUser?.accessToken}`
    },
    withCredentials: true
  });

  React.useEffect(() => {
    removeClass()
    setErrMsg(null);
  },[newName , newPwd.oldPwd , newPwd.newPwd , newPwd.rNewPwd]);

  const removeClass = () => {
    nameRef?.current?.classList?.remove('invailed');
    oldRef?.current?.classList?.remove('invailed');
    newRef?.current?.classList?.remove('invailed');
    rNewRef?.current?.classList?.remove('invailed');

  }

  const newNameSubmitHandler = async (e) => {
    e.preventDefault();
    if(newName !== ''){
      try{
        const editName = await axiosPrivate.put('/edit-user',{newName , type : 'name'});

        const currentUser = editName?.data;
        setAuth({currentUser});
        console.log(editName);
        setShowNameEdit(false)
      }catch(err) {
        console.log(err)
        setErrMsg('Somthing Went Wrong Try Again Latter.');
      }
    }else{
      setErrMsg('New Name Is Required .');
      nameRef.current.classList.add('invailed');
    }
  }


  const pwdChangeHandler = (e) => {
    const { name , value } = e.target ;
    setNewPwd((prev) => {
      return {...prev , [name] : value} ;
    })
  }


  const newPwdSubmitHandler = async (e) => {
    e.preventDefault();
    try{
      const editName = await axiosPrivate.put('/edit-user',{newPwd , type : 'pwd'});
      setShowPwdEdit(false);      
    }catch(err) {
      console.log(err)
      if(err?.response?.status === 400){
        setErrMsg('All Fields Are Required.');
        checkEmptyFields();
        
      }else if(err?.response?.status === 401){
        setErrMsg("Wrong Password.");
        oldRef.current.classList.add('invailed');
      }else if(err?.response?.status === 409){
        newRef.current.classList.add('invailed');
        rNewRef.current.classList.add('invailed');
        setErrMsg('Passwords Do Not Match.');
      }else {
        setErrMsg('Somthing Went Wrong Try Again Latter.')
      }
    }
    
  }


  const checkEmptyFields = () => {
    if(newPwd.oldPwd === ''){
      oldRef.current.classList.add('invailed');
    }
    if(newPwd.newPwd === ''){
      newRef.current.classList.add('invailed');
    }
    if(newPwd.rNewPwd === ''){
      rNewRef.current.classList.add('invailed');
    }
  }  

  const fileHandle = (e) => {
    setImg(e.target.files[0]);
  }

  React.useEffect(() => {
    changeImg();
  },[img]);

  const changeImg = async () => {
    if(img !== ''){
      let formData = new FormData();
      formData.append('img' , img);
      formData.append('type' , 'img-update');

      const axios1 = axiosPrivate.create({
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      try{
        const response = await axios1.put('/edit-user',formData);
        window.location.reload();
      }catch (err) {
        setErrMsg('Somthing Went Wrong Try Again Later.')
      }
    }
  }


  const close = () => {
    setErrMsg(null);
    setShowPwdEdit(false);
    setShowNameEdit(false);
  }

  return (
    <main className='settings'>
      <div className='settings-container'>
        <h2>@{auth?.currentUser?.username} Info</h2>
        {errMsg && <h3 className='err'>{errMsg}</h3>}
        <div className='img-container'>
          <img src={displayImg} alt='Your-image' />
          <label htmlFor="file"><i className="fa-solid fa-pen"></i></label>
          <input type='file' name='file' id='file' accept=".png, .jpg, .jpeg, " onChange={fileHandle}/>
        </div>
        {(!showNameEdit && !showPwdEdit) && (
              <div className="current-user-info">
                <ul>
                  <li className='full-name'>
                    <div>
                      <i className="fa-solid fa-pen-clip icon"></i>
                      <span className="title">Name :</span>
                    </div>
                    <span className='info'>{auth?.currentUser?.fullname}</span>
                    <i className="fa-solid fa-pen-to-square edit" title='Edit Name' onClick={() => setShowNameEdit(prev => !prev)}></i>
                  </li>
                  <li className='password'>
                    <div>
                      <i className="fa-solid fa-key icon"></i>
                      <span className='title'>Password :</span>
                    </div>
                    <span className='info'>*******</span>
                    <i className="fa-solid fa-pen-to-square edit" title='Edit Password' onClick={() => setShowPwdEdit(prev => !prev)}></i>
                  </li>
                </ul>
            </div>
        )}
        {showNameEdit && (
          <form className='edit-form' onSubmit={newNameSubmitHandler}>
            <input type='text' name='fullname' placeholder='Enter New Name' onChange={(e) => setNewName(e.target.value)} ref={nameRef} className='test'/>
            <div className='buttons'>
              <button>Save</button>
              <button onClick={close} className='close'>Close</button>
            </div>
          </form>
        )}
        {showPwdEdit && (
          <form className='edit-form' onSubmit={newPwdSubmitHandler}>
            <input type='password' name='oldPwd' placeholder='Enter Old Password' onChange={pwdChangeHandler} ref={oldRef} />
            <input type='password' name='newPwd' placeholder='Enter New Password' onChange={pwdChangeHandler} ref={newRef}/>
            <input type='password' name='rNewPwd' placeholder='Enter Repeted New Password' onChange={pwdChangeHandler} ref={rNewRef}/>
            <div className="buttons">
              <button>Save</button>
              <button className='close' onClick={close}>Close</button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}

export default Settings