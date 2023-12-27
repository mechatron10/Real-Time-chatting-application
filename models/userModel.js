const mongoose=require('mongoose');
const UserSchema=new mongoose.Schema({
     name:{
        type:String,
        required:true
     },
     email:{
        type:String,
        require:true
     },
     image:{
        type:String,
        require:true
     },
     password:{
        type:String,
        require:true
     },
     is_online:{
        type:String,
        default:'0'
     },
  
    },
    {TimeStamps:true});
module.exports=mongoose.model('User',UserSchema);