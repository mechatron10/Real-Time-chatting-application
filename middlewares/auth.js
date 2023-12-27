
const isLogin=async(req,res,next)=>{

 try {
    if(req.session.user===undefined)
    {
       res.redirect('/');
    }
    next();
 } catch (error) {
    console.log(error.message);
 }

}
const isLogout=async (req,res,next)=>{
     try {
         if(req.session.user)
         {
            res.redirect('/dashboard');
         }
         next();
     } 
     catch (error) {
        console.log(error.message);
     }
};
module.exports={
    isLogout,
    isLogin
}