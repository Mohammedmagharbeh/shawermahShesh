const cart=require("../models/cart")
// for add to cart
exports.addToCart=async(req,res)=>{
    const {userId,productId,quantity}=req.body;
    try {
        let userCart=await cart.findOne({userId});
        if(userCart){
            const productIndex=userCart.products.findIndex(p=>p.productId.toString()===productId);
            if(productIndex>-1){
                userCart.products[productIndex].quantity+=quantity;
            }
            else{
                userCart.products.push({productId,quantity});
            }   
            await userCart.save();
            res.status(200).json(userCart);
        }  
        else{
            const newCart=await cart.create({
                userId,
                products:[{productId,quantity}]
            });
            res.status(200).json(newCart);
        }
    } catch (error) {
        res.status(400).json({message:error.message})
    } 
    
}
// for get user cart
exports.getCart=async(req,res)=>{
    const userId=req.params.userId; 
    try {
        const userCart=await cart.findOne({userId}).populate("products.productId"); 
        if(!userCart){
            return res.status(404).json({message:"cart not found"})
        }
        res.status(200).json(userCart);
    } catch (error) {
        res.status(400).json({message:error.message})
    }   
}

// for delete specific cart item
exports.removeFromCart=async(req,res)=>{
    const {userId,productId}=req.body;  
    try {
        const userCart=await cart.findOne({userId});
        if(!userCart){
            return res.status(404).json({message:"cart not found"})
        }   
        const productIndex=userCart.products.findIndex(p=>p.productId.toString()===productId);
        if(productIndex>-1){
            userCart.products.splice(productIndex,1);
            await userCart.save();
            return res.status(200).json(userCart);
        }
        else{
            return res.status(404).json({message:"product not found in cart"})
        }
    } catch (error) {
        res.status(400).json({message:error.message})
    }
}
// for delete all cart items
exports.clearCart=async(req,res)=>{
    const userId=req.params.userId;
    try {
        const userCart=await cart.findOne({userId});
        if(!userCart){
            return res.status(404).json({message:"cart not found"})
        }           
        userCart.products=[];
        await userCart.save();
        res.status(200).json(userCart);
    } catch (error) {
        res.status(400).json({message:error.message})
    }   
}

// for update cart item quantity
exports.updatecart = async (req, res) => {
    const cartId = req.params.id;      // id الكارت
    const { productId, quantity } = req.body;  // id المنتج والكمية الجديدة
    try {
        const userCart = await cart.findOne({ _id: cartId });
        if (!userCart) return res.status(404).json({ message: "cart not found" });

        const product = userCart.products.find(p => p._id.toString() === productId);
        if (!product) return res.status(404).json({ message: "product not found in cart" });

        product.quantity = quantity;
        await userCart.save();
        res.status(200).json(userCart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
