const User=require('../models/userModel');
const Chat=require('../models/chatModel');
const Group=require('../models/groupModel');
const bcrypt=require('bcrypt');
const registerLoad=async(req,res)=>{
   try {
    res.render('register');
   }
    catch (error) {
    console.log(error.message);
   }
}
const register=async(req,res)=>{
    try {
     const passwordHash=await bcrypt.hash(req.body.password,10);
      const user=new User({
        name:req.body.name,
        email:req.body.email,
        image:'images/'+req.file.filename,
        password:passwordHash
      });
      await user.save();
      res.render('register',{message:"Registration completed successfull"});

    }
     catch (error) {
     console.log(error.message);
    }
}
const loadLogin=async(req,res)=>{
  try{
     res.render('login');
  }
  catch(error){
   console.log(error.message);
  }
}
const login=async(req,res)=>{
  try{
     const email=req.body.email;
     const password=req.body.password;
     const userData=await User.findOne({email:email});
     if(userData)
     {
        const passwordMatch=await bcrypt.compare(password,userData.password);
        if(passwordMatch)
        {
            req.session.user=userData;
            res.cookie('user',JSON.stringify(userData));
            res.redirect('/dashboard');
        }
        else
        {
          res.render('login',{message:'Password is not correct'});
        }
     }
     else
     {
       res.render('login',{message:'email does not match a registered user' });
     }

  }
  catch(error){
   console.log(error.message);
  }
}
const loadDashboard=async(req,res)=>{
  try{
    var users=await User.find({_id:{$nin:[req.session.user._id]}});
     res.render('dashboard',{user:req.session.user,users:users});
  }
  catch(error){
   console.log(error.message);
  }
}
const logout=async(req,res)=>{
  try{
         res.clearCookie('user');
         req.session.destroy();
         res.redirect('/');
     }
  catch(error){
   console.log(error.message);
  }
}
const saveChat=async(req,res)=>{
  try{
     var chat=new Chat({
       sender_id:req.body.sender_id,
       receiver_id:req.body.receiver_id,
       message:req.body.message
     });
     var newChat=await chat.save();
     res.status(200).send({success:true,message:'chat inserted successfully',chat:newChat});
  }
  catch(error)
  {
    res.status(400).send({success:false,message:error.message});
  }
}
const deleteChat=async(req,res)=>{
 try {
      await Chat.deleteOne({_id:req.body.id});
      res.status(200).send({success:true,message:'chat deleted successfully'});
 } 
 catch (error) {
  res.status(400).send({success:false,message:error.message});
 }
}
const updateChat=async(req,res)=>{
  try {
       console.log("message to be updated is message="+req.body.message);
       await Chat.findByIdAndUpdate({_id:req.body.id},{
         $set:{
             message:req.body.message
         }
       }) 
       console.log("we are done updating ");
       res.status(200).send({success:true,message:'chat updated successfully',chat:req.body.message}); 
  } 
  catch (error) {
    res.status(400).send({success:false,message:error.message});
  }
}
const loadGroups=async(req,res)=>{
    try {
        console.log("groups loaded ");
         const groups=await Group.find({creator_id:req.session.user._id});
         res.render('group',{groups:groups});
    } 
    catch (error) {
      console.log(error.message);
    }
}
const createGroup=async(req,res)=>{
     try {
       console.log("reqest to create again");
      const group=new Group({
        creator_id:req.session.user._id,
        name:req.body.name,
        image:'/images/'+req.file.filename,
        limit:req.body.limit
      })
      await group.save();
      const groups=await Group.find({creator_id:req.session.user._id});
      res.render('group',{message:req.body.name+'group created',groups:groups});
     } 
     catch (error) {
       console.log(error.message); 
     }
}
const getMembers=async(req,res)=>{
  try {
     var users=await User.find({_id:{$nin:[req.session.user._id]}});
     res.status(200).send({success:true,data:users});
  } 
  catch (error) {
    res.status(400).send({success:false,message:error.message});
  }
}
module.exports=({
    registerLoad,
    register,
    login,
    logout,
    loadDashboard,
    loadLogin,
    saveChat,
    deleteChat,
    updateChat,
    loadGroups,
    createGroup,
    getMembers
  })