const moongoose=require('mongoose')
const adminShcsema=new moongoose.Schema({

     name:{type:String,require:true},
    price:{type:Number,require:true},
    image:{type:String,require:true},
})

const admin=moongoose.model('admin',adminShcsema)

module.exports=admin;