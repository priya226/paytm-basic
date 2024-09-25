import mongoose from "mongoose";

const userSchema =new mongoose.Schema({
    username:{
        type:String,
        require:[true,'required and must be string'],
    },
    firstname:{
        type:String,
        require:[true,'required and must be string'],
    },
    lastname:{
        type:String,
        require:[true,'required and must be string'],
    },
    password:{
        type:String,
    }
})
export default mongoose.model('user',userSchema)