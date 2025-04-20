import React, { useContext } from 'react'
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login'
import { ToastContainer,toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AdminContext } from './context/AdminContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

import Dashboard from './pages/Admin/Dashboard.jsx'
import AllAppointments from './pages/Admin/AllAppointments.jsx'
import AddDoctor from './pages/Admin/AddDoctor.jsx'
import DoctorsList from './pages/Admin/DoctorsList.jsx'
import { DoctorContext } from './context/DoctorContext';
import DoctorDashboard from './pages/Doctor/DoctorDashboard.jsx';
import DoctorAppointments from './pages/Doctor/DoctorAppointments.jsx';
import DoctorProfile from './pages/Doctor/DoctorProfile.jsx';




const App = () => {

const {aToken} =  useContext(AdminContext)
const {dToken} =  useContext(DoctorContext)




  return aToken || dToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer/> 
      <Navbar/>
      <div className='flex items-start'>
        <Sidebar/>
        <div className="pt-16 ml-20 md:ml-72">
        <Routes>
          {/* Admin Route */}
          <Route path='/' element ={<></>}/>
          <Route path='/admin-dashboard' element ={<Dashboard/>}/>
          <Route path='/all-appointments' element ={<AllAppointments/>}/>
          <Route path='/add-doctors' element ={<AddDoctor/>}/>
          <Route path='/doctor-list' element ={<DoctorsList/>}/>

          {/* Doctor route */}
          <Route path='/doctor-dashboard' element ={<DoctorDashboard/>}/>
          <Route path='/doctor-appointments' element ={<DoctorAppointments/>}/>
          <Route path='/doctor-profile' element ={<DoctorProfile/>}/>
        </Routes>
        </div>
      </div>
    </div>
  )
  :(
    <>
     <Login/>
     <ToastContainer/> 
    </>
  )
}

export default App