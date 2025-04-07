import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'


// API to register user
const registerUser = async(req,res) =>{
    try{
        const{name,email,password} = req.body

        if(!name || !password || !email){
            return res.json({success:false,message:"Missing Details"})
        }

        //validating email format
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Enter a valid email"})
        }

        //validating strong password
        if(password.length < 8){
            return res.json({success:false,message:"Enter a strong password"})
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)


        const userData = {
            name,
            email,
            password:hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        //_id

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

        res.json({success:true,token})

    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API for user login

const loginUser = async(req,res) =>{
    try{
        const {email,password} = req.body;
        const user = await userModel.findOne({email})

        if(!user){
             return res.json({success:false,message:"User does not exist"})
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(isMatch){
            const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
            res.json({success:true,token})
        }else{
            res.json({success:false,message:"Invalid credentials"})
        }

    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message}) 
    }
}

//API to get user profile data

const getProfile = async (req,res) =>{
    try{
        // const {userId} = req.body;  // Check if userId is provided
        const userId = req.user;
        if (!userId) {
            return res
              .status(400)
              .json({ success: false, message: "User ID is required" });
          }

        const userData = await userModel.findById(userId).select('-password');

        res.json({success:true,userData})
    } catch(error){
        console.log(error)
        res.json({success:false,message:error.message}) 
    }
}

export {registerUser,loginUser,getProfile}