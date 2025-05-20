// create  school model , like my other model design pateran , add campus and year filed in it 
import mongoose from "mongoose"
const schoolSchema = new mongoose.Schema(
{
    campus:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Campus"
    },
    year:{
        type: Number,
        required: [true, "Please enter school year"],
    }
}
)   
export default mongoose.model("School",schoolSchema)