import express from "express";
import zod from 'zod';
import userModel from "../model/userModel.js";
import jwt from 'jsonwebtoken'
import jwtsecret from '../config.js';
import { outhhandler } from "../middleware.js";
import accountModel from "../model/accountModel.js";
import mongoose from "mongoose";

const router = express.Router();
const userzodSignupSchema = zod.object({
    username:zod.string(),
    firstname:zod.string(),
    lastname:zod.string(),
    password:zod.string().min(6)
})

const userzodSigninSchema = zod.object({
    username:zod.string(),
    password:zod.string().min(6)
})

const updateuserzodSchema = zod.object({
    firstname:zod.string().optional(),
    lastname:zod.string().optional(),
    password:zod.string().min(6)
})
router.route('/signup').post(async (req,res)=>{
    const body=req.body;
    const parsebody=userzodSignupSchema.safeParse(body);
    // console
    if(!parsebody.success){
        return res.status(400).json({ error:parsebody.error, status:'OK'})
    }
    try{
        const user =await userModel.findOne({username:body.username});
        console.log('user already exist check Please sign in');
        if(user)
        { return  res.status(411).send({message:"user already exist"})
        }
        else{
            const createuser = await userModel.create(req.body);
            console.log('user created');
            const token = jwt.sign({
                           userid:  createuser._id
                           },jwtsecret,{expiresIn:'3d'})
            // console.log(token);
            // const account = await accountModel.create({
            //                                      userId:createuser._id,
            //                                      balance:1+Math.random()*1000
            //                                             });

            // console.log(account);
            console.log('before createAccountForuser')
            await createAccountForuser(createuser._id);
            console.log('after createAccountForuser')
            return res.status(200).json({message:'succefully created user',token:token})
          }
    }catch(err){
        return  res.status(411).send({error:err})
    }
})
router.route('/signin').post(async(req,res)=>{
    const body = req.body;
    const bodyparser = userzodSigninSchema.safeParse(body);
    if(!bodyparser.success){
        return res.status(411).send({message:"error while loggin in",error:bodyparser.error});
    }
    try{
        const userfind =await userModel.findOne({username:body.username,password:body.password});
        const token = jwt.sign({
            userid:  userfind._id
          },jwtsecret,{expiresIn:'3d'});
          return res.status(200).json({message:'succefully signined user',token:token})

    }catch(error){
        return res.status(401).json({message:'invalid credential'})
    }


})
// router.use(outhhandler);
router.route('/updateuser').put(outhhandler,async(req,res)=>{
    const bodyparser = updateuserzodSchema.safeParse(req.body);
    if(!bodyparser.success){
        return res.status(500).json({error:bodyparser.error,message:'FAILED'})
    }
    try{
        const updateuser= await userModel.findByIdAndUpdate(req.id,req.body);
        return res.status(200).json({status:'OK',message:'Updated user',data:updateuser})
    }catch(err){
        return res.status(500).json({error:err,message:'FAILED'})
    }
})

router.route('/bulk').get(outhhandler,async(req,res)=>{
    const searchterm = req.query.filter || "";
    try{
        const users = await userModel.find({
            $or:[
                {
                    firstname:{
                        "$regex":searchterm
                    }
                },
                {
                    lastname:{
                        "$regex":searchterm
                    }
                },
                {
                    username:{
                        "$regex":searchterm
                    }

                }
            ]
        });
        // console.log(users);S
        res.status(200).json({
            status:'OK',
            message:'Fetched users list',
            data:users.map(user=>{
                return {username:user.username,
                        firstname:user.firstname,
                        lastname:user.lastname,
                        id:user._id}
            })               
        })

    }catch(err){
        res.status(500).json({
            error:err
        })
    }
})

// router.route('/fetchAccount').get(outhhandler,async(req,res)=>{
//     try{
//         // console.log(req.id)
//         const userId = ObjectId(req.id);
//         console.log(userId)
//         const accounts = await accountModel.find({userId:userId});
//         console.log(accounts)
//         res.status(200).json({
//                             message:'account fetched succefully',
//                             data:accounts.map(ac=>ac._id)});
//     }catch(err){
//         res.status(500).json({error:err})
//     }
// })
const createAccountForuser = async (userId)=>{
    const session = await mongoose.startSession();
    session.startTransaction();
    let balance=1+Math.random()*1000
    try{
        const account = new accountModel({userId:userId,
          balance:balance
        });
        account.save({session});
        console.log('account save');
        const user = await userModel.updateOne(
            {_id:userId},
            {$push:{accounts:account._id}},
            {session})
        console.log('user updated')
        await session.commitTransaction();
        console.log('New account created and linked to user.')
    }catch(err){
        await session.abortTransaction();
        console.error('Error creating account and linking to user:', err);
    }finally{
        console.log('reached finally')
        await session.endSession();
    }
}
export default router;
