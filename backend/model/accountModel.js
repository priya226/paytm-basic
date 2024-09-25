import mongoose from "mongoose";

const accounSchema = new mongoose.Schema({
    balance:{type:Number, require:true, min:[0,'low balance']},
    userId:{type:mongoose.Schema.Types.ObjectId, ref:'userModel'}
})
export default mongoose.model('accountModel',accounSchema);