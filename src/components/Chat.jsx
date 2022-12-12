import React from 'react'
import useAuth from '../hooks/useAuth';
import axios from '../api/axios'
import { nanoid } from 'nanoid'
import moment from 'moment';
import defualImg from '../assets/defualt.png'
import Loading from './Loading';




function Chat(props) {
  const socket = props.socket ;
  const unreadMsg = props.unreadMsg ;
  const {auth } = useAuth();
  const [invailedToken , setInvailedToken] = React.useState(false);
  const [friendList , setFriendList] = React.useState([]);
  const [friendList1 , setFriendList1] = React.useState([]);
  const [msg , setMsg] = React.useState("");
  const [room , setRoom] = React.useState('');
  const [sendTo , setsendTo] = React.useState({});
  const [sendToStatus , setSendToStatus] = React.useState({});
  const [showChat , setShowChat] = React.useState(false);
  const [massegs , setMasseges] = React.useState([]);
  const [massegs1 , setMasseges1] = React.useState([]);
  const [showControls , setShowControls] = React.useState(false);
  const [showImg , setShowImg] = React.useState(false);
  const [lastMsg , setLastMsg] = React.useState([]);
  const [onlineStatus , setOnlineStatus] = React.useState([]);
  const [search , setSearch] = React.useState('');
  const [loading , setLoading] = React.useState(false);

  

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
        setFriendList(response?.data?.frindArr);
        setFriendList1(response?.data?.frindArr);
        setLoading(false);
      }catch(err) {
        console.log(err);
        setLoading(false);
      }
    }

  }

  React.useEffect(() => {
    getFriends() ;  
  },[auth]);

  React.useEffect(() => {
    for(let i = 0 ; i < friendList.length ; i++) {
      socket.emit("join_room", {room : friendList[i].room , user : auth?.currentUser?.username})
      socket.emit("get_last_Msg", {room : friendList[i].room , author : auth?.currentUser?.username})
    }

    socket?.on('onilne_users1' , (data) => {
      setOnlineStatus(data)
    })


  }, [friendList])

  React.useEffect(() => {
    if(search !== ''){
      setFriendList1(friendList)
      filterdList();
    }else {
      setFriendList1(friendList)
    } 
  },[search])

  const filterdList = async () => {
    setFriendList1(prev => {
      return prev.filter(e => {
        return e.username.includes(search)
      })
    })
  }

  const submitHandler = (e) => {
    e.preventDefault();
    setFriendList1(friendList)
    filterdList();
  }

  React.useEffect(()=>{
    setFriendList1(prev => {
      return prev.map(e => {
        const last = lastMsg.filter(elemnt => {
          return elemnt.to === e.username
        })
        if(last[0]){
          return {...e , last : last[0]?.massege?.date}
        }else{
          return {...e , last :"0000 00/00 00:00 0"}
        }
      })
    })
  },[lastMsg]);



  const splitDate = (a) => {
    const b = a.split(' ');
    return `${b[1]} ${b[2]}`
  }

  
  const friendsCards = friendList1.sort((a,b) => a?.last > b?.last ? -1 : 1 ).map((e) => {
    const last = lastMsg.filter(elemnt => {
      return elemnt.to === e.username
    })
    let className ;
    const thisOnlineStatus = onlineStatus.filter(element => {
      return element.username === e.username;
    })
    if(thisOnlineStatus[0]?.lastSeen === 'online'){
      className = 'green_status'
    }else {
      className = 'gray_status'
    }
    let date ; 
    if(last[0]){
      date = splitDate(last[0].massege.date);
      
    }

    const unreadFilter = unreadMsg.filter(j => {
      return j.sentBy === e.username
    })
    

    return (
      <div className="card" key={e.id} onClick={() => chatHandler(e)}>
        <span className={className}>
          <img src={e?.image ? e?.image : defualImg} alt='user-image'/>
        </span>
        <div>
              <h2>@{e?.username}
              {(unreadFilter.length > 0 && unreadFilter[0].msgs !== 0) &&
                <span className="unread-msg">{unreadFilter[0].msgs}</span>
              }
              </h2>
              {last[0]?.massege ? 
              <h3 id='last-msg'>
                <p>
                  {last[0].massege?.msg.slice(0,20)}
                  
                  {last[0].massege?.sentBy === auth?.currentUser?.username ? 
                  <i className="fa-solid fa-check"></i>
                  :
                  null
                  }
                </p> 
                <span>{date}</span>
              </h3>
              : 
              <h3>
                No Masseges
              </h3>
              }
        </div>
      </div>
    )
  })

  const chatHandler = (e) => {
    setRoom(e.room);
    setsendTo(e);
    setShowChat(true);
  }

  React.useEffect(() => {
    setMasseges([])
    if(room !== ""){
      socket.emit("join_room", {room : room , user : auth?.currentUser?.username})
  
      socket.on("connect_error", (err) => {
        if(err) {
          console.log(err)
          setInvailedToken(true);
        }else {
          setInvailedToken(false);
        } 
      });

      socket.emit('get_all_messages', {room : room , author : auth?.currentUser?.username});

      
      socket?.on("messages", (data) => {
        
        for(let i = 0 ; i < data.arrayOfMessages.length ; i++) {
          data.arrayOfMessages[i].room = data.chatRoom
          
        }
        setMasseges(data.arrayOfMessages)
        setMasseges1(data.arrayOfMessages)
      });

      if(onlineStatus.length > 0) {
        const thisOnlineStatus = onlineStatus.filter(element => {
          return element.username === sendTo?.username;
        })
        
        setSendToStatus(thisOnlineStatus[0]);
        
      }

  
      
    }
  },[room])

  const getCurrentDate = () => {
    const hour = () => {
      let h = moment().hour();
        if(h >= 0 && h <= 9){
          h = `0${h}`;
        }
        return h ;
    }

    const min = () => {
      let m = moment().minute();
      if(m >= 0 && m <= 9){
        m = `0${m}`;
      }
      return m ;
    }


    const date = `${moment().year()} ${moment().month() + 1}/${moment().date()} ${hour()}:${min()} ${moment().second()}`

    return date ;
  }
  

  const chatSubmit = async (e) => {
    e.preventDefault();
    if(msg !== ''){
      const messageData = {
        room: room,
        author: auth?.currentUser?.username,
        to : sendTo.username,
        message: msg,
        date: getCurrentDate() 
      };

      await socket.emit("send_message", messageData , (response) => {
        console.log(response);
      });
      setMasseges(prev => {
        return [...prev , {sentBy:messageData.author , msg : msg , date : getCurrentDate() , room : room}]
      });
      setMasseges1(prev => {
        return [...prev , {sentBy:messageData.author , msg : msg , date : getCurrentDate() , room : room}]
      });

      setLastMsg(prev => {
        const newArr = prev.filter(e => {
          return e.to !== sendTo.username
        });
        newArr.push({
          room : room,
          to : sendTo.username,
          massege : {sentBy : auth?.currentUser?.username , msg : msg , date : getCurrentDate()}
        })
        return newArr ;
      })
      setMsg('')
    }
  }



  

  React.useEffect(() => {
    if(socket) {
      socket?.on("receive_message", (info) => {
        const data = info.data;
        const unread = info.unreadMsg;
        console.log(data)
        
        let currentRoom = '';
        setRoom(prev => {
          currentRoom = prev ;
          return prev
        });

        if(data.room !== currentRoom){
          props.setUnreadMsg(unread.filter(e => {
            return e.msgs !== 0
          }));
        }
        
        setMasseges(prev => {
          return [...prev , {sentBy:data.author , msg : data.message , date : data.date , room : data.room}]
        });
        

        setLastMsg(prev => {
          const newArr = prev.filter(e => {
            return e.to !== data.author
          });
          newArr.push({
            room : data.room,
            to : data.author,
            massege : {sentBy : data.author , msg : data.message , date : data.date}
          })
          return newArr ;
        });



        
      })


      socket?.on('get_last_msg' ,(data) => {
        if(data.length > 0){
          const theLastMsgIndex = data[0].arrayOfMessages.length - 1
          setLastMsg(prev => {
            return [...prev , {
              room : data[0].chatRoom,
              to : data[0].to,
              massege : data[0].arrayOfMessages[theLastMsgIndex]
            }]
          })
        }
      })

      socket?.on('onilne_users' ,  (data) => {
         setOnlineStatus(data);
      });

      
    }

  },[socket]);



  React.useEffect(() => {
    if(onlineStatus.length > 0) {
      if(sendTo.username){
      const thisOnlineStatus = onlineStatus.filter(element => {
        return element.username === sendTo?.username;
      })
      setSendToStatus(thisOnlineStatus[0]);
      }
    }
  },[onlineStatus])

  const bottomRef = React.useRef(null);
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: 'auto'});
    if(socket && (massegs !== []) && (room !== '')){
      socket?.emit('clear_unread_msg' , {room : room});
    }
  }, [massegs]);


  const clearChat = async () => {
    const data = {
      author: auth.currentUser.username,
      to : sendTo.username,
      room : room
    }

    await socket.emit("clear_chat", data);
    setMasseges([])
    setShowControls(prev => !prev);
  }

  const hideChat = () => {
    setShowChat(false);
    setMasseges1([]);
    setMasseges([]);
    setRoom('')
  }

  return (
    <main className='search chat'>
      <div className='container'>
        <form onSubmit={submitHandler}>
          <label htmlFor='search'>Search</label>
          <input type='text' name='user' placeholder='Search For A Chat...' onChange={(e) => setSearch(e.target.value)} value={search}/>
          {search && <p onClick={() => {setSearch('')}}>X</p>}
        </form>
        <div className="list-container">
          {friendsCards}
        </div>
        {loading && 
        <div className="loading-container">
          <Loading />
        </div>
        }
      </div>
      {showChat && (
        <div className='friend-container' >
          <div className='friend-nav'>
            <div className='go-back' onClick={hideChat}>
              <i className="fa-solid fa-arrow-left"></i>
            </div>
            <div className='container-1'>
                <img src={sendTo?.image ? sendTo?.image : defualImg} alt='image' onClick={() => setShowImg(prev => !prev)}/>
                <div>
                  <h2>@{sendTo.username}</h2>
                  <h3>
                    <span className={sendToStatus?.lastSeen === 'online' ? 'green_status' : 'gray_status'}></span>
                    {sendToStatus?.lastSeen === 'online' ? 
                      'online' :
                      `last seen : ${sendToStatus?.lastSeen}`
                    }
                  </h3>
                </div>
            </div>

            <div className='controls'>
              <i className="fa-solid fa-trash-can"
                onClick={() => setShowControls(prev => !prev)}
              ></i>

            </div>
          </div>
          <div className='chat-container' >
              {
                massegs.map(e => {
                  if(e.room === room){
                    const date = splitDate(e.date)
                    return (
                      <div className={
                      e.sentBy === auth.currentUser.username ? 
                      'from-me' :
                      'recived-msg'} key={nanoid()}>
                        <p>
                          {e.msg}
                        </p>
                        <span className='date'>{date}</span>
                      </div>
  
                    )
                  }

                })
              }
            <div ref={bottomRef} />
          </div>
          <form onSubmit={chatSubmit}>
            <input type='text' name='masseag' onChange={(e) => setMsg(e.target.value)} placeholder='Type Yout Message Here' value={msg}/>
            <button>
            <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
      {showImg &&     
      <div className='img-preview' onClick={() => setShowImg(prev => !prev)}>
        <img src={sendTo.image ? sendTo.image : defualImg} alt='image' />
      </div>}
      {showControls &&               
        <div className='options'>
          <div className='options-container'>
            <p>Are you sure you want to delete this chat with @{sendTo.username} </p>
            <div className="option-buttons">
              <button onClick={clearChat}>Yes, Delete</button>
              <button className='cancel' onClick={() => setShowControls(prev => !prev)}>No, Cancel</button>
            </div>
          </div>

        </div>
      }
    </main>
  )
}

export default Chat