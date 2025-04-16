import React, { useContext, useEffect,useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import {assets} from '../../assets/assets.js'
import { AppContext } from '../../context/AppContext.jsx'
import axios from 'axios'
import {toast} from 'react-toastify'
const DoctorDashboard = () => {


  const {dToken,dashData, backendUrl ,setDashData,getDashData,completeAppointment,cancelAppointment, getProfileData, profileData,} = useContext(DoctorContext)

  const{currency} = useContext(AppContext)
   const {slotDateFormat} = useContext(AppContext)

   const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

 

  // Function to calculate next available date for each weekday
  const getNextDate = (weekday) => {
    const today = new Date();
    const dayIndex = weekDays.indexOf(weekday);
    const currentDay = today.getDay(); // Sunday is 0, Monday is 1 ...
    // const diff = (dayIndex + 1 - currentDay + 7) % 7 || 7;
    // const nextDate = new Date(today);
    // nextDate.setDate(today.getDate() + diff);
    // return nextDate.toISOString().split('T')[0];

 
 // Calculate difference between target weekday and current day
 let diff = dayIndex - currentDay;

 // If target day is today or in the past, adjust the difference to the next week
 if (diff <= 0) {
   diff += 7;
 }

 const nextDate = new Date(today);
 nextDate.setDate(today.getDate() + diff); // Calculate the next available date for the target day
 return nextDate.toISOString().split('T')[0];
  
  };

  const [availability, setAvailability] = useState(() => {
    const savedAvailability = localStorage.getItem('doctorAvailability');
    if (savedAvailability) {
      return JSON.parse(savedAvailability);
    }
  
    const defaultAvailability = {};
const today = new Date();
const currentDay = today.getDay(); // Current day of the week
const startOfWeek = today; // Start from today

// Set dates for the next week up to Sunday + next Monday
for (let i = 0; i < 7; i++) {
  const nextDate = new Date(startOfWeek);
  nextDate.setDate(startOfWeek.getDate() + i); // Adding days

  const dateString = nextDate.toISOString().split("T")[0];
  const weekdayName = weekDays[(currentDay + i) % 7]; // Dynamically calculate weekday names

  defaultAvailability[weekdayName] = {
    date: dateString,
    slots: [{ start: "10:00", end: "13:00" }]
  };
}
  
    return defaultAvailability;
  });

  const addSlot = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: "", end: "" }]
      }
    }));
  };

  const removeSlot = (day, index) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSlotChange = (day, index, field, value) => {
    const newSlots = [...availability[day].slots];
    newSlots[index][field] = value;
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: newSlots
      }
    }));
  };

  const saveAvailability = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // For date-only comparison
  
      const filteredAvailability = {};
      for (const [day, { date, slots }] of Object.entries(availability)) {
        const slotDate = new Date(date);
        slotDate.setHours(0, 0, 0, 0);
        if (slotDate >= today) {
          filteredAvailability[day] = { date, slots };
        }
      }
  
      const saveData = { availability: filteredAvailability };
  
      const { data } = await axios.post(
        backendUrl + '/api/doctor/set-availability',
        saveData,
        { headers: { dToken } }
      );
  
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to save availability.");
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/availability", {
        headers: { dToken }
      });
      if (data.success) {
        setAvailability(data.availability);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Error loading availability");
    }
  };

  useEffect(()=>{
   
    if(dToken){

      getDashData ()
   
    }
  },[dToken])

  useEffect(() => {
    getProfileData();
    getDashData();
  }, []);


  useEffect(() => {
    if (dToken) {
      getDashData();
      getProfileData();
      fetchAvailability(); // 🚀 Fetch from DB not localStorage
    }
  }, [dToken]);



  return dashData &&(
    <div className='m-5'>
        <div className='flex flex-wrap gap-3'>
        
              <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                <img className='w-14'  src={assets.earning_icon} alt="" />
              <div>
                <p className = "text-xl font-semibold text-gray-600">{currency} {dashData.earnings}</p>
                <p className = 'text-gray-400'>Earnings</p>
              </div>
              </div>
        
              <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                <img className='w-14' src={assets.appointments_icon} alt="" />
              <div>
              <p className = "text-xl font-semibold text-gray-600">{dashData.appointments}</p>
              <p className = 'text-gray-400'>Appointments</p>
              </div>
              </div>
        
              <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                <img className='w-14' src={assets.patients_icon} alt="" />
              <div>
              <p className = "text-xl font-semibold text-gray-600">{dashData.patients}</p>
              <p className = 'text-gray-400'>Patients</p>
              </div>
              </div>
        
            </div>



             <div className='bg-white'>
                  <div className='flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border'>
                    <img src={assets.list_icon} alt="" />
                    <p>Latest Bookings</p>
                  </div>
            
            
                <div className='pt-4 border border-t-0'>
                  {
                    dashData.latestAppointments.map((item,index)=>(
                      <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100' key ={index}>
                        <img className='rounded-full w-10' src={item.userData.image} alt="" />
                        <div className='flex-1 text-sm' >
                        <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                        <p className='text-gray-600'>{slotDateFormat(item.slotDate)} {item.slotTime}</p>
                        </div>
                        {
                                      item.cancelled
                                      ? <p className='text-red-400 text-xs font-medium' >Cancelled</p>
                                      : item.isCompleted
                                         ?<p className='text-green-500 text-xs font-medium'>Completed</p>
                                         : <div className='flex'>
                                         <img onClick={()=>cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                                         <img onClick={()=>completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                                       </div>
                                    }
            
                      </div>
                    ))
                  }
                </div>
                  
                </div>

      <div className="bg-white mt-10 p-6 rounded shadow border">
      <h2 className="text-lg font-semibold mb-4">Set Slot Availability With Date</h2>
      {Object.keys(availability).map((day, index) => (
  <div key={index} className="flex flex-col md:flex-row gap-4 items-center mb-4">
    <div className="flex flex-col items-center">
      <input
        type="date"
        value={availability[day].date}
        min={new Date().toISOString().split("T")[0]}
        onChange={(e) =>
          setAvailability((prev) => ({
            ...prev,
            [day]: {
              ...prev[day],
              date: e.target.value,
            },
          }))}
        className="border px-2 py-1 rounded"
      />
      <p className="text-sm text-gray-500">{day}</p> {/* Day displayed under date */}
    </div>
    
    {availability[day].slots.map((slot, slotIndex) => (
      <div key={slotIndex} className="flex flex-col gap-2 mb-3">
        <input
          type="time"
          value={slot.start}
          onChange={(e) => handleSlotChange(day, slotIndex, "start", e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="time"
          value={slot.end}
          onChange={(e) => handleSlotChange(day, slotIndex, "end", e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={() => removeSlot(day, slotIndex)}
          className="text-red-500 hover:underline text-sm"
        >
          Remove
        </button>
      </div>
    ))}
    
    <button
      onClick={() => addSlot(day)}
      className="text-blue-500 hover:underline text-sm"
    >
      + Add Slot
    </button>
  </div>
))}

        <button
          onClick={saveAvailability}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Availability
        </button>
      </div>
    </div>
  );
};

export default DoctorDashboard;