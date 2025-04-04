import React,{useContext, useState} from 'react'
import {assets} from '../assets/assets'
import { AdminContext } from '../context/AdminContent'
import axios from 'axios'
import { toast } from 'react-toastify'
// import { DoctorContext } from "../context/DoctorContext";

const Login = () => {

    const [state,setState] = useState('Admin')

    const[email,setEmail] = useState('')
    const[password,setPassword] = useState('')

    const {setAToken,backendUrl} = useContext(AdminContext)

    const onSubmitHandler = async (event) =>{
    event.preventDefault()
    try{

        if(state === 'Admin'){
            const {data} = await axios.post(backendUrl +'api/admin/login',{email,password,});

            if(data.success){
                localStorage.setItem('aToken',data.token)
                setAToken(data.token)
                console.log(data.token)        
// hange
            }
            else{
                toast.error(data.message)
            }

        } else{
        

        }

    } catch(error){

    }
    }

  return (
    <form onSubmit={onSubmitHandler} className = 'min-h-[80vh] flex items-center' >
        <div className = 'flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className = 'text-2xl font-semibold m-auto'><span className = 'text-primary'> {state} </span>Login</p>
        <div className='w-full'>
            <p>Email</p>
            <input onChange={(e)=>setEmail(e.target.value)} value = {email} className='border border-[#DADADA] rounded w-full p-2 mt-1 ' type="email" required/>
        </div>
        <div className='w-full'>
            <p>Password</p>
            <input onChange={(e)=>setPassword(e.target.value)} value = {password} className='border border-[#DADADA] rounded w-full p-2 mt-1 ' type="password" required/>
        </div>
        <button  type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'  >Login</button>
        {
            state ==='Admin'
            ? <p>Doctor Login? <span className='text-primary underline cursor-pointer' onClick={()=>setState('Doctor')}>Click here</span> </p>
            : <p>Admin Login? <span className='text-primary underline cursor-pointer' onClick={()=>setState('Admin')}>Click here</span> </p>

        }
        </div>
    </form>
  )
}

export default Login




// import React, { useContext, useState } from "react";
// import { AdminContext } from "../context/AdminContext";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { DoctorContext } from "../context/DoctorContext";
// const Login = () => {
//   const [state, setState] = useState("Admin");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const { setAtoken, backendUrl } = useContext(AdminContext);
//   const { setDtoken } = useContext(DoctorContext);


//   const onSubmitHandler = async (event) => {
//     event.preventDefault();
//     try {
//       if (state === "Admin") {
//         const { data } = await axios.post(backendUrl + "/api/admin/login", {
//           email,
//           password,
//         });
//         if (data.success) {
//           localStorage.setItem("AToken", data.token);
//           setAtoken(data.token);
//         } else {
//           toast.error(data.message);
//         }
//       } else {
//         const { data } = await axios.post(backendUrl + "/api/doctor/login", {
//           email,
//           password,
//         });
//         if (data.success) {
//           localStorage.setItem("dToken", data.token);
//           setDtoken(data.token);
//         } else {
//           toast.error(data.message);
//         }
//       }
//     } catch (error) {}
//   };
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <form
//         className="flex flex-col gap-6 items-start p-8 w-full max-w-md border border-gray-200 rounded-lg text-gray-700 shadow-lg bg-white"
//         onSubmit={onSubmitHandler}
//       >
//         <div className="w-full">
//           <p className="text-2xl font-semibold mb-4 text-gray-800 text-center">
//             <span className="text-blue-500">{state}</span> Login
//           </p>
//           <div className="w-full mb-4">
//             <label className="mb-2 font-medium">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => {
//                 setEmail(e.target.value);
//               }}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter your email"
//             />
//           </div>
//           <div className="w-full mb-4">
//             <label className="mb-2 font-medium">Password</label>
//             <input
//               type="password"
//               onChange={(e) => {
//                 setPassword(e.target.value);
//               }}
//               value={password}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter your password"
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full mt-4 px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
//           >
//             Login
//           </button>
//           <p className="mt-4 text-sm">
//             {state === "Admin" ? (
//               <span>
//                 Doctor Login{" "}
//                 <span
//                   className="text-blue-500 cursor-pointer hover:underline"
//                   onClick={() => setState("Doctor")}
//                 >
//                   Click here
//                 </span>
//               </span>
//             ) : (
//               <span>
//                 Admin Login{" "}
//                 <span
//                   className="text-blue-500 cursor-pointer hover:underline"
//                   onClick={() => setState("Admin")}
//                 >
//                   Click here
//                 </span>
//               </span>
//             )}
//           </p>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default Login;
