import express from 'express';
import   mainrouter  from './routes/mainRoutes.js';
import mongoose from 'mongoose';
import 'dotenv/config';
import cors from 'cors';
const dburl = process.env.MONGO_DATABASE_URL;
console.log(dburl)
const port = 4000;

const app= express();
app.use(express.json()); // middleware
app.use(cors());
app.use('/api/v1',mainrouter);
app.get('/',(req,res)=>{
    res.send('Fetched succesfully',req.url);
});

mongoose.connect(dburl).then(()=>{
    console.log('connected db')
    app.listen(port,()=>{
        console.log('server listening port..',port);
    })
}).catch((error)=>{
    console.log(error)
})
