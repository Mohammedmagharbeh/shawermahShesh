const express=require('express') 
const cors=require('cors');
const routes=express.Router();
require('dotenv').config();

const {postEat,updatedfood,deletefood}=require('../controller/admincontroller')

routes.post('/postfood',postEat)
routes.put('/updatefood/:id',updatedfood)
routes.delete('/deletefood/:id',deletefood)





module.exports=routes;