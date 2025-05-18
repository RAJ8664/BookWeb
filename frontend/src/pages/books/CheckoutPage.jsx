import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from "react-hook-form"
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clearCart, updateCartItem } from '../../redux/features/cart/cartSlice';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksAPI';

import Swal from 'sweetalert2';
import { useCreateOrderMutation } from '../../redux/features/orders/ordersApi';
import PaymentHandler from '../../components/payments/PaymentHandler';

// Import icons
import { 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCity, 
  FaGlobe, 
  FaMapPin, 
  FaMoneyBillWave, 
  FaCreditCard, 
  FaPaypal,
  FaShippingFast,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { 
  MdEmail, 
  MdLocalShipping, 
  MdPayment, 
  MdLocationOn, 
  MdShoppingCart, 
  MdCheckCircle,
  MdPendingActions,
  MdComment
} from 'react-icons/md';
import { FiPackage, FiCreditCard, FiAlertCircle } from 'react-icons/fi';
import { RiEBike2Fill } from 'react-icons/ri';
import { TbTruckDelivery } from 'react-icons/tb';
import { SiEsea } from 'react-icons/si';

const CheckoutPage = () => {
    const cartItems = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    
    // State to track newly created order
    const [createdOrder, setCreatedOrder] = useState(null);
    const [isOrderProcessing, setIsOrderProcessing] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    
    // Fetch latest book data to ensure prices are up-to-date
    const { data: latestBooks, isLoading: booksLoading } = useFetchAllBooksQuery();
    const [createOrder, {isLoading}] = useCreateOrderMutation();
    
    // Form setup
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm({
        defaultValues: {
            name: user?.displayName || "",
            email: user?.email || "",
            address: "",
            city: "",
            state: "",
            country: "",
            zipcode: "",
            phone: "",
            paymentMethod: "Cash on Delivery" // Default payment method
        }
    });
    
    // Get the current value of paymentMethod
    const selectedPaymentMethod = watch("paymentMethod");
    
    // Load saved address from localStorage
    const [savedAddress, setSavedAddress] = useState(null);
    
    // Update cart items with latest book data
    useEffect(() => {
        if (latestBooks && cartItems.length > 0) {
            cartItems.forEach(cartItem => {
                // Find matching book in latest data
                const updatedBook = latestBooks.find(book => book._id === cartItem._id);
                if (updatedBook && updatedBook.price !== cartItem.price) {
                    // Silently update cart item with latest price
                    dispatch(updateCartItem({
                        _id: cartItem._id,
                        price: updatedBook.price,
                        // Keep other properties
                        quantity: cartItem.quantity
                    }));
                }
            });
        }
    }, [latestBooks, cartItems, dispatch]);
    
    // Load saved address from localStorage
    useEffect(() => {
        if (user?.email) {
            const storedAddress = localStorage.getItem(`address_${user.email}`);
            if (storedAddress) {
                setSavedAddress(JSON.parse(storedAddress));
            }
        }
    }, [user]);
    
    // Set saved address values when they are loaded
    useEffect(() => {
        if (savedAddress) {
            setValue('address', savedAddress.street || '');
            setValue('city', savedAddress.city || '');
            setValue('state', savedAddress.state || '');
            setValue('country', savedAddress.country || '');
            setValue('zipcode', savedAddress.zipcode || '');
            setValue('phone', savedAddress.phone || '');
        }
    }, [savedAddress, setValue]);
    
    // Redirect if cart is empty
    useEffect(() => {
        if (!loading && cartItems.length === 0 && !createdOrder) {
            Swal.fire({
                title: "Empty Cart",
                text: "Your cart is empty. Add some items before checkout.",
                icon: "info",
                confirmButtonColor: "#3085d6"
            }).then(() => {
                navigate("/");
            });
        }
    }, [cartItems, loading, navigate, createdOrder]);
    
    // Redirect if not logged in
    useEffect(() => {
        // Only redirect if we're sure the user is not logged in (not loading and no user)
        if (!loading && (!user || !user.email)) {
            Swal.fire({
                title: "Authentication Required",
                text: "You need to be logged in to access the checkout page",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Login",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33"
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/login");
                } else {
                    navigate("/");
                }
            });
        }
    }, [user, loading, navigate]);
    
    const totalPrice = cartItems.length > 0 
        ? cartItems.reduce((acc, item) => {
            const price = item.newPrice || item.price || 0;
            const quantity = item.quantity || 1;
            return acc + (typeof price === 'number' ? price * quantity : 0);
          }, 0).toFixed(2)
        : "0.00";
    
    // Combine loading states
    const isPageLoading = loading || booksLoading;
    
    const onSubmit = async (data) => {
        try {
            setIsOrderProcessing(true);
            const numericTotalPrice = parseFloat(totalPrice);
            
            if (isNaN(numericTotalPrice)) {
                Swal.fire({
                    title: "Invalid Order",
                    text: "There was an error calculating the total price. Please try again.",
                    icon: "error",
                    confirmButtonColor: "#3085d6"
                });
                setIsOrderProcessing(false);
                return;
            }
            
            const newOrder = {
                name: data.name,
                email: user.email,
                address: {
                    street: data.address,
                    city: data.city,
                    country: data.country,
                    state: data.state,
                    zipcode: data.zipcode
                },
                phone: data.phone,
                productIds: cartItems.map(item => item?._id),
                products: cartItems.map(item => ({
                    id: item?._id,
                    title: item?.title,
                    price: item?.price || item?.newPrice,
                    quantity: item?.quantity || 1
                })),
                totalPrice: numericTotalPrice,
                orderDate: new Date().toISOString(),
                status: "pending",
                paymentMethod: data.paymentMethod,
                shippingMethod: data.shippingMethod || "Standard",
                specialInstructions: data.specialInstructions || ""
            }
            
            // Create the order in the database
            const savedOrder = await createOrder(newOrder).unwrap();
            setCreatedOrder(savedOrder);
            
            // If payment method is not eSewa, clear cart and redirect to orders page
            if (data.paymentMethod !== 'eSewa') {
                dispatch(clearCart());
                Swal.fire({
                    title: "Order Confirmed!",
                    text: "Your order has been placed successfully!",
                    icon: "success",
                    confirmButtonColor: "#3085d6"
                });
                navigate("/orders");
            }
        } catch (error) {
            console.error("Error placing order:", error);
            Swal.fire({
                title: "Order Failed",
                text: error?.data?.message || "Failed to place your order. Please try again.",
                icon: "error",
                confirmButtonColor: "#3085d6"
            });
        } finally {
            setIsOrderProcessing(false);
        }
    }

    // If a payment is being processed, show the payment handler
    if (createdOrder) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-6">
                <div className="container mx-auto max-w-3xl">
                    <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="rounded-full bg-blue-100 p-4">
                                    <MdCheckCircle className="text-4xl text-blue-600" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Order Created Successfully!</h2>
                            <p className="text-gray-500 mt-2 flex items-center justify-center">
                                <FiPackage className="mr-2 text-blue-500" />
                                Order #{createdOrder._id}
                            </p>
                        </div>
                        
                        <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-100">
                            <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                                <MdPayment className="mr-2 text-blue-600" />
                                Complete Your Payment
                            </h3>
                            <p className="text-gray-600 mb-6 flex items-center text-sm">
                                <FiAlertCircle className="mr-2 text-blue-500" />
                                Please complete your payment using the selected method below.
                            </p>
                            
                            {/* Payment handler component */}
                            <PaymentHandler 
                                paymentMethod={createdOrder.paymentMethod} 
                                orderId={createdOrder._id} 
                            />
                        </div>
                        
                        <div className="text-center mt-8">
                            <button
                                onClick={() => {
                                    // Always clear the cart when going to orders, regardless of payment method
                                    dispatch(clearCart());
                                    navigate("/orders");
                                }}
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded flex items-center mx-auto transition-all duration-300 hover:-translate-y-1"
                            >
                                <FiPackage className="mr-2" />
                                Go to Orders
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if(isLoading || isOrderProcessing) {
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50">
            <div className="text-center bg-white p-8 rounded-xl shadow-md">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
                <p className="mt-6 text-gray-600 font-medium">Processing your order...</p>
                <p className="mt-2 text-gray-500 text-sm">Please wait while we create your order.</p>
            </div>
        </div>;
    }
    
    // If still loading, show loading
    if (isPageLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50">
            <div className="text-center bg-white p-8 rounded-xl shadow-md">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
                <p className="mt-6 text-gray-600 font-medium">Loading checkout page...</p>
                <p className="mt-2 text-gray-500 text-sm">Please wait while we prepare your checkout experience.</p>
            </div>
        </div>;
    }
    
    // If not logged in after loading is complete, show a message
    if (!user || !user.email) {
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
                <div className="text-red-500 text-5xl mb-4 flex justify-center">
                    <FiAlertCircle />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
                <p className="text-gray-600 mb-6">You need to be logged in to access the checkout page.</p>
                <button 
                    onClick={() => navigate("/login")}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:-translate-y-1 flex items-center mx-auto"
                >
                    <FaUser className="mr-2" />
                    Go to Login
                </button>
            </div>
        </div>;
    }
    
    // If cart is empty after loading is complete, show a message
    if (cartItems.length === 0 && !createdOrder) {
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
                <div className="text-blue-500 text-5xl mb-4 flex justify-center">
                    <FiPackage />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
                <p className="text-gray-600 mb-6">Add some items to your cart before proceeding to checkout.</p>
                <button 
                    onClick={() => navigate("/")}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:-translate-y-1 flex items-center mx-auto"
                >
                    <MdShoppingCart className="mr-2" />
                    Browse Books
                </button>
            </div>
        </div>;
    }
    
    return (
      <section className="bg-gray-100">
        <div className="min-h-screen p-6 flex items-center justify-center">
          <div className="container max-w-screen-lg mx-auto">
            <div className="space-y-6">
              {/* Checkout Header Section */}
              <div className="flex justify-between items-start gap-6 flex-wrap">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FiCreditCard className="text-blue-600 mr-2" />
                    Checkout
                  </h2>
                  <div className="space-y-1 text-gray-600">
                    <p className="flex items-center">
                      <MdPayment className="text-green-500 mr-2" />
                      Total Price: <span className="font-semibold ml-1">Rs.{totalPrice}</span>
                    </p>
                    <p className="flex items-center">
                      <FiPackage className="text-blue-500 mr-2" />
                      Items: <span className="font-semibold ml-1">{cartItems.reduce((total, item) => total + (item.quantity || 1), 0)}</span>
                    </p>
                  </div>
                </div>
    
                {/* Order Summary Card */}
                <div className="bg-blue-50 p-6 rounded-lg shadow-md flex-1 max-w-md hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <MdShoppingCart className="text-blue-600 text-2xl mr-2" />
                    <h3 className="text-lg font-semibold text-blue-800">Order Summary</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600 mb-4">
                    {cartItems.map((item, index) => (
                      <li key={index} className="flex justify-between items-center border-b border-blue-100 pb-2">
                        <div className="flex items-center">
                          <FiPackage className="text-blue-500 mr-2" />
                          <span>{item.title} <span className="text-blue-500 font-medium">×{item.quantity || 1}</span></span>
                        </div>
                        <span className="font-medium text-blue-700">
                          Rs.{((item.newPrice || item.price) * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-blue-200 pt-3 flex justify-between font-semibold text-gray-800">
                    <div className="flex items-center">
                      <MdPayment className="text-blue-600 mr-2" />
                      <span>Total:</span>
                    </div>
                    <span className="text-blue-700 text-lg">Rs.{totalPrice}</span>
                  </div>
                </div>
              </div>
    
              {/* Form Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-all duration-300">
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
                  {/* Form Header */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        <FaUser className="text-blue-600 mr-2" />
                        Personal Details
                      </h3>
                      <p className="text-gray-500 text-sm">Please fill out all the fields.</p>
                    </div>
                    
                    {/* Saved Address Notice */}
                    {savedAddress && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100 animate__animated animate__fadeIn">
                        <p className="font-medium text-green-700 flex items-center">
                          <MdCheckCircle className="text-green-500 mr-2" />
                          Address Loaded
                        </p>
                        <p className="text-xs text-green-600 mt-1 flex items-center ml-5">
                          Your saved delivery address has been applied
                        </p>
                      </div>
                    )}
                    
                    {/* Payment Options */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700 flex items-center">
                        <MdPayment className="text-blue-600 mr-2" />
                        Payment Methods
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <label 
                          className={`p-4 border rounded-lg flex items-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedPaymentMethod === "Cash on Delivery" 
                              ? "border-blue-500 bg-blue-50 shadow-sm" 
                              : "border-gray-200"
                          }`}
                        >
                          <input 
                            type="radio"
                            value="Cash on Delivery"
                            {...register("paymentMethod")}
                            className="mr-2"
                          />
                          <div className="flex items-center">
                            <FaMoneyBillWave className={`mr-2 text-lg ${selectedPaymentMethod === "Cash on Delivery" ? "text-blue-600" : "text-gray-500"}`} />
                            <span>Cash on Delivery</span>
                          </div>
                        </label>
                        
                        <label 
                          className={`p-4 border rounded-lg flex items-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedPaymentMethod === "eSewa" 
                              ? "border-green-500 bg-green-50 shadow-sm" 
                              : "border-gray-200"
                          }`}
                        >
                          <input 
                            type="radio"
                            value="eSewa"
                            {...register("paymentMethod")}
                            className="mr-2"
                          />
                          <div className="flex items-center">
                            <SiEsea className={`mr-2 text-lg ${selectedPaymentMethod === "eSewa" ? "text-green-600" : "text-gray-500"}`} />
                            <span>eSewa</span>
                          </div>
                        </label>
                        
                        <label 
                          className={`p-4 border rounded-lg flex items-center cursor-pointer transition-all duration-200 ${
                            selectedPaymentMethod === "Credit Card" 
                              ? "border-purple-500 bg-purple-50 shadow-sm" 
                              : "border-gray-200 text-gray-400"
                          }`}
                        >
                          <input 
                            type="radio"
                            value="Credit Card"
                            {...register("paymentMethod")}
                            className="mr-2"
                            disabled
                          />
                          <div className="flex items-center">
                            <FaCreditCard className="mr-2 text-lg text-gray-400" />
                            <span>Credit Card</span>
                          </div>
                        </label>
                        
                        <label 
                          className={`p-4 border rounded-lg flex items-center cursor-pointer transition-all duration-200 ${
                            selectedPaymentMethod === "PayPal" 
                              ? "border-blue-500 bg-blue-50 shadow-sm" 
                              : "border-gray-200 text-gray-400"
                          }`}
                        >
                          <input 
                            type="radio"
                            value="PayPal"
                            {...register("paymentMethod")}
                            className="mr-2"
                            disabled
                          />
                          <div className="flex items-center">
                            <FaPaypal className="mr-2 text-lg text-gray-400" />
                            <span>PayPal</span>
                          </div>
                        </label>
                      </div>
                      {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod.message}</p>}
                    </div>
                  </div>
    
                  {/* Form Fields */}
                  <div className="lg:col-span-2">
                    <div className="grid gap-4 gap-y-4 text-sm md:grid-cols-5">
                      {/* Full Name */}
                      <div className="md:col-span-5">
                        <InputField
                          label="Full Name"
                          id="name"
                          register={register}
                          required="Full name is required"
                          error={errors.name}
                          icon={FaUser}
                        />
                      </div>
    
                      {/* Email */}
                      <div className="md:col-span-5">
                        <label className="block font-medium text-gray-700 mb-1 flex items-center">
                          <MdEmail className="mr-2 text-blue-500" />
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MdEmail className="text-gray-400" />
                          </div>
                          <input
                            {...register("email")}
                            type="email"
                            id="email"
                            className="h-10 w-full pl-10 bg-gray-100 rounded border border-gray-200 text-gray-500"
                            placeholder="email@domain.com"
                            defaultValue={user?.email || ""}
                            readOnly
                          />
                        </div>
                      </div>
    
                      {/* Phone Number */}
                      <div className="md:col-span-5">
                        <InputField
                          label="Phone Number"
                          id="phone"
                          type="tel"
                          register={register}
                          required="Phone number is required"
                          pattern={{
                            value: /^[0-9]{10,15}$/,
                            message: "Please enter a valid phone number"
                          }}
                          error={errors.phone}
                          icon={FaPhone}
                        />
                      </div>
    
                      {/* Address */}
                      <div className="md:col-span-3">
                        <InputField
                          label="Address / Street"
                          id="address"
                          register={register}
                          required="Address is required"
                          error={errors.address}
                          icon={FaMapMarkerAlt}
                        />
                      </div>
    
                      {/* City */}
                      <div className="md:col-span-2">
                        <InputField
                          label="City"
                          id="city"
                          register={register}
                          required="City is required"
                          error={errors.city}
                          icon={FaCity}
                        />
                      </div>
    
                      {/* Country */}
                      <div className="md:col-span-2">
                        <label className="block font-medium text-gray-700 mb-1 flex items-center">
                          <FaGlobe className="mr-2 text-blue-500" />
                          Country
                        </label>
                        <select
                          {...register("country", { required: true })}
                          className="h-10 w-full pl-3 bg-gray-100 rounded border border-gray-200 text-gray-500"
                        >
                          <option value="">Select a country</option>
                          <option value="Nepal">Nepal</option>
                        </select>
                        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message || "Country is required"}</p>}
                      </div>
    
                      {/* State */}
                      <div className="md:col-span-2">
                        <label className="block font-medium text-gray-700 mb-1 flex items-center">
                          <FaMapPin className="mr-2 text-blue-500" />
                          Province
                        </label>
                        <select
                          {...register("state", { required: true })}
                          className="h-10 w-full pl-3 bg-gray-100 rounded border border-gray-200 text-gray-500"
                        >
                          <option value="">Select a province</option>
                          <option value="Koshi Province"> Koshi Province </option>
                          <option value="Madhesh Province">Madhesh Province</option>
                          <option value="Bagmati Province">Bagmati Province</option>
                          <option value="Gandaki Province">Gandaki Province</option>
                          <option value="Lumbini Province">Lumbini Province</option>
                          <option value="Karnali Province">Karnali Province</option>
                          <option value="Sudurpashchim Province">Sudurpashchim Province</option>
                        </select>
                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message || "Province is required"}</p>}
                      </div>
    
                      {/* Zipcode */}
                      <div className="md:col-span-1">
                        <InputField
                          label="Zipcode"
                          id="zipcode"
                          register={register}
                          required="Zipcode is required"
                          pattern={{
                            value: /^[0-9]{5,10}$/,
                            message: "Please enter a valid zipcode"
                          }}
                          error={errors.zipcode}
                          icon={FaMapPin}
                        />
                      </div>
    
                      {/* Shipping Method */}
                      <div className="md:col-span-5">
                        <label htmlFor="shippingMethod" className="block text-gray-700 font-medium mb-2 flex items-center">
                          <FaShippingFast className="mr-2 text-blue-500" />
                          Shipping Method
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MdLocalShipping className="text-gray-400" />
                          </div>
                          <select
                            id="shippingMethod"
                            className={`h-10 border pl-10 ${errors.shippingMethod ? "border-red-500" : "border-gray-300 focus:border-blue-500"} rounded px-4 w-full text-sm focus:outline-none bg-gray-50 transition-all duration-200`}
                            {...register("shippingMethod", { required: "Shipping method is required" })}
                          >
                            <option value="Standard">Standard (3-5 days)</option>
                            <option value="Express">Express (1-2 days)</option>
                            <option value="Overnight">Overnight</option>
                          </select>
                        </div>
                        {errors.shippingMethod && <p className="text-red-500 text-xs mt-1">{errors.shippingMethod.message}</p>}
                      </div>

                      {/* Special Instructions */}
                      <div className="md:col-span-5">
                        <label htmlFor="specialInstructions" className="block text-gray-700 font-medium mb-2 flex items-center">
                          <MdComment className="mr-2 text-blue-500" />
                          Special Instructions (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute top-3 left-3 pointer-events-none">
                            <MdComment className="text-gray-400" />
                          </div>
                          <textarea
                            id="specialInstructions"
                            rows="3"
                            className="border border-gray-300 focus:border-blue-500 rounded pl-10 pr-4 py-2 w-full text-sm focus:outline-none bg-gray-50 transition-all duration-200"
                            placeholder="Add any special instructions for delivery"
                            {...register("specialInstructions")}
                          ></textarea>
                        </div>
                      </div>
    
                      {/* Terms Agreement */}
                      <div className="md:col-span-5 mt-4">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            onChange={(e) => setIsChecked(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-blue-600 rounded transition-all duration-200"
                          />
                          <div className="text-gray-600 flex items-center">
                            <FaCheck className={`mr-2 ${isChecked ? 'text-green-500' : 'text-gray-300'}`} />
                            <span>
                              I agree to the {' '}
                              <Link to="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link> {' '}
                              and {' '}
                              <Link to="/policy" className="text-blue-600 hover:underline">Shopping Policy</Link>
                            </span>
                          </div>
                        </label>
                      </div>
    
                      {/* Submit Button */}
                      <div className="md:col-span-5 text-right mt-6">
                        <button
                          type="submit"
                          disabled={!isChecked}
                          className={`
                            px-8 py-3 rounded-lg font-bold text-white transition-all duration-300
                            flex items-center justify-center ml-auto
                            ${!isChecked 
                              ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-1'}
                          `}
                        >
                          {isChecked ? (
                            <>
                              <MdPayment className="mr-2 text-xl" />
                              Place Order
                            </>
                          ) : (
                            <>
                              <FiAlertCircle className="mr-2 text-xl" />
                              Agree to Terms
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
};

// Reusable Input Component
const InputField = ({ label, id, register, required, pattern, error, type = 'text', placeholder, icon: Icon }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="font-medium text-gray-700 flex items-center">
      {Icon && <Icon className="mr-2 text-blue-500" />}
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="text-gray-400" />
        </div>
      )}
      <input
        {...register(id, { required, pattern })}
        type={type}
        id={id}
        className={`h-10 w-full rounded border bg-gray-50 transition-all duration-200 ${
          error ? 'border-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
        } ${Icon ? 'pl-10' : 'px-4'}`}
        placeholder={placeholder}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
  </div>
);

const _renderOrderStatus = (status) => {
  const statusConfig = {
    'Delivered': { bgColor: 'bg-green-100', textColor: 'text-green-700', icon: <MdCheckCircle className="mr-1" /> },
    'Shipped': { bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: <TbTruckDelivery className="mr-1" /> },
    'Processing': { bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: <MdPendingActions className="mr-1" /> },
    'Pending': { bgColor: 'bg-orange-100', textColor: 'text-orange-700', icon: <FiPackage className="mr-1" /> },
    'Cancelled': { bgColor: 'bg-red-100', textColor: 'text-red-700', icon: <FaExclamationTriangle className="mr-1" /> }
  };
  
  const config = statusConfig[status] || statusConfig['Pending'];
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${config.bgColor} ${config.textColor}`}>
      {config.icon}
      <span>{status || 'Pending'}</span>
    </span>
  );
};

export default CheckoutPage;