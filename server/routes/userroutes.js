const express=require('express') 
const cors=require('cors');
const routes=express.Router();
require('dotenv').config();

const {getuser,postuser,userLogin,verify,home}=require('../controller/usercontroller')

routes.get('/users',getuser)
routes.post('/users/postuser',postuser)



routes.post('/login',userLogin)
routes.get('/jwt',verify)
routes.get('/home',verify,home);

module.exports=routes;
