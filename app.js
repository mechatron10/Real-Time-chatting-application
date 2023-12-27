require('dotenv').config();
var mongoose=require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
const app=require('express')();
const http=require('http').Server(app);
const userRoute=require("./routes/UserRoute.js");
const User=require('./models/userModel.js');
const Chat=require('./models/chatModel.js');

app.use('/',userRoute);

var io=require('socket.io')(http);
var usp= io.of('/user-namespace');
usp.on('connection',async function(socket){
      console.log('User Connected');
    
     var userId=socket.handshake.auth.token;
     await User.findByIdAndUpdate({_id:userId},{$set:{is_online:'1'}});
    
     socket.broadcast.emit('user-online',{user_id:userId});

      socket.on('disconnect',async function(){
        console.log("disconnected");
        await User.findByIdAndUpdate({_id:userId},{$set:{is_online:'0'}});
        socket.broadcast.emit('user-offline',{user_id:userId});
      })
      
      socket.on('emit-chat',function(data){
        socket.broadcast.emit('loadNewChat',data);
      })
      
         socket.on('existChat',async function(data){
             console.log("in exist chat");
              var chats=await Chat.find({$or:[
                     {sender_id:data.sender_id,receiver_id:data.receiver_id},
                     {sender_id:data.receiver_id,receiver_id:data.sender_id}
              ]});
              console.log("chats loaded ");
             
              socket.emit('loadChats',{chats:chats});
         });

        
         socket.on('chatDeleted',function(id){
            socket.broadcast.emit('chatMessageDeleted',id);
         })
         socket.on('chatUpdated',function(data){
          console.log("inside the chatUpdated with data.id="+data.id);
          console.log("inside the chatUpdate the new text is ="+data.chat);
          socket.broadcast.emit('chatMessageUpdated',data);
         })
     } );
   
http.listen(3000,function(){
  console.log("server is running on port 3000");
});
