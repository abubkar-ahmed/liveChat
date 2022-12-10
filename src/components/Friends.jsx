import React from 'react'
import useAuth from '../hooks/useAuth'
import axios from '../api/axios';
import defualImg from '../assets/defualt.png'
import Loading from './Loading';


function Friends(props) {
  const {auth} = useAuth();
  const [friendList , setFriendList] = React.useState([]);
  const [reqList , setReqList] = React.useState([]);
  const [sentList , setSentList] = React.useState([]);
  const [errMsg , setErrMsg] = React.useState(null);
  const [displayStatus , setDisplayStatus] = React.useState(3);
  const [displayFriend , setDisplayFriend] = React.useState();
  const [indecator , setI] = React.useState(false);
  const [loading , setLoading] = React.useState(false);
  const frRef = React.useRef();
  const reqRef = React.useRef();
  const seRef = React.useRef();


  const axiosPrivate = axios.create({
    headers : {
        'Authorization' : `Bearer ${auth?.currentUser?.accessToken}`
    },
    withCredentials: true
  });

  const getFriends = async () => {
    if(auth?.currentUser){
      setLoading(true);
      try{
        const response = await axiosPrivate.get('/friends-info');
        console.log(response)
        setFriendList(response?.data?.frindArr);
        setReqList(response?.data?.requestArr);
        setSentList(response?.data?.waitingArr);
        props.setReq(response?.data?.requestArr);
        setLoading(false)
      }catch(err) {
        setLoading(false)
        console.log(err)
      }
    }

  }

  React.useEffect(() => {
    getFriends()
    frRef.current.classList.add('active');
  },[auth])
  
  const removeFriend = async (user) => {
    setErrMsg(null)
    setDisplayFriend(false)
    setLoading(true)
    try {
      const response = await axiosPrivate.delete(`/friends/${user}`);
      console.log(response);
      getFriends();

    } catch (err) {
      console.error(err);
      setLoading(false)
      setErrMsg("Somthing Went Wrong Try Again Later");
    }
  }

  const acceptFriend = async (user) => {
    setErrMsg(null)
    setDisplayFriend(false)
    setLoading(true)
    try {
      const response = await axiosPrivate.put(`/friends` , {user : user});
      console.log(response);
      getFriends();
    } catch (err) {
      setLoading(false)
      console.error(err); 
      setErrMsg("Somthing Went Wrong Try Again Later");
    }
  }

  const friendsCards = friendList.map((e) => {
    return (
      <div className="card" key={e.id} >
        <img src={e?.image ? e?.image : defualImg} alt='user-image'/>
        <div>
              <h2>@{e?.username}</h2>
              <h3>{e?.fullname}</h3>
                <button className='show-info' onClick={() => setDisplayFriend(e)} title='info'><i className="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>
    )
  })

  const reqCards = reqList.map((e) => {
    return (
      <div className="card" key={e.id}>
        <img src={e?.image ? e?.image : defualImg} alt='user-image'/>
        <div>
              <h2>@{e?.username}</h2>
              <h3>{e?.fullname}</h3>
              <div className='friend-req'>
                <button className='confirm' onClick={() => {acceptFriend(e.username)}}>Confirm</button>
                <button className='delete ' onClick={() => {removeFriend(e?.username)}}>Delete</button>
              </div>
        </div>
      </div>
    )
  })

  const sentCards = sentList.map((e) => {
    return (
      <div className="card" key={e.id}>
        <img src={e?.image ? e?.image : defualImg} alt='user-image'/>
        <div>
              <h2>@{e?.username}</h2>
              <h3>{e?.fullname}</h3>
              <div className="friend-req">
                  <button className='req-sent'>Sent <i className="fa-solid fa-check"></i></button>
                  <button className="delete" onClick={() => {removeFriend(e?.username)}}>Delete</button>
              </div>
        </div>
      </div>
    )
  })

  const showFriends = () => {
    setDisplayStatus(3);
    frRef.current.classList.add('active');
    reqRef.current.classList.remove('active');
    seRef.current.classList.remove('active');
  }
  const showReq = () => {
    setDisplayStatus(2)
    frRef.current.classList.remove('active');
    reqRef.current.classList.add('active');
    seRef.current.classList.remove('active');
  }
  const showSe = () => {
    setDisplayStatus(1)
    frRef.current.classList.remove('active');
    reqRef.current.classList.remove('active');
    seRef.current.classList.add('active');
  }

  React.useEffect(() => {
    if(displayFriend){
      setI(true)
    }else {
      setI(false)
    }
  },[displayFriend])

  const DisplayFriend = () => {
    return (
      <div className='friend-container'>
        <div className='friend-container-control'>
          <h2>{displayFriend?.fullname} Profile</h2>
          <button onClick={() => setDisplayFriend(false)}>X</button>
        </div>
        <div className='card-container'>
          <img src={displayFriend?.image ? displayFriend?.image : defualImg} alt='user-image'/>
          <div className='info-container'>
            <ul>
              <li className='username'>
                <div>
                  <i className="fa-solid fa-user"></i> 
                  <span className="title">User:</span>
                </div>
                <span className='info'>@{displayFriend?.username}</span>
              </li>
              <li className='full-name'>
                <div>
                <i className="fa-solid fa-pen-clip"></i>
                  <span className="title">Name:</span>
                </div>
                <span className='info'>{displayFriend?.fullname}</span>
              </li>
              <li className='email'>
                <div>
                  <i className="fa-solid fa-envelope"></i>
                  <span className="title">Email:</span>
                </div>
                <span className='info'><a href={`mailto:${displayFriend?.email}`}>{displayFriend?.email}</a></span>
              </li>
            </ul>

          </div>
          <div className='buttons'>
            <button onClick={() => {removeFriend(displayFriend?.username)}} className='del'>Delete @{displayFriend?.username}</button>
          </div>
        </div>
      </div>
    )
  } 

  

  return (
  <main className='search'>
    <div className="container">
      <nav className='friend-nav'>
        <ul >
          <li ref={frRef} onClick={showFriends}>
            Friends
            <span>{friendList.length}</span>
          </li>
          <li ref={reqRef} onClick={showReq}>
            Requests
            <span>{reqList.length}</span>
          </li>
          <li ref={seRef} onClick={showSe}>
            Sent
            <span>{sentList.length}</span>
          </li>
        </ul>
      </nav>
      <div className='list-container'>
        {displayStatus === 3 
        ?
        friendsCards 
        :
        (
          displayStatus === 2 
          ? 
          reqCards
          :
          sentCards
        )
        }
      </div>
      {loading && 
        <div className="loading-container">
          <Loading />
        </div>
       }
    </div>

    {indecator && <DisplayFriend/>}
  </main>
  )
}

export default Friends