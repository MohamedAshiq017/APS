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


//API TO GET DASHBOARD DATA FOR DOCTOR MODEL

const doctorDashboard =  async(req,res) =>{
    try {
        
        const token = req.headers.dtoken;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const docId = decoded.id;

        const appointments = await appointmentModel.find({docId})
       
        let earnings = 0

        appointments.map((item)=>{
             if(item.isCompleted || item.payment){
                earnings += item.amount
             }
        })

        let patients = []

        appointments.map((item)=>{
            if (!patients.includes(item.userId.toString())) {
                patients.push(item.userId.toString());
            }
        })

        const dashData = {
            earnings,
            appointments : appointments.length,
            patients:patients.length,
            latestAppointments : appointments.reverse().slice(0,5)
        }

        res.json({success:true,dashData})


    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


//API to get doctor profile for doctor panel

const doctorProfile = async(req,res) =>{
    try {
        const token = req.headers.dtoken;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const docId = decoded.id;

        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({success:true,profileData})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API TO UPDATE DOCTOR PROFILE DATA FROM DOCTOR PANEL

const updateDoctorProfile = async(req,res) => {
    try {
        // const {docId,fees,address,available} = req.body
        // const docId = req.user;
        const token = req.headers.dtoken;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const docId = decoded.id;
        const {fees,address,available} = req.body
        console.log(docId);
        console.log(fees);
        console.log(available);
        console.log(address);
        

        await doctorModel.findByIdAndUpdate(docId,{fees,address,available})

        res.json({success:true,message:'Profile updated'})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


//API to set availability slots

const setAvailability = async (req, res) => {
    try {
      const { availability } = req.body;
      const token = req.headers.dtoken;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const docId = decoded.id;
  
      if (!availability || typeof availability !== "object") {
        return res.json({ success: false, message: "Invalid availability format" });
      }
  
      const doctor = await doctorModel.findById(docId);
      if (!doctor) {
        return res.json({ success: false, message: "Doctor not found" });
      }
  
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Strip time
  
      const filteredAvailability = {};
  
      for (const [day, { date, slots }] of Object.entries(availability)) {
        const slotDate = new Date(date);
        slotDate.setHours(0, 0, 0, 0); // Strip time
  
        if (slotDate >= today) {
          filteredAvailability[day] = {
            date,
            slots: slots || []
          };
        }
      }
  
      doctor.availability = filteredAvailability;
      await doctor.save();
  
      res.json({ success: true, message: "Availability updated successfully!" });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };


  const getAvailability = async (req, res) => {
    try {
      const token = req.headers.dtoken;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const docId = decoded.id;
  
      const doctor = await doctorModel.findById(docId).select("availability");
  
      if (!doctor) {
        return res.json({ success: false, message: "Doctor not found" });
      }
  
      res.json({ success: true, availability: doctor.availability });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };

  
  
export {changeAvailability,doctorList,loginDoctor,appointmentsDoctor,appointmentCancel,appointmentComplete,doctorDashboard,doctorProfile,updateDoctorProfile,setAvailability, getAvailability
}