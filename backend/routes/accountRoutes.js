import express from 'express'
import { outhhandler } from '../middleware.js';
import accountModel from '../model/accountModel.js';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types; // Import ObjectId from mongoose
const router = express.Router();


router.route('/transferMoney').post(outhhandler,async(req,res)=>{
     // session here in query means these queries ar epart of transation and will only be commited if transaction succeeds
    const session = await mongoose.startSession();
    session.startTransaction();

    const {amount,touserid,fromaccountId} = req.body;

    if (!ObjectId.isValid(fromaccountId)) {
        await session.abortTransaction();
        return res.status(400).json({ error: 'Invalid account ID format' });
    }
    //user has sufficient balance or not
    try{
        // Check if fromaccountId is a valid ObjectId
        let id=new ObjectId(fromaccountId)
        const account = await accountModel.findById(id).session(session); // to tell that this query belong to current session
        console.log("account",account)
        if(!account || account.balance<amount){
            await session.abortTransaction();
            return res.status(500).json({error:'invalid account or insufficient balance'})
        }else{//check user exists or not
            let userId = new ObjectId(touserid);
            const user = await accountModel.findOne({userId:userId}).session(session);
            console.log("user",user)
            if(!user){
                await session.abortTransaction();
                return res.status(500).json({error:'invalid user'});
            }else{
                //deduct amount money from current user given account
                console.log("debit money");
                await accountModel.findByIdAndUpdate(id,{
                    $inc:{balance:-amount}
                }).session(session);
                let newtouserid = new ObjectId(touserid);
                console.log("credit money");

                await accountModel.updateOne({userId:newtouserid},{
                    $inc:{
                        balance:amount
                    }
                }).session(session);
                await session.commitTransaction();
                res.status(200).json({
                    status:'OK',
                    message:'transaction succesfull'
                })
            }
    }

    }catch(err){
        res.status(500).json({
            error:err
        });
    }
})
router.route('/checkBalance/:acId').get(outhhandler,async(req,res)=>{
    try{
        const accountid=req.params.acId;
        const account = await accountModel.findById(accountid);
        return res.status(200).json({
            message:"fetched data successfully",
            balance:account.balance
        })
    }catch(err){
        return res.status(500).json({
            error:err 
        })
    }
})
export default router;