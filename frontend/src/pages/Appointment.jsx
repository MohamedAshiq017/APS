import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";



const Appointment = () => {
  const { docId } = useParams();

  const { doctors, currencySymbol, backendUrl, token,userData, getDoctorsData } =
    useContext(AppContext);

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
   
  const navigate = useNavigate();
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0); 
  const [slotTime, setSlotTime] = useState(0);

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId);
    // setDocInfo(docInfo);
    // console.log(docInfo)
    if (docInfo) {
      setDocInfo(docInfo);
      console.log("Fetched docInfo:", docInfo);
    }
    
  };

  console.log("docInfo has been set:", docInfo);


  const getAvailableSlots = async () => {
    if (!docInfo?.availability || Object.keys(docInfo.availability).length === 0) {
      setDocSlots([]);
      return;
    }
  
    const availabilityEntries = Object.entries(docInfo.availability);
    const groupedSlots = {};
    const today = new Date();
    const currentTime = new Date(); // Get current time
    
    // Loop from today to next 7 days
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const checkDateString = checkDate.toISOString().split("T")[0];
  
      for (const [day, { date, slots: daySlots }] of availabilityEntries) {
        if (checkDateString === date) {
          daySlots.forEach(slot => {
            const [startHour, startMin] = slot.start.split(":").map(Number);
            const [endHour, endMin] = slot.end.split(":").map(Number);
  
            let startTime = startHour * 60 + startMin;
            const endTime = endHour * 60 + endMin;
  
            while (startTime + 30 <= endTime) {
              const fromHour = Math.floor(startTime / 60);
              const fromMin = startTime % 60;
              const toHour = Math.floor((startTime + 30) / 60);
              const toMin = (startTime + 30) % 60;
  
              const time = `${String(fromHour).padStart(2, '0')}:${String(fromMin).padStart(2, '0')} - ${String(toHour).padStart(2, '0')}:${String(toMin).padStart(2, '0')}`;
              
              // Create date object for this slot
              const slotDate = new Date(checkDateString);
              slotDate.setHours(fromHour, fromMin, 0);
              
              // Format date for checking booked slots
              const dateObj = new Date(checkDateString);
              const day = ("0" + dateObj.getDate()).slice(-2);
              const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
              const year = dateObj.getFullYear();
              const formattedDate = `${day}_${month}_${year}`;
              
              // Check if slot is in the past
              const isPast = slotDate <= currentTime;
              
              // Check if slot is already booked
              const isBooked = docInfo.slots_booked && 
                                docInfo.slots_booked[formattedDate] && 
                                docInfo.slots_booked[formattedDate].includes(time);
              
              // Only add future and unbooked slots
              if (!isPast && !isBooked) {
                if (!groupedSlots[checkDateString]) {
                  groupedSlots[checkDateString] = [];
                }
  
                groupedSlots[checkDateString].push({
                  date: checkDateString,
                  time,
                  day
                });
              }
  
              startTime += 30;
            }
          });
        }
      }
    }
    
    // Filter out dates with no available slots
    const filteredSlots = Object.fromEntries(
      Object.entries(groupedSlots).filter(([_, slots]) => slots.length > 0)
    );
    
    setDocSlots(filteredSlots);
  };
  

  
  const bookAppointment = async() => {
    if (!token) {
    //   toast.warn("Please log in to book an appointment");
      toast.warning('Login to book appointment')
      return navigate("/login");
    }
      // Add this check right here to verify the slot is still valid
  const currentTime = new Date();
  if (slotTime) {
    const [fromTime] = slotTime.split(" - ");
    const [fromHour, fromMinute] = fromTime.split(":").map(Number);
    
    const selectedDateKey = Object.keys(docSlots)[slotIndex];
    const slotDateTime = new Date(selectedDateKey);
    slotDateTime.setHours(fromHour, fromMinute, 0);
    
    if (slotDateTime <= currentTime) {
      toast.warning("This time slot has expired. Please select another time.");
      setSlotTime(""); // Clear the selected time
      getAvailableSlots(); // Refresh available slots
      return;
    }
  }


    if (!slotTime) {
      toast.warning('Please select a time slot');
      return;
    }

    const selectedDateKey = Object.keys(docSlots)[slotIndex];
    const selectedSlot = docSlots[selectedDateKey];
  const [fromTime] = slotTime.split(" - ");
  const [fromHour, fromMinute] = fromTime.split(":").map(Number);

  const selectedDate = new Date(selectedSlot.date);
  selectedDate.setHours(fromHour);
  selectedDate.setMinutes(fromMinute);
  selectedDate.setSeconds(0);

  const now = new Date();
  if (selectedDate < now) {
    toast.warning("You can't book a past slot!");
    return;
  }


    

  const date = new Date(selectedDateKey);            
      let day = ("0" + date.getDate()).slice(-2);
let month = ("0" + (date.getMonth() + 1)).slice(-2);  // Month is zero-indexed
let year = date.getFullYear();
      const slotDate = day + "_" + month + "_" + year;
     
      try {  
      const { data } = await axios.post(
        backendUrl + "api/user/book-appointment",
        { docId, slotDate, slotTime , userId: userData?._id,
          userData: userData},
        { headers: { token } } 
      );
      if (data.success) {
        toast.success(data.message);
        console.log("Appointment is booked.")
        getDoctorsData();
        navigate("/myAppointments");
      } else {
        toast.error(data.message);
      }

      console.log(data);
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || error.message)
    }
  };///c

  

   useEffect(() => {
    if (doctors.length > 0) {
      fetchDocInfo();
    }
 
  }, [doctors, docId]);
  
  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);

 

  useEffect(() => {
    console.log(docSlots)
  },[docSlots])

  useEffect(() => {
  setDocInfo(null);      // clear previous doctor's info
  setDocSlots([]);       // clear slots
  setSlotIndex(0);       // reset selected index
  setSlotTime("");       // clear selected time
  if (doctors.length > 0) {
    fetchDocInfo();
  }
}, [doctors, docId]);


// Add this effect to periodically check for expired slots
useEffect(() => {
  // Check every minute for expired slots
  const intervalId = setInterval(() => {
    if (Object.keys(docSlots).length > 0) {
      getAvailableSlots(); // Refresh available slots
    }
  }, 60000); // Check every minute
  
  return () => clearInterval(intervalId); // Clean up
}, [docSlots]);

  return (
    docInfo && (
      <div>
        {/* {Doctor Details} */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-primary w-full sm:max-w-72 rounded-lg"
              src={docInfo.image}
              alt=""
            />
          </div>
          <div className="flex-1 border border-[#ADADAD]rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">

             {/* ----- Doc Info : name, degree, experience ----- */}

            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}{" "}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {docInfo.experience}
              </button>
            </div>

            {/* {Doctor About} */}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                {docInfo.about}
              </p>
            </div>
            <p className="text-gray-500 font-medium mt-4">
              Address: <span className="text-gray-600">{docInfo.address.line1} , {docInfo.address.line2}</span>
            </p>
            <p className="text-gray-500 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-600">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>

        {/* Booking Slots */}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking slots</p>
          <div className="flex gap-3 items-center w-full overflow-x-auto mt-4">
          {Object.keys(docSlots).map((date, index)=> (
    <div
      key={index}
      className={`text-center py-6 px-4 min-w-16 rounded-full cursor-pointer ${
        slotIndex === index
          ? "bg-primary text-white"
          : "border border-gray-200 text-gray-700"
      }`}
      onClick={() => {
        setSlotIndex(index);
        setSlotTime("");
      }}
    >
      <p>{daysOfWeek[new Date(date).getDay()]}</p>
      <p>{new Date(date).getDate()}</p>
    </div>
  ))}
</div>

{/* Render Slots for Selected Date */}
<div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
{docSlots[Object.keys(docSlots)[slotIndex]]?.map((item, index) => {
    const [fromHour, fromMin] = item.time.split(" - ")[0].split(":").map(Number);
    const slotDate = new Date(docSlots[slotIndex]?.date);
    slotDate.setHours(fromHour);
    slotDate.setMinutes(fromMin);
    slotDate.setSeconds(0);

    const currentTime = new Date();
    const isPast = slotDate < currentTime;

    return (
      <p
        onClick={!isPast ? () => setSlotTime(item.time) : null}
        key={index}
        className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${isPast ? "bg-gray-200 text-gray-500" : item.time === slotTime ? "bg-primary text-white" : "text-gray-400 border border-gray-300"}`}
      >
        {item.time}
      </p>
    );
  })}
</div>

<button
  onClick={bookAppointment}
  disabled={!slotTime || Object.keys(docSlots).length === 0}
  className={`text-white text-sm font-light px-14 py-3 rounded-full m-6 ${
    !slotTime || Object.keys(docSlots).length === 0 
      ? "bg-gray-300 cursor-not-allowed" 
      : "bg-primary"
  }`}
>
  Book an appointment
</button>
        </div>

        {/* ----------Related Doctors------------------ */}

        <RelatedDoctors
          docId={docId}
          speciality={docInfo.speciality}
        ></RelatedDoctors>
      </div>
    )
  );
};

export default Appointment;
