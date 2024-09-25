import express from 'express'
import userrouter from './userRoutes.js';
import accountRouter from './accountRoutes.js'
const router = express.Router();

router.use('/user',userrouter)
router.use('/account',accountRouter)

export default router;
