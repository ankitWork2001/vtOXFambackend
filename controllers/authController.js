import User from "../models/userModel.js";
import Wallet from "../models/walletModel.js";
import jwt from "jsonwebtoken";
import Referral from "../models/referralModel.js";
import Spin from "../models/spinModel.js";

const getBonusByLevel = (level) => { // to get bonus amount
  switch (level) {
    case 1: return 1000;
    case 2: return 500;
    case 3: return 250;
    default: return 0;
  }
};

const creditWallet = async (userId, amount) => { // Add bonus in wallet
  await Wallet.updateOne(
    { userId },
    { balance: amount } ,
  );
};




// Check for circular referral: prevent if new user would be added to their own downline
const isCircularReferral = async (referrerId, newUserId) => {
  let current = referrerId;

  for (let i = 0; i < 3; i++) {
    const referral = await Referral.findOne({ referredId: current, level: 1 });
    if (!referral) break;

    if (referral.referrerId.toString() === newUserId.toString()) {
      return true; // cycle detected
    }

    current = referral.referrerId;
  }

  return false;
};


export const signup = async (req, res) => {
  try {
    const { name, username, email, password, mobile, role, referralCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const code = await generateReferralCode(name);
    let referredBy = null;

    if (referralCode) {
      const referrer = await User.findOne({ code: referralCode });
      if (!referrer) {
        return res.status(400).json({ success: false, message: "Invalid referral code" });
      }

      const isCycle = await isCircularReferral(referrer._id, newUser._id);
      if (isCycle) {
        return res.status(400).json({ success: false, message: "Circular referral detected — not allowed" });
      }

      referredBy = referrer._id;
    }

    const newUser = await User.create({
      name,
      username,
      email,
      password,
      mobile,
      role: role || "user",
      code,
      referredBy
    });

    await Wallet.create({
      userId: newUser._id,
      balance: 0
    });

    //Add user to the referral tree if referral code was used
    if (referredBy) {
    const newReferral = async (referrerId, referredId, level) => {
    await Referral.create({
      referrerId,
      referredId,
      level,
      commissionPercent: level === 1 ? 10 : level === 2 ? 5 : 2.5
    });
    await creditWallet(referrerId, getBonusByLevel(level));
    };

    // LEVEL 1
    await newReferral(referredBy, newUser._id, 1);

    // Free spins
    const freeSpin = { resultValue: 0, type: "free" };
    await Spin.create([
      { ...freeSpin, userId: referredBy },
      { ...freeSpin, userId: newUser._id }
    ]);

    // Update spin counts
    const referrer = await User.findById(referredBy);
    if (referrer) {
      referrer.spinCount = (referrer.spinCount || 0) + 1;
      await referrer.save();
    }
    newUser.spinCount = (newUser.spinCount || 0) + 1;
    await newUser.save();

    // LEVEL 2
    const level2 = await Referral.findOne({ referredId: referredBy, level: 1 });
    if (level2) {
    await newReferral(level2.referrerId, newUser._id, 2);

    // LEVEL 3
    const level3 = await Referral.findOne({ referredId: level2.referrerId, level: 1 });
    if (level3) {
      await newReferral(level3.referrerId, newUser._id, 3);
    }
  }
}

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


const generateReferralCode = async (name) => {
  const prefix = name.trim().substring(0, 3).toUpperCase();
  let uniqueCode;
  let exists = true;

  while (exists) {
    const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5-digit number
    uniqueCode = `${prefix}${randomDigits}`;
    const existing = await User.findOne({ code: uniqueCode });
    if (!existing) exists = false;
  }

  return uniqueCode;
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