import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'

import { v2 as cloudinary } from 'cloudinary'

import doctorModel from '../models/doctorModel.js '
import appointmentModel from '../models/appointmentModel.js'

import razorpay from 'razorpay'
import nodemailer from 'nodemailer'
import { format } from 'date-fns';


const months = ["","jan","feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; 

const slotDateFormat = (slotDate) =>{
  const dateArray = slotDate.split('_')
  return dateArray[0]+" "+months[Number(dateArray[1])]+" "+dateArray[2]
}

// API to register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !password || !email) {
            return res.json({ success: false, message: "Missing Details" })
        }

        //validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid email" })
        }

        //validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong password" })
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)


        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        //_id

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API for user login

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API to get user profile data

const getProfile = async (req, res) => {
    try {
        // const {userId} = req.body;  // Check if userId is provided
        const userId = req.user;
        if (!userId) {
            return res
                .status(400)
                .json({ success: false, message: "User ID is required" });
        }

        const userData = await userModel.findById(userId).select('-password');

        res.json({ success: true, userData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to update user profile

const updateProfile = async (req, res) => {
    try {

        // const {userId,name,phone,address,dob,gender} = req.body
        const userId = req.user; // <- this fixes undefined
        const { name, phone, address, dob, gender } = req.body;
        const imageFile = req.file
        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }
        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        console.log(userId, name, phone, address, dob, gender)
        if (imageFile) {

            //upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })

        }

        res.json({ success: true, message: "Profile Updated" })

    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

//API to send appointment confirmation email
const sendAppointmentMail = async (email, name, doctorName, slotDate, slotTime) => {
       
      // slotDate is expected in the format "YYYY_MM_DD"
      const [year, month, day] = slotDate.split('_').map(Number);
      const parsedDate = new Date(year, month - 1, day); // JavaScript months are 0-indexed
      const formattedDate = format(parsedDate, 'MMMM dd, yyyy');
      
      // Calculate the end time (for simplicity, assume appointments are 30 minutes)
      const startDateTime = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const startTime = `${slotTime}00`;  // Append "00" to slotTime for minutes
      const endTime = `${(Number(slotTime) + 1).toString().padStart(2, '0')}00`;  // Add 1 hour to the start time for the end time
  
    // Generate the Google Calendar link
    const calendarLink = createGoogleCalendarLink(
        `Appointment with Dr. ${doctorName}`, 
        startDateTime, 
        slotTime, 
        startDateTime, 
        endTime, 
        `Appointment with Dr. ${doctorName}`, 
        "Your Location"
    );
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Appointment Confirmation',
        text: `Hello ${name},\n\nYour appointment with ${doctorName} has been successfully booked on ${slotDateFormat(slotDate)} at ${slotTime}..\n\nYou can add this appointment to your Google Calendar by clicking the link below:\n${calendarLink}\n\nThank you!`
    }

    await transporter.sendMail(mailOptions)
}

//API to attach google calendar link in email
const createGoogleCalendarLink = (eventTitle, startDate, startTime, endDate, endTime, description, location) => {
    // Converts "14:30" or "1430" to "143000"
    const normalizeTime = (timeStr) => {
        let parts = timeStr.includes(':') ? timeStr.split(':') : [timeStr.slice(0, 2), timeStr.slice(2)];
        const hour = parts[0].padStart(2, '0');
        const minute = parts[1]?.padStart(2, '0') || '00';
        return `${hour}${minute}00`; // HHMMSS
    };

    const formatDateTime = (date, time) => {
        const timeFormatted = normalizeTime(time);
        return `${date.replace(/-/g, '')}T${timeFormatted}`;
    };

    const startDateTime = formatDateTime(startDate, startTime);
    const endDateTime = formatDateTime(endDate, endTime);

    const calendarLink = `https://www.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(eventTitle)}` +
        `&dates=${startDateTime}/${endDateTime}` +
        `&details=${encodeURIComponent(description)}` +
        `&location=${encodeURIComponent(location)}` +
        `&sf=true&output=xml`;

    // Return anchor-wrapped HTML version
    return `<a href="${calendarLink}" target="_blank" rel="noopener noreferrer">Add to Google Calendar</a>`;
};



//API to book appointment

const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body

        const docData = await doctorModel.findById(docId).select('-password')

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor not available' })
        }

        let slots_booked = docData.slots_booked

        //checking for slot availabilty
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot not avaialable' })
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')

        delete docData.slots_booked;

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)

        await newAppointment.save()


        //save new slots data in docData

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

       

        await sendAppointmentMail(
            userData.email,
            userData.name,
            docData.name,
            slotDate,
            slotTime
        )
        res.json({ success: true, message: 'Appointment booked' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}

//API TO GET USER APPOINTMENT FOR FRONTEND my-appointments page

const listAppointment = async (req, res) => {
    try {
        // const {userId} =req.body

        const userId = req.user;
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API to cancel appointment

const cancelAppointment = async (req, res) => {
    try {
        // const {userId,appointmentId} = req.body
        const userId = req.user
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        //releasind doctors slot

        const { docId, slotDate, slotTime } = appointmentData
        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const razorpayInstance = new razorpay({
    key_id: 'process.env.RAZORPAY_KEY_ID',
    key_secret: 'process.env.RAZORPAY_KEY_SECRET'
})



//API to make payment of appointment using razorpay

const paymentRazorpay = async (req, res) => {

    try {
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment Cancelled or not found" })
        }

        // creating options for razorpay payment

        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,

        }

        //
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment,paymentRazorpay }