import Wallet from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";
import Referral from "../models/referralModel.js";


export const getWalletBalance = async (req, res) => {
  try {
    const userId = req.userId; 
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }
    res.status(200).json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
    if (!transactions) {
      return res.status(404).json({ success: false, message: "No transactions found" });
    }
    res.status(200).json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const depositFunds = async (req, res) => {
  try {
    const userId=req.userId
    const {amount}=req.body
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }
    wallet.balance += amount;
    await wallet.save();

    await Transaction.create({
      userId,
      type: "deposit",
      amount,
      status: "completed"
    });

    const referral = await Referral.findOne({ referredId: userId, level: 1 });
    if (referral) {
      const referrer = await Wallet.findOne({ userId: referral.referrerId });
      if (referrer) {
        referrer.commission += amount * 0.1; // Assuming 10% commission
        await referrer.save();
      }
    }
    // do the same for level 2 and level 3
    const referralLvl2 = await Referral.findOne({ referredId: userId, level: 2 });
    if (referralLvl2) {
      const referrerLvl2 = await Wallet.findOne({ userId: referralLvl2.referrerId });
      if (referrerLvl2) {
        referrerLvl2.commission += amount * 0.05; // Assuming 5% commission
        await referrerLvl2.save();
      }
    }

    const referralLvl3 = await Referral.findOne({ referredId: userId, level: 3 });
    if (referralLvl3) {
      const referrerLvl3 = await Wallet.findOne({ userId: referralLvl3.referrerId });
      if (referrerLvl3) {
        referrerLvl3.commission += amount * 0.02; // Assuming 2% commission
        await referrerLvl3.save();
      }
    }

    res.status(200).json({ success: true, message: "Deposit successful", wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const withdrawFunds = async (req, res) => {
  try {
    const userId=req.userId
    const {amount}=req.body
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }
    if (wallet.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }
    wallet.balance -= amount;
    await wallet.save();

    await Transaction.create({
      userId,
      type: "withdrawal",
      amount,
      status: "completed"
    });
    res.status(200).json({ success: true, message: "Withdrawal successful", wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};