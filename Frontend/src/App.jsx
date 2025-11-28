import React, { useState } from 'react'
import RegisterForm from './components/RegisterForm'
import { Routes, Route } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import BusList from './components/BusList'
import BusSeats from './components/BusSeats'
import UserBookings from './components/UserBooking'
import Wrapper from './components/Wrapper'
import PaymentPage from './components/Payment'
import Dashboard from './components/Dashboard';


const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  const [selectedBusId, setSelectedBusId] = useState(null) 

  const handleLogin = (token, userId)=>{
    localStorage.setItem('token', token)
    localStorage.setItem('userId', userId)
    setToken(token)
    setUserId(userId)
  }

  const handleRegister = (token, userId)=>{
    localStorage.setItem('token', token)
    localStorage.setItem('userId', userId)
    setToken(token)
    setUserId(userId)
  }

  const handleLogout = ()=>{
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    setToken(null)
    setUserId(null)
    setSelectedBusId(null)
  }


  return (
    <div>
        
    <Wrapper token={token} handleLogout={handleLogout}>
    <Routes>
        <Route path='/register' element={<RegisterForm onRegister={handleRegister}/>}/>
        <Route path='/login' element={<LoginForm onLogin={handleLogin}/>}/>
        <Route path='/' element={<BusList onSelectBus={(id)=>setSelectedBusId(id)} token={token}/>} />
        <Route path='/bus/:busId' element={<BusSeats token={token}/>} />
        <Route path='/my-bookings' element={<UserBookings token={token} userId={userId} />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path='/dashboard' element={<Dashboard token={token}  />} />
      </Routes>
    </Wrapper>
    </div>
  )
}

export default App
