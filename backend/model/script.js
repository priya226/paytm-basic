import accountModel from "./accountModel.js";
import userModel from "./userModel.js"
import mongoose from "mongoose";
import 'dotenv/config';
const dburl = process.env.MONGO_DATABASE_URL;

const updatedUser = async ()=>{
    await userModel.updateMany(
        {accounts:{$exists:false}},//Only update if the field does not exist
        {$set:{accounts:[]}} //Initialise with empty array
    )
    console.log('All userss updated with account field....')
}

//If accounts already exist for some users, you need to update the users with references to those accounts. Assuming you already have the userId in the accounSchema
const linkAccountsToUsers = async ()=>{
    const accountData =await accountModel.find() //fetch all accounts sata
    for(let account of accountData){
        // push the account tpo user it belong
        await userModel.updateOne(
            {_id:account.userId},
            {$push:{accounts:account._id}} // Add account ID to the accounts array
        )
    }
    console.log('Accounts linked to respective users.');
}

/**
 * 
The approach we've provided will work, but it can be optimized, especially when dealing with a large number of accounts.
As it stands, we're updating users one by one in a loop, which can result in multiple database queries being fired sequentially.
This can become inefficient for a large dataset due to the overhead of multiple round trips to the database.

1. Batch Updates Using bulkWrite:
const linkAccountsToUsers = async () => {
  const accounts = await Account.find();

  // Prepare bulk operations for updating users
  const bulkOperations = accounts.map(account => ({
    updateOne: {
      filter: { _id: account.userId },
      update: { $push: { accounts: account._id } }
    }
  }));

  // Execute all the operations in one batch
  await User.bulkWrite(bulkOperations);

  console.log('Accounts linked to respective users in bulk.');
};

linkAccountsToUsers();
Fewer Database Calls: Instead of making one updateOne() call per account, bulkWrite groups all update operations and sends them in a single request to the database.
Better Performance: MongoDB can optimize batch operations internally, making the whole process faster, especially when working with large datasets.
 */

mongoose.connect(dburl,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Wait up to 30 seconds for a connection
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
}).then(()=>{
    console.log('connected db')
    updatedUser();
    linkAccountsToUsers();
}).catch((error)=>{
    console.log(error)
})