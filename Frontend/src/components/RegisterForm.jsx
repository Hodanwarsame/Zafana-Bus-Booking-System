import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterForm = ({ onRegister }) => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: [],
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [focusedField, setFocusedField] = useState(null);

    // Password strength checker
    const checkPasswordStrength = (password) => {
        const feedback = [];
        let score = 0;

        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push("At least 8 characters");
        }

        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push("One lowercase letter");
        }

        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push("One uppercase letter");
        }

        if (/[0-9]/.test(password)) {
            score += 1;
        } else {
            feedback.push("One number");
        }

        if (/[^a-zA-Z0-9]/.test(password)) {
            score += 1;
        } else {
            feedback.push("One special character (!@#$%^&*)");
        }

        return { score, feedback };
    };

    // Email validation
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError("");
            return true;
        }
        if (!emailRegex.test(email)) {
            setEmailError("⚠️ Please enter a valid email address (e.g., user@example.com)");
            return false;
        }
        setEmailError("");
        return true;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        // Real-time password strength check
        if (name === "password") {
            const strength = checkPasswordStrength(value);
            setPasswordStrength(strength);
        }

        // Real-time email validation
        if (name === "email") {
            validateEmail(value);
        }
    };

    const handleFocus = (fieldName) => {
        setFocusedField(fieldName);
    };

    const handleBlur = (fieldName) => {
        // Keep field focused state if it has value
        if (!form[fieldName]) {
            setFocusedField(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        // Validation checks
        if (form.password !== form.confirmPassword) {
            setMessage("⚠️ Passwords do not match. Please check and try again.");
            setIsLoading(false);
            return;
        }

        if (passwordStrength.score < 3) {
            setMessage("⚠️ Password is too weak. Please meet all requirements.");
            setIsLoading(false);
            return;
        }

        if (!validateEmail(form.email)) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:8000/api/register/",
                {
                    username: form.username,
                    email: form.email,
                    password: form.password,
                }
            );

            // Update App state with token and user_id
            if (onRegister) {
                onRegister(response.data.token, response.data.user_id);
            }

            // Redirect to BusList
            navigate("/");
        } catch (error) {
            // Better error messages - don't reveal too much
            const errorData = error.response?.data;
            if (errorData?.username) {
                setMessage("⚠️ This username is already taken. Please choose another.");
            } else if (errorData?.email) {
                setMessage("⚠️ This email is already registered. Try logging in instead.");
            } else {
                setMessage("⚠️ Registration failed. Please check your information and try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength.score === 0) return "bg-gray-200";
        if (passwordStrength.score <= 2) return "bg-red-500";
        if (passwordStrength.score <= 3) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength.score === 0) return "";
        if (passwordStrength.score <= 2) return "Weak";
        if (passwordStrength.score <= 3) return "Medium";
        return "Strong";
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-xl border border-gray-200">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">
                        Create a new account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Join us by filling in the information below.
                    </p>
                </div>

                {/* Privacy Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                    <p className="font-semibold mb-1">🔒 Security Notice:</p>
                    <p>Never share your password with anyone. We will never ask for your password via email or phone.</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                minLength={3}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={form.username}
                                onChange={handleChange}
                                onFocus={() => handleFocus('username')}
                                onBlur={() => handleBlur('username')}
                            />
                            {(focusedField === 'username' || form.username) && (
                                <small className="text-gray-500 text-xs mt-1 block">
                                    ⚠️ Must be at least 3 characters long
                                </small>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                    emailError ? "border-red-300" : "border-gray-300"
                                }`}
                                value={form.email}
                                onChange={handleChange}
                                onFocus={() => handleFocus('email')}
                                onBlur={() => handleBlur('email')}
                            />
                            {(focusedField === 'email' || form.email) && (
                                <>
                                    {emailError && (
                                        <small className="text-red-600 text-xs mt-1 block">
                                            {emailError}
                                        </small>
                                    )}
                                    {!emailError && (
                                        <small className="text-gray-500 text-xs mt-1 block">
                                            ⚠️ Use a valid email you can access for account recovery
                                        </small>
                                    )}
                                </>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <div className="relative">
                            <input
                                id="password"
                                name="password"
                                    type={showPassword ? "text" : "password"}
                                required
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
                                value={form.password}
                                onChange={handleChange}
                                    onFocus={() => handleFocus('password')}
                                    onBlur={() => handleBlur('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
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
                            
                            {/* Password Strength Indicator */}
                            {(focusedField === 'password' || form.password) && form.password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-600">Password Strength:</span>
                                        <span className={`text-xs font-semibold ${
                                            passwordStrength.score <= 2 ? "text-red-600" :
                                            passwordStrength.score <= 3 ? "text-yellow-600" : "text-green-600"
                                        }`}>
                                            {getPasswordStrengthText()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                        ></div>
                                    </div>
                                    {passwordStrength.feedback.length > 0 && (
                                        <ul className="mt-2 text-xs text-gray-600 space-y-1">
                                            <li className="font-semibold">⚠️ Requirements:</li>
                                            {passwordStrength.feedback.map((req, idx) => (
                                                <li key={idx} className="flex items-center">
                                                    <span className="text-red-500 mr-1">✗</span>
                                                    {req}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {passwordStrength.score === 5 && (
                                        <p className="mt-2 text-xs text-green-600 flex items-center">
                                            <span className="mr-1">✓</span>
                                            Password meets all requirements!
                                        </p>
                                    )}
                                </div>
                            )}
                            {(focusedField === 'password' || form.password) && (
                                <small className="text-gray-500 text-xs mt-1 block">
                                    ⚠️ Must be 8+ characters with uppercase, lowercase, number, and special character
                                </small>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10 ${
                                        form.confirmPassword && form.password !== form.confirmPassword
                                            ? "border-red-300"
                                            : form.confirmPassword && form.password === form.confirmPassword
                                            ? "border-green-300"
                                            : "border-gray-300"
                                    }`}
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus('confirmPassword')}
                                    onBlur={() => handleBlur('confirmPassword')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? (
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
                            {(focusedField === 'confirmPassword' || form.confirmPassword) && (
                                <>
                                    {form.confirmPassword && (
                                        <small className={`text-xs mt-1 block ${
                                            form.password === form.confirmPassword
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}>
                                            {form.password === form.confirmPassword ? (
                                                <span className="flex items-center">
                                                    <span className="mr-1">✓</span>
                                                    Passwords match
                                                </span>
                                            ) : (
                                                <span className="flex items-center">
                                                    <span className="mr-1">✗</span>
                                                    ⚠️ Passwords do not match
                                                </span>
                                            )}
                                        </small>
                                    )}
                                    <small className="text-gray-500 text-xs mt-1 block">
                                        ⚠️ Re-enter your password to confirm
                                    </small>
                                </>
                            )}
                        </div>
                    </div>

                    {message && (
                        <div
                            className={`rounded-md p-3 text-sm ${
                                message.toLowerCase().includes("failed") || message.includes("⚠️")
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : "bg-green-50 text-green-700 border border-green-200"
                            }`}
                        >
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || passwordStrength.score < 3 || form.password !== form.confirmPassword}
                        className="w-full flex justify-center py-2 px-4 border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Registering...
                            </>
                        ) : (
                            "Register"
                        )}
                    </button>

                    <p className="text-center text-sm text-gray-600 pt-2">
                        Already have an account?{" "}
                        <a
                            href="/login"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Log in
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
