import InvestmentPlan from "../models/investmentPlanModel.js";

export const createInvestmentPlan = async (req, res) => {
    try {
        const { name, roiPercent, minAmount, durationDays, autoPayout } = req.body;

        // Check if the investment plan already exists
        const existingPlan = await InvestmentPlan.findOne({ name });
        if (existingPlan) {
            return res.status(400).json({ success: false, message: "Investment plan already exists" });
        }

        // Create a new investment plan
        const newPlan = await InvestmentPlan.create({
            name,
            roiPercent,
            minAmount,
            durationDays,
            autoPayout: autoPayout || false,
        });

        res.status(201).json({ success: true, message: "Investment plan created successfully", plan: newPlan });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}