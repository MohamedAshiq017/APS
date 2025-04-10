import doctorModel from "../models/doctorModel.js"

import appointmentModel from "../models/appointmentModel.js"

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const changeAvailability = async (req,res)  =>{
    try{
        console.log('Received changeAvailability request:', req.body);
const {docId} =req.body;

const docData = await doctorModel.findById(docId)

await doctorModel.findByIdAndUpdate(docId,{available: !docData.available})
res.json({success:true,message:'Availability Changed'})

    } catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


const doctorList = async (req,res) =>{
    try{
        const doctors = await doctorModel.find({}).select(['-password','-email'])

        res.json({success:true,doctors})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

//API  for doctor login

const loginDoctor = async(req,res) =>{
    try {
        const {email,password} = req.body
        const doctor = await doctorModel.findOne({email})

        console.log("🧾 Doctor entered password:", password);
        console.log("🔐 Stored hashed password:", doctor?.password);

        if(!doctor){
            console.log("❌ No doctor found with email:", email);
            return res.json({success:false,message:"Invalid credentials"})
        }

        const isMatch = await bcrypt.compare(password,doctor.password)
        console.log("🔍 Password match result:", isMatch);

        if(isMatch){
        
            const token = jwt.sign({id:doctor._id},process.env.JWT_SECRET)

            res.json({success:true,token})
        } else{
            console.log("❌ Password mismatch for email:", email);

            res.json({success:false,message:"Invalid credentials"})
        }
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


//API to get doctor appointments for doctor panel

const appointmentsDoctor = async(req,res) =>{
    try{
        
        const token = req.headers.dtoken; // Get token from header
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode it
        const docId = decoded.id;
        // const docId = req.user.id

        const appointments = await appointmentModel.find({docId})

        res.json({success:true,appointments})
    }  catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API to mark appointment completed for doctor panel

const appointmentComplete = async(req,res) =>{
    try{
        

const token = req.headers.dtoken;
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const docId = decoded.id;

const { appointmentId } = req.body;

// const { docId, appointmentId } = req.user;


        const appointmentData = await appointmentModel.findById(appointmentId)
        
        if(appointmentData && appointmentData.docId == docId){

            await appointmentModel.findByIdAndUpdate(appointmentId,{isCompleted:true})

            return res.json({success:true,message:'Appointment Completed'})
        } else{
                return res.json({success:false,message:'Mark Failed'})
        }

    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


//API to cancel appointment for doctor panel

const appointmentCancel= async(req,res) =>{
    try{

const token = req.headers.dtoken;
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const docId = decoded.id;

const { appointmentId } = req.body;
        

        const appointmentData = await appointmentModel.findById(appointmentId)
        
        if(appointmentData && appointmentData.docId == docId){

            await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})

            return res.json({success:true,message:'Appointment Cancelled'})
        } else{
                return res.json({success:false,message:'Cancellation Failed'})
        }

    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


export {changeAvailability,doctorList,loginDoctor,appointmentsDoctor,appointmentCancel,appointmentComplete

}