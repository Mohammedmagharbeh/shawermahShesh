const user=require('../models/user')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')


// get endpoint

exports.getuser=async(req,res)=>{

    try {
        const  users=await user.find()
        res.status(200).json(users)
    } catch (error) {
        res.status(400).json({message:error.message})
    }
}



// postEndpoint


exports.postuser=async(req,res)=>{

try{
 const {username,email,password}=req.body

    const hashedpassword=await bcrypt.hash(password,10)
    const userwithhash={username:username,email:email,password:hashedpassword,password2:hashedpassword}
    const newuser=await user.create(userwithhash)
    res.status(200).json(newuser)
}
catch(error){
res.status(400).json({message:error.message})
}

}


exports.userLogin=async(req,res)=>{
const {username,password}=req.body
try {
    const userLog=await user.findOne({username})
    if(!userLog){
        return res.status(400).json({message:'user not found'})
    }
    const isMatch=await bcrypt.compare(password,userLog.password)
    if(!isMatch){
        return res.status(400).json({message:'Wrong information'})
    }
    const token=jwt.sign({userId:userLog._id},'goback',{
        expiresIn:'1h'  
    })
    res.status(200).json({message:'token found',token})
} catch (error) {
    res.status(500).json({error:error.message})
}
}

exports.verify=async(req,res,next)=>{
try {
    const token=req.header('Auth').replace('Baerer ','')
if(!token){
    res.status(401).json({message:'token not found'})
}
const Varfied=jwt.verify(token,'goback')
req.user=Varfied.userId
next()
}
catch (error) {
    res.status(401).json({error:error.message})
}
}


exports.home=async(req,res)=>{
const getuser=req.user
try {
    const checkuser=await user.findById(getuser)
        res.status(200).json({ user: checkuser, role: checkuser.role }); // إضافة role في الاستجابة
} catch (error) {
    res.status(500).json({error:error.message})
}
}
