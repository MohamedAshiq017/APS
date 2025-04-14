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

    for (let i = 0; i < 7; i++) {
        const today = new Date();
        const checkDate = new Date(today.setDate(today.getDate() + i)).toISOString().split("T")[0];

        for (const [day, { date, slots: daySlots }] of availabilityEntries) {
            if (checkDate === date) {
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

                        if (!groupedSlots[checkDate]) {
                            groupedSlots[checkDate] = [];
                        }
                        groupedSlots[checkDate].push({
                            date: checkDate,
                            time,
                            day
                        });

                        startTime += 30;
                    }
                });
            }
        }
    }
    
    setDocSlots(groupedSlots);  // Set the grouped slots
};
  
  const bookAppointment = async() => {
    if (!token) {
    //   toast.warn("Please log in to book an appointment");
      toast.warning('Login to book appointment')
      return navigate("/login");
    }

  const selectedSlot = docSlots[slotIndex];
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


    

                                              ///c
      const date = new Date(docSlots[slotIndex].date);            
      let day = ("0" + date.getDate()).slice(-2);
let month = ("0" + (date.getMonth() + 1)).slice(-2);  // Month is zero-indexed
let year = date.getFullYear();
      const slotDate = day + "_" + month + "_" + year;
     
      try {  
      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime , userId: userData?._id,
          userData: userData},
        { headers: { token } } 
      );
      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/myAppointments");
      } else {
        toast.error(data.message);
      }

      console.log(data);
    } catch (error) {
      console.log(error);

      toast.error(error.message);
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
            className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full m-6 "
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
