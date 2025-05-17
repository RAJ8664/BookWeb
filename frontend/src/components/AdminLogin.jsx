import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { adminLoginSchema } from '../utils/validationSchemas';
import axios from "axios";
import getBaseUrl from '../utils/baseURL';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/features/auth/authSlice';
import Swal from 'sweetalert2';

const AdminLogin = () => {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(adminLoginSchema),
        mode: 'onBlur' // Validate on blur for better user experience
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        setMessage("");
        
        try {
            const response = await axios.post(`${getBaseUrl()}/api/auth/admin`, data, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const auth = response.data;
            
            if (auth.token) {
                localStorage.setItem('token', auth.token);
                
                // Store user data in Redux
                dispatch(setUser(auth.user));
                
                // Show login successful message
                Swal.fire({
                    title: 'Login Successful',
                    text: 'Welcome to the admin dashboard!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                
                // Set token expiration
                setTimeout(() => {
                    localStorage.removeItem('token');
                    dispatch(setUser(null));
                    Swal.fire({
                        title: 'Session Expired',
                        text: 'Please login again.',
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK'
                    });
                    navigate("/admin");
                }, 3600 * 1000);
                
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage(error.response?.data?.message || "Authentication failed. Please check your credentials.");
            Swal.fire({
                title: 'Login Failed',
                text: error.response?.data?.message || "Authentication failed. Please check your credentials.",
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Try Again'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-50 to-indigo-50'>
            <div role="main" aria-labelledby="login-heading" className='w-full max-w-md mx-auto bg-white shadow-2xl rounded-xl px-8 pt-8 pb-10 mb-4 border border-gray-100'>
                <div className="flex justify-center mb-6">
                    <div className="p-3 rounded-full bg-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <h2 id="login-heading" className='text-3xl font-bold mb-6 text-center text-gray-800'>Admin Portal</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                    <div>
                        <label className='block text-gray-700 text-sm font-semibold mb-2' htmlFor="username">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input 
                                {...register("username")} 
                                type="text" 
                                id="username" 
                                placeholder='Enter your username'
                                className={`pl-10 shadow-sm border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                                    errors.username ? 'border-red-500' : 'border-gray-300'
                                }`}
                                aria-invalid={errors.username ? "true" : "false"}
                                aria-describedby={errors.username ? "username-error" : ""}
                                autoComplete="username"
                            />
                        </div>
                        {errors.username && (
                            <p id="username-error" className='text-red-500 text-xs mt-1' role="alert">
                                {errors.username.message}
                            </p>
                        )}
                    </div>
                    
                    <div>
                        <label className='block text-gray-700 text-sm font-semibold mb-2' htmlFor="password">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input 
                                {...register("password")} 
                                type="password" 
                                id="password" 
                                placeholder='Enter your password'
                                className={`pl-10 shadow-sm border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                                    errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                                aria-invalid={errors.password ? "true" : "false"}
                                aria-describedby={errors.password ? "password-error" : ""}
                                autoComplete="current-password"
                            />
                        </div>
                        {errors.password && (
                            <p id="password-error" className='text-red-500 text-xs mt-1' role="alert">
                                {errors.password.message}
                            </p>
                        )}
                    </div>
                    
                    {message && (
                        <div 
                            className='p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-center'
                            role="alert"
                            aria-live="assertive"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {message}
                        </div>
                    )}
                    
                    <div>
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 transform hover:-translate-y-1 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            aria-busy={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging in...
                                </div>
                            ) : 'Sign In'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 border-t border-gray-200 pt-6">
                    <p className='text-center text-gray-600 text-sm'>©2025 BookWeb. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;