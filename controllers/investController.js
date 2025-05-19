import InvestmentPlan from "../models/investmentPlanModel.js";
import UserInvestment from "../models/userInvestmentModel.js";
export const getInvestmentPlans = async (req, res) => {
  try {
    const plans=await InvestmentPlan.find();
    if (!plans || plans.length === 0) {
      return res.status(404).json({ success: false, message: "No investment plans found" });
    }
    res.status(200).json({ success: true, message: "Plans fetched successfully", plans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const subscribeInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount,startDate,endDate,status,lastPayoutDate } = req.body;

    // Find the investment plan by ID
    const plan = await InvestmentPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Investment plan not found" });
    }

    // Create a new user investment
    const userInvestment = await UserInvestment.create({
      userId: req.userId,
      planId: id,
      amount,
      startDate,
      endDate,
      status : status || "active",
      lastPayoutDate : lastPayoutDate || null
    });

    res.status(201).json({ success: true, message: "Subscribed successfully", investment: userInvestment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getActiveInvestments = async (req, res) => {
  try {
    const userId= req.userId;
    const investments = await UserInvestment.find({ userId, status: "active" })
      .populate("planId", "name roiPercent minAmount durationDays autoPayout")
      .exec();
    res.status(200).json({ success: true, message: "Active investments fetched", investments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getInvestmentHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const investments = await UserInvestment.find({ userId })
      .populate("planId", "name roiPercent minAmount durationDays autoPayout")
      .exec();
    res.status(200).json({ success: true, message: "Investment history fetched", investments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};