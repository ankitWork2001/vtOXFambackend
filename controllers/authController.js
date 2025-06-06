import User from "../models/userModel.js";
import Wallet from "../models/walletModel.js";
import jwt from "jsonwebtoken";


export const signup = async (req, res) => {
  try {
    const {name,username, email, password,mobile,role} = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser = await User.create({
      name,
      username,
      email,
      password,
      mobile,
      role: role || "user",
      code,
    });

    await Wallet.create({
      userId: newUser._id
    });
    res.status(201).json({ success: true, message: "User registered successfully" , user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUser = async (req,res) => {
  try {
    const {id} = req.params;
    const user = await User.findOne({ _id: id, role: "user" });
    const wallet = await Wallet.findOne({ userId: id });
    if (!user || !wallet) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user, wallet });
  } catch (error) {
      res.status(500).json({ success: false, error: error.message });
  }
};