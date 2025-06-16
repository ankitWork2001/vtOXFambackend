import User from "../models/userModel.js";
import Wallet from "../models/walletModel.js";
import Spin from "../models/spinModel.js";
import Transaction from "../models/transactionModel.js";
import Referral from "../models/referralModel.js";

export const purchaseSpin = async (req, res) => {
  try {
    const userId=req.userId;
    const {amount , spinCount} = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }
    // Check if user has enough balance
    const userWallet = await Wallet.findOne({ userId });
    if (!userWallet || userWallet.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }
    // Deduct amount from user's wallet
    userWallet.balance -= amount;
    await userWallet.save();
    // Create spin records
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.spinCount += spinCount;
    await user.save();
    res.status(200).json({ success: true, message: "Spin purchased successfully", user, userWallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const playSpin = async (req, res) => {
  try {
    const userId = req.userId;
    const { spinType } = req.body;

    const user = await User.findById(userId);
    if (!user || user.spinCount <= 0) {
      return res.status(400).json({ success: false, message: "No spins available" });
    }

    const spinValue = Math.floor(Math.random() * 100) + 1;

    const spin = await Spin.create({
      userId,
      resultValue: spinValue,
      type: spinType || "free",
    });

    user.spinCount -= 1;
    await user.save();

    const userWallet = await Wallet.findOne({ userId });
    if (!userWallet) {
      return res.status(404).json({ success: false, message: "User wallet not found" });
    }

    // Count how many spins this user has ever played
    const totalSpins = await Spin.countDocuments({ userId });

    // Bonus Logic
    let spinBonus = 0;
    if (totalSpins === 1 || totalSpins % 3 === 0) {
      spinBonus = 1;
      userWallet.bonus = (userWallet.bonus || 0) + spinBonus;
    }

    // Record main spin amount as transaction
    await Transaction.create({
      userId,
      type: "bonus",
      amount: spinValue,
    });

    userWallet.balance += spinValue;
    userWallet.bonus+=1;
    await userWallet.save();

    const { password, ...userData } = user._doc;

    res.status(200).json({
      success: true,
      message: `Spin played successfully${spinBonus ? " + ₹1 bonus" : ""}`,
      spin,
      userData,
      userWallet
    });
  } catch (error) {
    console.error("Spin Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getSpinLogs = async (req, res) => {
  try {
    const userId = req.userId;
    const spins = await Spin.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, spins });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};