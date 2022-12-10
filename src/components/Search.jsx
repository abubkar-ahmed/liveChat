import React from 'react'
import useAuth from '../hooks/useAuth'
import axios  from '../api/axios';
import defualImg from '../assets/defualt.png'
import Loading from './Loading';

function Search() {
  const {auth } = useAuth();
  const [inputs , setInputs] = React.useState({user : ''});
  const [searchedList , setSeList] = React.useState([]);
  const [friendList , setFrindList] = React.useState([]);
  const [errMsg , setErrMsg] = React.useState(null);
  const [notFound , setNotFound] = React.useState('');
  const [loading , setLoading] = React.useState(false);


  const inputHandler = (e) => {
    setErrMsg(null)
    const { name , value } = e.target ;
    setInputs((prevInputs) => {
      return {...prevInputs , [name] : value} ;
    })
  }

  const axiosPrivate = axios.create({
    headers : {
        'Authorization' : `Bearer ${auth?.currentUser?.accessToken}`
    },
    withCredentials: true
  });

  
  const submitHandler = (e) => {
    e.preventDefault();
    setErrMsg(null)
    if(inputs.user === ''){
      setErrMsg('Please Enter Valied username')
    }else {
      getNewList();
    }
    
  }

  const getNewList = async () => {
    setErrMsg(null);
    setLoading(true);
    try {
      const response = await axiosPrivate.get(`/friends/${inputs.user}`);
      console.log(response);
      setSeList(response?.data.filter((e) => {
        return e.username !== auth?.currentUser?.username
      }));
      setLoading(false)
      
    } catch (err) {
      console.error(err);
      setErrMsg("Somthing Went Wrong Try Again Later"); 
      setLoading(false)
    }
  }


  const Controlles = (props) => {
    const data = props.data
    if(!data?.status){
      return (
        <button className='add' onClick={() => {addFriend(data?.username)}}><i className="fa-solid fa-user-plus"></i></button>
      )
    } else if(data.status === 1){
      return (
        <div className="friend-req">
                  <button className='req-sent'>Sent <i className="fa-solid fa-check"></i></button>
                  <button className="delete" onClick={() => {removeFriend(data?.username)}}>Delete</button>
        </div>
      )
    } else if(data.status === 2){
      return (
        <div className='friend-req'>
          <button className='confirm' onClick={() => {acceptFriend(data.username)}}>Confirm</button>
          <button className='delete ' onClick={() => {removeFriend(data?.username)}}>Delete</button>
        </div>
      )
    } else if(data.status === 3) {
      return (
        <button className='checked' onClick={() => {removeFriend(data?.username)}}><i className="fa-solid fa-user-check"></i></button>
      )
    }
    
  }

  React.useEffect(() => {
    if(inputs.user !== '' && searchedList.length === 0){
      setNotFound(`No Users Found For "${inputs.user}"`);
    }
  },[searchedList]);


  const cards = searchedList.map((e) => {
    return (
      <div className="card" key={e.id}>
        <img src={e.image ? e.image : defualImg} alt='user-image'/>
        <div>
              <h2>@{e?.username}</h2>
              <h3>{e?.fullname}</h3>
              <Controlles data={e}/>
        </div>
      </div>
    )
  })

  const acceptFriend = async (user) => {
    setErrMsg(null)
    setLoading(true)
    try {
      const response = await axiosPrivate.put(`/friends` , {user : user});
      console.log(response);
      getNewList()
    } catch (err) {
      setLoading(false)
      console.error(err); 
      setErrMsg("Somthing Went Wrong Try Again Later");
    }
  }
  
  

  

  const addFriend = async (user) => {
    setErrMsg(null)
    setLoading(true)
    try {
      const response = await axiosPrivate.post(`/friends` , {user : user});
      console.log(response);
      getNewList()
    } catch (err) {
      setLoading(true)
      console.error(err); 
      setErrMsg("Somthing Went Wrong Try Again Later");
    }
  }


  const removeFriend = async (user) => {
    setErrMsg(null)
    setLoading(true)
    try {
      const response = await axiosPrivate.delete(`/friends/${user}`);
      console.log(response);
      getNewList();

    } catch (err) {
      setLoading(false)
      console.error(err);
      setErrMsg("Somthing Went Wrong Try Again Later");
    }
  }

  



  return (
    <main className='search'>
      {errMsg && <div className='errMsg'><p>{errMsg}</p></div>}
      <div className="container">
        <form onSubmit={submitHandler}>
          <label htmlFor='search'>Search</label>
          <input type='text' name='user' placeholder='Search For A Friend...' onChange={inputHandler}/>
          <button><i className="fa-solid fa-magnifying-glass"></i></button>
        </form>
        <div className='list-container'>
          {cards}
          {notFound && <span className='not-found'>{notFound}</span>}
        </div>
        {loading && 
        <div className="loading-container">
        <Loading />
        </div>
        }
      </div>
    </main>
  )
}

export default Search