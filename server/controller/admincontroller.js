const admin=require('../models/admin')

// for get 

// استخدام لاحقا
// exports.getfood=async(req,res)=>{
//     try {
//         const food=await admin.find()
//         res.status(200).json(food)
//     } catch (error) {
//         res.status(400).json({message:error.message})
//     }
// }






// for post
exports.postEat=async(req,res)=>{

try {
    const newfood=req.body;
    const creatfood=await admin.create(newfood)
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
    const newfood=await admin.findByIdAndUpdate(id,body,{new:true})
    res.status(200).json(newfood)
} catch (error) {
        res.status(500).json({message:error.message})
}
}


// for delete

exports.deletefood=async(req,res)=>{
try {
    const id=req.id.params;
    const deletefofo=await admin.findByIdAndDelete({_id:id})
    res.status(200).json(deletefofo)
} catch (error) {
        res.status(500).json({message:error.message})
    
}
}
