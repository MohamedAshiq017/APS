import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    image:{type:String,required:true},
    speciality:{type:String,required:true},
    degree:{type:String,required:true},
    experience:{type:String,required:true},
    about:{type:String,required:true},
    available:{type:Boolean,default:true},
    fees:{type:Number,required:true},
    address:{type:Object,required:true},
    date:{type:Number,required:true},
    availability: {
        type: Object,
        required: true,
        default: {}
      },
    slots_booked:{type:Object,default:{}},
},{minimize:false})

// console.log("mongoose:", mongoose);
// console.log("Mongoose.models:", mongoose.models);


// const doctorModel = mongoose.models?.doctor || mongoose.model("doctor", doctorSchema);
const doctorModel = mongoose.models?.doctor || mongoose.model("doctor",doctorSchema)

// console.log("Mongoose.models:", mongoose.models);
export default doctorModel