import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

const LoginForm = ({ onLogin }) => {
    const [form, setForm] = useState({
        email: '', password: ''
    })
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [failedAttempts, setFailedAttempts] = useState(0)
    const [showPassword, setShowPassword] = useState(false)
    const [isLocked, setIsLocked] = useState(false)
    const [lockoutTime, setLockoutTime] = useState(null)
    const [focusedField, setFocusedField] = useState(null)
    const [emailError, setEmailError] = useState('')

    const navigate = useNavigate()
    const location = useLocation();
    const from = location.state?.from || '/';

    // Load failed attempts from localStorage on mount
    useEffect(() => {
        const storedAttempts = localStorage.getItem('failedLoginAttempts')
        const storedLockout = localStorage.getItem('loginLockoutTime')
        
        if (storedAttempts) {
            setFailedAttempts(parseInt(storedAttempts))
        }
        
        if (storedLockout) {
            const lockoutTimestamp = parseInt(storedLockout)
            const now = Date.now()
            if (now < lockoutTimestamp) {
                setIsLocked(true)
                setLockoutTime(lockoutTimestamp)
            } else {
                // Lockout expired, clear it
                localStorage.removeItem('loginLockoutTime')
                localStorage.removeItem('failedLoginAttempts')
            }
        }
    }, [])

    // Check if still locked out
    useEffect(() => {
        if (lockoutTime) {
            const interval = setInterval(() => {
                const now = Date.now()
                if (now >= lockoutTime) {
                    setIsLocked(false)
                    setLockoutTime(null)
                    localStorage.removeItem('loginLockoutTime')
                    localStorage.removeItem('failedLoginAttempts')
                    setFailedAttempts(0)
                }
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [lockoutTime])

    // Email validation
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError('');
            return true;
        }
        if (!emailRegex.test(email)) {
            setEmailError('⚠️ Please enter a valid email address');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value })
        
        // Clear error message when user starts typing
        if (message) {
            setMessage('')
        }

        // Real-time email validation
        if (name === 'email') {
            validateEmail(value);
        }
    }

    const handleFocus = (fieldName) => {
        setFocusedField(fieldName);
    }

    const handleBlur = (fieldName) => {
        // Keep field focused state if it has value
        if (!form[fieldName]) {
            setFocusedField(null);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Check if account is locked
        if (isLocked) {
            const remainingTime = Math.ceil((lockoutTime - Date.now()) / 1000 / 60)
            setMessage(`⚠️ Account temporarily locked due to too many failed attempts. Please try again in ${remainingTime} minute(s).`)
            return
        }

        if (!validateEmail(form.email)) {
            setMessage('⚠️ Please enter a valid email address');
            return;
        }

        setIsLoading(true)
        setMessage('')
        
        try {
            const response = await axios.post('http://localhost:8000/api/login/', form)
            
            // Successful login - reset failed attempts
            localStorage.removeItem('failedLoginAttempts')
            localStorage.removeItem('loginLockoutTime')
            setFailedAttempts(0)
            setMessage('Login Success')
            
            if (onLogin) {
                onLogin(
                    response.data.token,
                    response.data.user_id,
                    response.data.username || form.email,
                    form.email
                )
            }
            navigate(from, { replace: true })
        } catch (error) {
            // Increment failed attempts
            const newAttempts = failedAttempts + 1
            setFailedAttempts(newAttempts)
            localStorage.setItem('failedLoginAttempts', newAttempts.toString())

            // Lock account after 5 failed attempts for 15 minutes
            if (newAttempts >= 5) {
                const lockoutDuration = 15 * 60 * 1000 // 15 minutes in milliseconds
                const lockoutEndTime = Date.now() + lockoutDuration
                setIsLocked(true)
                setLockoutTime(lockoutEndTime)
                localStorage.setItem('loginLockoutTime', lockoutEndTime.toString())
                setMessage('⚠️ Too many failed login attempts. Your account has been temporarily locked for 15 minutes. Please try again later.')
            } else {
                // Generic error message - don't reveal if email or password is wrong
                const remainingAttempts = 5 - newAttempts
                setMessage(`⚠️ Invalid email or password. ${remainingAttempts} attempt(s) remaining before account lockout.`)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const getRemainingLockoutTime = () => {
        if (!lockoutTime) return null
        const remaining = Math.ceil((lockoutTime - Date.now()) / 1000 / 60)
        return remaining > 0 ? remaining : 0
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-xl border border-gray-200">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Sign In
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Welcome back! Please enter your details.
                    </p>
                </div>

                {/* Security Warning */}
                {/* <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                    <p className="font-semibold mb-1">🔒 Security Notice:</p>
                    <p>If you're using a public or shared computer, remember to log out after your session.</p>
                </div> */}

                {/* Failed Attempts Warning */}
                {failedAttempts > 0 && failedAttempts < 5 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-sm text-orange-800">
                        <p className="font-semibold">⚠️ Failed Login Attempts: {failedAttempts}/5</p>
                        <p>After 5 failed attempts, your account will be temporarily locked for 15 minutes.</p>
                    </div>
                )}

                {/* Account Locked Warning */}
                {isLocked && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
                        <p className="font-semibold">🔒 Account Temporarily Locked</p>
                        <p>Too many failed login attempts. Please try again in {getRemainingLockoutTime()} minute(s).</p>
                    </div>
                )}

                {/* Privacy Notice */}
                {/* <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                    <p className="font-semibold mb-1">🔐 Privacy Reminder:</p>
                    <p>Never share your password with anyone. We will never ask for your password via email or phone.</p>
                </div> */}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                disabled={isLocked}
                                className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${
                                    isLocked ? 'bg-gray-100 cursor-not-allowed' : emailError ? 'border-red-300' : 'border-gray-300'
                                }`}
                                value={form.email}
                                onChange={handleChange}
                                onFocus={() => handleFocus('email')}
                                onBlur={() => handleBlur('email')}
                            />
                            {(focusedField === 'email' || form.email) && (
                                <small className={`text-xs mt-1 block ${emailError ? 'text-red-600' : 'text-gray-500'}`}>
                                    {emailError || '⚠️ Enter your registered email address'}
                                </small>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    disabled={isLocked}
                                    className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 pr-10 ${
                                        isLocked ? 'bg-gray-100 cursor-not-allowed' : ''
                                    }`}
                                    value={form.password}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus('password')}
                                    onBlur={() => handleBlur('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLocked}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {(focusedField === 'password' || form.password) && (
                                <small className="text-gray-500 text-xs mt-1 block">
                                    ⚠️ Keep your password secure and never share it
                                </small>
                            )}
                        </div>
                    </div>

                    {message && (
                        <div className={`rounded-md p-3 text-sm ${
                            message.includes('Success')
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || isLocked}
                        className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Signing in...
                            </>
                        ) : isLocked ? 'Account Locked' : 'Sign in'}
                    </button>

                    {/* Registration Link */}
                    <p className="text-center text-sm text-gray-600 pt-2">
                        Don't have an account?{' '}
                        <a
                            href="/register"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Register
                        </a>
                    </p>

                    {/* Forgot Password Link */}
                    <p className="text-center text-xs text-gray-500 pt-1">
                        Forgot your password?{' '}
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setMessage('⚠️ Password recovery feature coming soon. Please contact support if you need assistance.')
                            }}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Reset password
                        </a>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default LoginForm
