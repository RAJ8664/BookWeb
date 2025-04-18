import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from "react-hook-form"
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clearCart } from '../../redux/features/cart/cartSlice';

import Swal from 'sweetalert2';
import { useCreateOrderMutation } from '../../redux/features/orders/ordersApi';

const CheckoutPage = () => {
    const cartItems = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();
    const totalPrice = cartItems.length > 0 
        ? cartItems.reduce((acc, item) => {
            const price = item.newPrice || item.price || 0;
            const quantity = item.quantity || 1;
            return acc + (typeof price === 'number' ? price * quantity : 0);
          }, 0).toFixed(2)
        : "0.00";
    
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    
    // Redirect if cart is empty
    useEffect(() => {
        if (!loading && cartItems.length === 0) {
            Swal.fire({
                title: "Empty Cart",
                text: "Your cart is empty. Add some items before checkout.",
                icon: "info",
                confirmButtonColor: "#3085d6"
            }).then(() => {
                navigate("/");
            });
        }
    }, [cartItems, loading, navigate]);
    
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
    
    // If still loading, show loading
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading checkout page...</p>
            </div>
        </div>;
    }
    
    // If not logged in after loading is complete, show a message
    if (!user || !user.email) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
                <p className="text-gray-600 mb-6">You need to be logged in to access the checkout page.</p>
                <button 
                    onClick={() => navigate("/login")}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Go to Login
                </button>
            </div>
        </div>;
    }
    
    // If cart is empty after loading is complete, show a message
    if (cartItems.length === 0) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
                <p className="text-gray-600 mb-6">Add some items to your cart before proceeding to checkout.</p>
                <button 
                    onClick={() => navigate("/")}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Browse Books
                </button>
            </div>
        </div>;
    }
    
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: user?.displayName || "",
            email: user?.email || "",
        }
    });

    const [createOrder, {isLoading, error}] = useCreateOrderMutation();
    const [isChecked, setIsChecked] = useState(false);

    const onSubmit = async (data) => {
        const numericTotalPrice = parseFloat(totalPrice);
        
        if (isNaN(numericTotalPrice)) {
            Swal.fire({
                title: "Invalid Order",
                text: "There was an error calculating the total price. Please try again.",
                icon: "error",
                confirmButtonColor: "#3085d6"
            });
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
            paymentMethod: data.paymentMethod || "Cash on Delivery",
            shippingMethod: data.shippingMethod || "Standard",
            specialInstructions: data.specialInstructions || ""
        }
        
        try {
            await createOrder(newOrder).unwrap();
            dispatch(clearCart());
            Swal.fire({
                title: "Order Confirmed!",
                text: "Your order has been placed successfully!",
                icon: "success",
                confirmButtonColor: "#3085d6"
            });
            navigate("/orders");
        } catch (error) {
            console.error("Error placing order:", error);
            Swal.fire({
                title: "Order Failed",
                text: error?.data?.message || "Failed to place your order. Please try again.",
                icon: "error",
                confirmButtonColor: "#3085d6"
            });
        }
    }

    if(isLoading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Processing your order...</p>
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
                  <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
                  <div className="space-y-1 text-gray-600">
                    <p>Total Price: ₹{totalPrice}</p>
                    <p>Items: {cartItems.reduce((total, item) => total + (item.quantity || 1), 0)}</p>
                  </div>
                </div>
    
                {/* Order Summary Card */}
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm flex-1 max-w-md">
                  <h3 className="text-lg font-medium text-blue-800 mb-3">Order Summary</h3>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    {cartItems.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{item.title} ×{item.quantity || 1}</span>
                        <span className="font-medium">
                          ₹{((item.newPrice || item.price) * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t pt-3 flex justify-between font-semibold text-gray-800">
                    <span>Total:</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </div>
              </div>
    
              {/* Form Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
                  {/* Form Header */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-800">Personal Details</h3>
                      <p className="text-gray-500 text-sm">Please fill out all the fields.</p>
                    </div>
                    
                    {/* Payment Notice */}
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                      <p className="font-medium text-yellow-700">Cash On Delivery</p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Payment will be collected upon delivery
                      </p>
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
                        />
                      </div>
    
                      {/* Email */}
                      <div className="md:col-span-5">
                        <label className="block font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                          {...register("email")}
                          type="email"
                          id="email"
                          className="h-10 w-full px-4 bg-gray-100 rounded border border-gray-200 text-gray-500"
                          placeholder="email@domain.com"
                          defaultValue={user?.email || ""}
                          readOnly
                        />
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
                        />
                      </div>
    
                      {/* Country */}
                      <div className="md:col-span-2">
                        <InputField
                          label="Country"
                          id="country"
                          register={register}
                          required="Country is required"
                          error={errors.country}
                          placeholder="Country"
                        />
                      </div>
    
                      {/* State */}
                      <div className="md:col-span-2">
                        <InputField
                          label="Province"
                          id="state"
                          register={register}
                          required="State is required"
                          error={errors.state}
                          placeholder="State"
                        />
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
                        />
                      </div>
    
                      {/* Payment Method */}
                      <div className="md:col-span-3">
                        <label htmlFor="paymentMethod" className="block text-gray-700 font-medium mb-2">
                          Payment Method
                        </label>
                        <select
                          id="paymentMethod"
                          className={`h-10 border ${errors.paymentMethod ? "border-red-500" : "border-gray-300"} rounded px-4 w-full text-sm focus:outline-none focus:border-blue-500`}
                          {...register("paymentMethod", { required: "Payment method is required" })}
                        >
                          <option value="Cash on Delivery">Cash on Delivery</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Debit Card">Debit Card</option>
                          <option value="PayPal">PayPal</option>
                        </select>
                        {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod.message}</p>}
                      </div>

                      {/* Shipping Method */}
                      <div className="md:col-span-2">
                        <label htmlFor="shippingMethod" className="block text-gray-700 font-medium mb-2">
                          Shipping Method
                        </label>
                        <select
                          id="shippingMethod"
                          className={`h-10 border ${errors.shippingMethod ? "border-red-500" : "border-gray-300"} rounded px-4 w-full text-sm focus:outline-none focus:border-blue-500`}
                          {...register("shippingMethod", { required: "Shipping method is required" })}
                        >
                          <option value="Standard">Standard (3-5 days)</option>
                          <option value="Express">Express (1-2 days)</option>
                          <option value="Overnight">Overnight</option>
                        </select>
                        {errors.shippingMethod && <p className="text-red-500 text-xs mt-1">{errors.shippingMethod.message}</p>}
                      </div>

                      {/* Special Instructions */}
                      <div className="md:col-span-5">
                        <label htmlFor="specialInstructions" className="block text-gray-700 font-medium mb-2">
                          Special Instructions (Optional)
                        </label>
                        <textarea
                          id="specialInstructions"
                          rows="3"
                          className="border border-gray-300 rounded px-4 py-2 w-full text-sm focus:outline-none focus:border-blue-500"
                          placeholder="Add any special instructions for delivery"
                          {...register("specialInstructions")}
                        ></textarea>
                      </div>
    
                      {/* Terms Agreement */}
                      <div className="md:col-span-5 mt-2">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            onChange={(e) => setIsChecked(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-blue-600 rounded"
                          />
                          <span className="text-gray-600">
                            I agree to the {' '}
                            <Link to="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link> {' '}
                            and {' '}
                            <Link to="/policy" className="text-blue-600 hover:underline">Shopping Policy</Link>
                          </span>
                        </label>
                      </div>
    
                      {/* Submit Button */}
                      <div className="md:col-span-5 text-right mt-6">
                        <button
                          type="submit"
                          disabled={!isChecked}
                          className={`
                            px-8 py-3 rounded-lg font-bold text-white transition-colors
                            ${!isChecked 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-700'}
                          `}
                        >
                          Place Order
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
const InputField = ({ label, id, register, required, pattern, error, type = 'text', placeholder }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="font-medium text-gray-700">{label}</label>
    <input
      {...register(id, { required, pattern })}
      type={type}
      id={id}
      className={`h-10 w-full px-4 rounded border bg-gray-50 ${
        error ? 'border-red-500' : 'border-gray-200'
      }`}
      placeholder={placeholder}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
  </div>
);

const renderOrderStatus = (status) => {
  const statusConfig = {
    'Delivered': { bgColor: 'bg-green-100', textColor: 'text-green-700', icon: '✓' },
    'Shipped': { bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: '🚚' },
    'Processing': { bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: '⚙️' },
    'Pending': { bgColor: 'bg-orange-100', textColor: 'text-orange-700', icon: '⏳' },
    'Cancelled': { bgColor: 'bg-red-100', textColor: 'text-red-700', icon: '✕' }
  };
  
  const config = statusConfig[status] || statusConfig['Pending'];
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${config.bgColor} ${config.textColor}`}>
      <span>{config.icon}</span>
      <span>{status || 'Pending'}</span>
    </span>
  );
};

export default CheckoutPage;