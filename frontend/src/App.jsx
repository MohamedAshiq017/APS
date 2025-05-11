import React from 'react'
import { Route,Routes } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import NavBar from './components/NavBar'
import Contact from './pages/Contact'
import Header from './components/Header'
import Footer from './components/Footer'

import {ToastContainer,toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
const App = () => {
  return (   //
    <div  className='mx-4 sm:mx-[10%]'>   
    <ToastContainer/>
      <NavBar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/doctors' element={<Doctors/>}/>
        <Route path='/doctors/:speciality' element={<Doctors/>}/>
        <Route path='/Login' element={<Login/>}/>
        <Route path='/About' element={<About/>}/>
        <Route path='/Contact' element={<Contact/>}/>
        <Route path='/myProfile' element={<MyProfile/>}/>
        <Route path='/myAppointments' element={<MyAppointments/>}/>
        <Route path='/Appointment/:docId' element={<Appointment/>}/>
      </Routes>
      <Footer/>
    </div>
  )
}

export default App
