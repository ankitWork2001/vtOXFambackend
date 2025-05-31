import User from "../models/userModel.js";
import Referral from "../models/referralModel.js";
import Wallet from "../models/walletModel.js";
export const getReferralCode = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "Referral code fetched", code: user.code });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const giveReferral = async (req, res) => {
  try {
    const { referralCode } = req.body;
    const userId = req.userId;

    // Find the user by referral code
    const referrer = await User.findOne({ code: referralCode });
    if (!referrer) {
      return res.status(404).json({ success: false, message: "Referrer not found" });
    }

    await Referral.create({
      referrerId: referrer._id,
      referredId: userId,
      level: 1, // Assuming level 1 for direct referral
    });
    referrer.spinCount+=1
    await referrer.save();
    

    const referrerLvl2 = await Referral.findOne({
      referredId: referrer._id,
      level: 1,
    });
    console.log("refer lvl 2", referrerLvl2);
    

    if(referrerLvl2) {
      console.log("lvlv 2");
      
      await Referral.create({
        referrerId: referrerLvl2.referrerId,
        referredId: userId,
        level: 2, // Assuming level 2 for indirect referral
      });
      const referrerLvl3 = await Referral.findOne({
      referredId: referrerLvl2.referrerId,
      level: 1,
    });
    if(referrerLvl3) {
      await Referral.create({
        referrerId: referrerLvl3.referrerId,
        referredId: userId,
        level: 3, // Assuming level 3 for indirect referral
      });
    }
    }

    const referrerLvl3 = await Referral.findOne({
      referredId: referrerLvl2.referrerId,
      level: 1,
    });
    if(referrerLvl3) {
      await Referral.create({
        referrerId: referrerLvl3.referrerId,
        referredId: userId,
        level: 3, // Assuming level 3 for indirect referral
      });
    }

    res.status(200).json({ success: true, message: "Referral given successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getReferralTree = async (req, res) => {
  try {
    const userId=req.userId;
    const referralTree=await Referral.find({referrerId:userId})
    .populate("referredId","name username email mobile role")
    .exec();
    if(!referralTree || referralTree.length===0){
      res.status(200).json({ success: true, message: "Not Referred Yet" });
    }
    res.status(200).json({ success: true, message: "Referral tree fetched",referralTree });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getReferralCommissions = async (req, res) => {
  try {
    const userId = req.userId;
    const wallet = await Wallet.findOne({ userId: userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    res.status(200).json({ success: true, message: "Commissions fetched", commissions: wallet.commission });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};