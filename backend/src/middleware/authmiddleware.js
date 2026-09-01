import jwt from "jsonwebtoken";
const verifyToken = (req, res, next) =>{
     const authorization = req.headers.authorization;
        if(!authorization){
            return res.status(401).json({message: "Authorization header missing"});
        }
        const token = authorization.split(" ")[1];
        if(!token){
            return res.status(401).json({message: "Token missing"});
        }
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRECT);
            req.user = decoded;
            next();
        }
        catch(error){
            return res.status(401).json({message: "Invalid token"});
        }
}

export default verifyToken;