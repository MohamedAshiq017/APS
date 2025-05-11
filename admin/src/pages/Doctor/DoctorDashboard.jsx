import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import {assets} from '../../assets/assets.js'
import { AppContext } from '../../context/AppContext.jsx'
import axios from 'axios'
import {toast} from 'react-toastify'

const DoctorDashboard = () => {
  const {dToken, dashData, backendUrl, setDashData, getDashData, completeAppointment, cancelAppointment, getProfileData, profileData} = useContext(DoctorContext)
  const {currency, slotDateFormat} = useContext(AppContext)
  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Generate initial availability state with today and next 6 days
  const [availability, setAvailability] = useState(() => {
    const defaultAvailability = {};
    const today = new Date();
    
    // Ensure we start with today's date
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      
      const dateString = nextDate.toISOString().split("T")[0];
      const weekdayName = weekDays[nextDate.getDay()];
      
      defaultAvailability[dateString] = {
        weekday: weekdayName,
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
      today.setHours(0, 0, 0, 0);
      
      const filteredAvailability = {};
      for (const [day, { date, slots }] of Object.entries(availability)) {
        const slotDate = new Date(date);
        slotDate.setHours(0, 0, 0, 0);
        
        // Only include dates from today onwards
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
      // Get the current date (today)
      const today = new Date();
      
      // Generate fresh 7-day availability starting from today
      const generatedAvailability = {};
      
      for (let i = 0; i < 7; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);
        
        const dateString = nextDate.toISOString().split("T")[0];
        const weekdayName = weekDays[nextDate.getDay()];
        
        generatedAvailability[dateString] = {
          weekday: weekdayName,
          date: dateString,
          slots: [{ start: "10:00", end: "13:00" }]
        };
      }
      
      console.log("🧪 [fetchAvailability] after default generation:", generatedAvailability);
      
      // Merge with backend data if available
      const { data } = await axios.get(backendUrl + '/api/doctor/availability', {
        headers: { dToken }
      });
      
      if (data.success) {
        // Get the date strings for our 7-day window
        const validDateStrings = Object.keys(generatedAvailability);
        
        for (const [key, value] of Object.entries(data.availability)) {
          const dateString = value.date;
          
          // Only merge if the date is within our 7-day window
          if (validDateStrings.includes(dateString)) {
            const weekdayName = weekDays[new Date(dateString).getDay()];
            
            generatedAvailability[dateString] = {
              weekday: weekdayName,
              date: dateString,
              slots: value.slots.length > 0 ? value.slots : [{ start: "10:00", end: "13:00" }]
            };
          }
        }
      } else {
        toast.error(data.message);
      }
      
      console.log("🧪 [fetchAvailability] after merging backend:", generatedAvailability);
      console.log("🧪 [fetchAvailability] FINAL to set:", generatedAvailability, 
                 "count:", Object.keys(generatedAvailability).length);
      
      setAvailability(generatedAvailability);
    } catch (err) {
      console.log(err);
      toast.error("Error loading availability");
    }
  };

  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken]);

  useEffect(() => {
    getProfileData();
    getDashData();
  }, []);

  useEffect(() => {
    if (dToken) {
      getDashData();
      getProfileData();
      fetchAvailability();
    }
  }, [dToken]);

  return dashData && (
    <div className='m-5'>
      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.earning_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{currency} {dashData.earnings}</p>
            <p className='text-gray-400'>Earnings</p>
          </div>
        </div>
        
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{dashData.appointments}</p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </div>
        
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">{dashData.patients}</p>
            <p className='text-gray-400'>Patients</p>
          </div>
        </div>
      </div>

      <div className='bg-white'>
        <div className='flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border'>
          <img src={assets.list_icon} alt="" />
          <p>Latest Bookings</p>
        </div>
        
        <div className='pt-4 border border-t-0'>
          {dashData.latestAppointments.map((item, index) => (
            <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100' key={index}>
              <img className='rounded-full w-10' src={item.userData.image} alt="" />
              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                <p className='text-gray-600'>{slotDateFormat(item.slotDate)} {item.slotTime}</p>
              </div>
              {item.cancelled
                ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                : item.isCompleted
                  ? <p className='text-green-500 text-xs font-medium'>Completed</p>
                  : <div className='flex'>
                      <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                      <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                    </div>
              }
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white mt-10 p-6 rounded shadow border">
        <h2 className="text-lg font-semibold mb-4">Set Slot Availability With Date</h2>
        
        {Object.keys(availability)
          .sort((a, b) => new Date(a) - new Date(b))
          .map((date, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 items-center mb-4">
              <div className="flex flex-col items-center">
                <input
                  type="date"
                  value={availability[date].date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setAvailability((prev) => ({
                      ...prev,
                      [date]: {
                        ...prev[date],
                        date: e.target.value,
                      },
                    }))}
                  className="border px-2 py-1 rounded"
                />
                <p className="text-sm text-gray-500">{availability[date].weekday}</p>
              </div>
              
              {availability[date].slots.map((slot, slotIndex) => (
                <div key={slotIndex} className="flex flex-col gap-2 mb-3">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => handleSlotChange(date, slotIndex, "start", e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => handleSlotChange(date, slotIndex, "end", e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                  <button
                    onClick={() => removeSlot(date, slotIndex)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => addSlot(date)}
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