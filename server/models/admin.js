const moongoose=require('mongoose')
const productShcsema=new moongoose.Schema({

     name:{type:String,require:true},
    price:{type:Number,require:true},
    image:{type:String,require:true},
})

const products=moongoose.model('product',productShcsema)

module.exports=products;