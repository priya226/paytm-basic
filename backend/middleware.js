import jwt  from "jsonwebtoken";
import jwtsecret from "./config.js";
const outhhandler=(req,res,next)=>{
    const authorizer = req.headers.authorization;
    if(!authorizer){
        return res.status(403).json({
            message:'invalid authorization'
        })
    }
    try{
        let data = authorizer.split(" ");
        if(data[0]!='Bearer'){
            return res.status(403).json({
                message:'invalid authorization'
            })  
        }
       const token = data[1];
       const verify =jwt.verify(token,jwtsecret);
       req.id = verify.userid;
       next();
    }catch(err){
        return res.status(403).json({
            message:'invalid token'
        })
    }
    
}
export {outhhandler};