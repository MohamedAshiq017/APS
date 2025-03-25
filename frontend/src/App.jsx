import React from 'react'
import { Route,Routes } from 'react-router-dom'
import Home from './pages/home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import NavBar from './components/NavBar'
import Contact from './pages/Contact'
import Header from './components/Header'
const App = () => {
  return (   //
    <div  className='mx-4 sm:mx-[10%]'>   
      <NavBar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/Doctors' element={<Doctors/>}/>
        <Route path='/Doctor/:speciality' element={<Doctors/>}/>
        <Route path='/Login' element={<Login/>}/>
        <Route path='/About' element={<About/>}/>
        <Route path='/Contact' element={<Contact/>}/>
        <Route path='/myProfile' element={<MyProfile/>}/>
        <Route path='/myAppointments' element={<MyAppointments/>}/>
        <Route path='/Appointment/:docId' element={<Appointment/>}/>
      </Routes>
    </div>
  )
}

export default App
