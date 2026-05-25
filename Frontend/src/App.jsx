import React, { useState } from 'react'
import RegisterForm from './components/RegisterForm'
import { Routes, Route } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import BusList from './components/BusList'
import BusSeats from './components/BusSeats'
import UserBookings from './components/UserBooking'
import Wrapper from './components/Wrapper'
import PaymentPage from './components/Payment'
import About from './components/About'


const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));

  const [selectedBusId, setSelectedBusId] = useState(null) 

  const handleLogin = (token, userId, username, email)=>{
    localStorage.setItem('token', token)
    localStorage.setItem('userId', userId)
    if (username) {
      localStorage.setItem('userName', username)
      setUserName(username)
    }
    if (email) {
      localStorage.setItem('userEmail', email)
      setUserEmail(email)
    }
    setToken(token)
    setUserId(userId)
  }

  const handleRegister = (token, userId, username, email)=>{
    localStorage.setItem('token', token)
    localStorage.setItem('userId', userId)
    if (username) {
      localStorage.setItem('userName', username)
      setUserName(username)
    }
    if (email) {
      localStorage.setItem('userEmail', email)
      setUserEmail(email)
    }
    setToken(token)
    setUserId(userId)
  }

  const handleLogout = ()=>{
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    setToken(null)
    setUserId(null)
    setUserName(null)
    setUserEmail(null)
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
        <Route path="/about" element={<About />} />

      </Routes>
    </Wrapper>
    </div>
  )
}

export default App
