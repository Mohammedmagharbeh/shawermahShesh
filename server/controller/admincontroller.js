const products=require('../models/admin')

// for get 

// استخدام لاحقا
// exports.getfood=async(req,res)=>{
//     try {
//         const food=await products.find()
//         res.status(200).json(food)
//     } catch (error) {
//         res.status(400).json({message:error.message})
//     }
// }






// for post
exports.postEat=async(req,res)=>{

try {
    const newfood=req.body;
    const creatfood=await products.create(newfood)
    res.status(200).json(creatfood)
} catch (error) {
        res.status(400).json({message:error.message})
    }
}



// for update

exports.updatedfood=async(req,res)=>{

try {
    const id=req.params.id;
    const body=req.body;
    const newfood=await products.findByIdAndUpdate(id,body,{new:true})
    res.status(200).json(newfood)
} catch (error) {
        res.status(500).json({message:error.message})
}
}


// for delete

exports.deletefood=async(req,res)=>{
try {
    const id=req.id.params;
    const deletefofo=await products.findByIdAndDelete({_id:id})
    res.status(200).json(deletefofo)
} catch (error) {
        res.status(500).json({message:error.message})
    
}
}
