import mongoose,{Schema} from "mongoose";

const referralSchema = new Schema({
    referrerId:{
        type:Schema.Types.ObjectId, 
        ref:"User",
        required:true
    },
    referredId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    level:{
        type:Number,
        min:1,
        max:3,
        required:true
    },
    commissionPercent:{
        type: Number,
        required: true
    }
},{
    timestamps:true
});

const Referral = mongoose.model("Referral",referralSchema);

export default Referral;
