import mongoose,{Schema} from "mongoose";

const investmentPlanSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    roiPercent:{
        type:Number,
        required:true
    },
    minAmount:{
        type:Number,
        required:true
    },
    durationDays:{
        type:Number,
        required:true
    },
    autoPayout:{
        type:Boolean,
        default:false
    },
},{
    timestamps:true
});

const InvestmentPlan = mongoose.model("InvestmentPlan",investmentPlanSchema);

export default InvestmentPlan;
