const moongoose = require("mongoose");

const cartSchema=new moongoose.Schema({
    userId:{type:moongoose.Schema.Types.ObjectId,ref:"user",require:true},
    products:[{
        productId:{type:moongoose.Schema.Types.ObjectId,ref:"product",require:true},
        quantity:{type:Number,default:1}
    }]
},{timestamps:true})
const cart=moongoose.model("cart",cartSchema)
module.exports=cart