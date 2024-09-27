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
        require :[true,'Password required']
    },
     // New field to reference accounts
    accounts:[{type:mongoose.Schema.Types.ObjectId,ref:'accountModel'}]

})
/**
 * 
// after sometime i want to add one more column into userSchema and decided to add accounts key 
    which is array and the value in it refer to account schema 
// how should i handle already existing data
 * 1. Modify the Schema

    2. Update Existing Documents
    To handle existing documents (users) without the accounts field, you’ll need to ensure that:
    Existing users get updated with an empty array for accounts (since they don’t have associated accounts yet).
    For users that do have accounts, you need to manually link them by updating their document.

    -Database Script to Initialize the Field
    - Link Existing Accounts to Users
    See Script file
    3. Handle Future Data Updates
 */

export default mongoose.model('user',userSchema)