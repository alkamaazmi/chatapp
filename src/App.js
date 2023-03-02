import './App.css';
import {Box,Button,Input,HStack,Container,VStack} from '@chakra-ui/react';
import Message from './Components/Message';
import {app} from "./firebase"
import { useEffect, useState,useRef } from 'react';
import {onAuthStateChanged, getAuth, GoogleAuthProvider,signInWithPopup,signOut} from "firebase/auth";
import {getFirestore,addDoc,collection, serverTimestamp,query,
  orderBy, onSnapshot} from "firebase/firestore"
const auth=getAuth(app);
const db=getFirestore(app);
const loginHandler=()=>{
  const provider=new GoogleAuthProvider();
  signInWithPopup(auth,provider);
}

const logOutHandler=()=>{
  signOut(auth);
}

function App() {
  const q = query(collection(db,"Message"), orderBy("createAt", "asc"));
  const [user,setUser]=useState(false);
  const [message,setMessage]=useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const submitHandler=async (e)=>{
    e.preventDefault();
    try {
      setMessage("");
      await addDoc(collection(db,"Message"),{
        text:message,
        uid:user.uid,
        uri:user.photoURL,
        createAt:serverTimestamp()

      });
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      alert(error);
    }
  }

   useEffect(()=>{
       
       const unsubscribe=  onAuthStateChanged(auth,(data)=>{
          setUser(data);
         })
        const unsubscribeMessage= onSnapshot(q,(snap)=>{
             setMessages(snap.docs.map((item)=>{
              const id=item.id;
              return {id,...item.data()}
             }));
         })
         
         return ()=>{
          unsubscribe();
          unsubscribeMessage();
         }
  },[])
  return (
    <Box bg={"twitter.500"}>
      {
        user?(<Container h={"100vh"} bg={"white"}>
        <VStack h={"full"} bg={"telegram.100"}>
          <Button onClick={logOutHandler} colorScheme={"facebook"} w={"full"}>
            Logout
          </Button>
          <VStack h={"full"} w={"full"} bg={"purple.100"} overflow={"auto"}>
          {messages.map((item) => (
                <Message
                  key={item.id}
                  user={item.uid === user.uid ? "me" : "other"}
                  text={item.text}
                  uri={item.uri}
                />
              ))}
              <div ref={messagesEndRef} />
          </VStack>
          <form onSubmit={submitHandler} style={{width:"100%"}}>
            <HStack>
            <Input value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter a Message..."/>
            <Button type="s
            " colorScheme={"facebook"}>send</Button>
            </HStack>
          </form>
        </VStack>
  </Container>):(<VStack justifyContent={"center"} h={"100vh"}>
    <Button onClick={loginHandler}>Sign In with Google</Button>
  </VStack>)
      }
    </Box>
  );
}

export default App;
