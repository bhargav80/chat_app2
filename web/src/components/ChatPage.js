import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {io} from 'socket.io-client';

import styles from '../styles/ChatPage.module.css';
import Message from './Message';

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const [socket, setSocket] = useState(null);
  const [sending, setSending] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState();
  const messageRef = useRef("");

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:8000`);
    setSocket(newSocket);
    
    
    newSocket.emit("join", {
      username: searchParams.get("username"),
      room: searchParams.get("room"),
    }, (error) => {
      if(error) {
        setError(error);
      }
    });

    
    newSocket.on("message", (message) => {
      setAllMessages((prevState) => [...prevState, message]);
    });

    
    newSocket.on("roomData", ({users}) => {
      setAllUsers([...users]);
    });

    
    return () => newSocket.close();
  }, [searchParams, error]);


  const sendMessageHandler = (event) => {
    event.preventDefault();
    setSending(true);

    socket.emit("sendMessage", messageRef.current.value, (error) => {
      setSending(false);
      messageRef.current.value = ""; 
      messageRef.current.focus(); 

      if (error) {
        console.log(error);
      } else {
        console.log("Message Sent!");
      }
    });
  };

  
  
  const messages = allMessages.map((message, idx) => <Message
    user={message.user}
    key={`msg-${idx}`}
    body={message.text}
    time={message.createdAt}
  />);

  const users = allUsers.map((user, idx) => (
      <li key={`user-${idx}`}>
        {user.username}
      </li>
    )
  );

  return (
    <div className={styles.ChatPage}>
      <div className={styles.ChatSidebar}>
        <h2 className={styles.RoomTitle}>{searchParams.get('room')}</h2>
        <h3 className={styles.ListTitle}>Users</h3>
        <ul className={styles.Users}>
          {users}
        </ul>
      </div>
      <div className={styles.ChatMain}>
        {
          error ? <div>{error}</div> : (
            <>
              <div className={styles.ChatMessages}>{messages}</div>
              <div className={styles.Compose}>
                <form onSubmit={sendMessageHandler}>
                  <input type="text" placeholder="Send Message" ref={messageRef} />
                  <button type="submit" disabled={sending}>Send</button>
                </form>
              </div>
            </>
          ) 
        }
      </div>
    </div>
  );
};

export default ChatPage;