const express=require('express') 
const bodyParse=require('body-parser')
const cors=require('cors')
const dotenv=require('dotenv')
const connectDB=require('./config/db')

const userroutes=require('./routes/userroutes')
const adminroutes=require('./routes/adminroutes')
dotenv.config()
const app=express();
connectDB();

app.use(bodyParse.json())
app.use(cors());
app.use('/api',userroutes)
app.use('/api',adminroutes)





module.exports=app; 
