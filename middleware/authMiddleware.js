import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server error" });
  }
};

export const checkAdmin = async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findById(userId);
    if(user.role === 'admin'){
        next();
    }
    else{
        res.status(403).json({message:"User not authorised"});
    }
};
