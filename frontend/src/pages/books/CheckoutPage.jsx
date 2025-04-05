import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { useDispatch } from "react-redux";
import { clearCart } from "../../redux/features/cart/cartSlice";


const CheckoutPage = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const dispatch = useDispatch();
  

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    Swal.fire({
      title: "Order Placed 🎉",
      text: "Your order has been placed successfully!",
      icon: "success",
      confirmButtonColor: "#10b981",
      confirmButtonText: "Go to Home",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(clearCart());
        navigate("/");        
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h2 className="text-4xl font-bold text-gray-900 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
        Checkout
      </h2>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Shipping Details */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-6 rounded-xl shadow-md"
        >
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Shipping Details
          </h3>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg"
          />
          <input
            type="text"
            name="zip"
            placeholder="ZIP / Postal Code"
            value={form.zip}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg"
          />
          <button
            type="submit"
            className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition hover:scale-[1.01]"
          >
            Place Order
          </button>
        </form>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800">
            Order Summary
          </h3>

          <div className="divide-y divide-gray-200 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between pt-2">
                <div>
                  <p className="font-medium text-gray-700">{item.title}</p>
                  <p className="text-sm text-gray-400">
                    x{item.quantity} @ NPR {item.price}
                  </p>
                </div>
                <p className="text-gray-800 font-semibold">
                  NPR {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>NPR {totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
