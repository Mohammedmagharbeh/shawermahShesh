const mongoose=require('mongoose')
require('dotenv').config()

const connectDB=async()=>{
    try{mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
 }).then(()=>console.log('connected to MONGODB'))
 .catch(err=>console.log(err))}
 catch(error){

 
 console.error(`Error connecting to MONGODB:${error .message}`)
process.exit(1)
 }
}   
module.exports=connectDB