import User from "../models/userModel.js";
import Wallet from "../models/walletModel.js";
export const getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const user = await User.findById(employeeId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const wallet = await Wallet.findOne({ userId: employeeId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }
    const { password, ...userDetails } = user._doc;
    const { balance, ...walletDetails } = wallet._doc;
    const userWithWallet = {
      ...userDetails,
      wallet: {
        ...walletDetails,
        balance: balance.toFixed(2),
      },
    };
    res.status(200).json({ success: true, message: "User fetched successfully", user: userWithWallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    // Implementation
    res.status(200).json({ success: true, message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    // Implementation
    res.status(200).json({ success: true, message: "Avatar uploaded successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};