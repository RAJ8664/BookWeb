import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

import { FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";

import { useAuth } from "../../context/AuthContext";
import getImgUrl from "../../utils/getImgUrl";

import { Link } from "react-router-dom";
import {
  removeItem,
  clearCart,
  incrementQuantity,
  decrementQuantity,
} from "../../redux/features/cart/cartSlice";

import { useNavigate } from "react-router-dom";

const Cart = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleRemove = (id) => {
    Swal.fire({
      title: "Remove Item",
      text: "Are you sure you want to remove this item from your cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!"
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeItem(id));
        Swal.fire({
          title: "Removed!",
          text: "The item has been removed from your cart.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleClearCart = () => {
    Swal.fire({
      title: "Clear Cart",
      text: "Are you sure you want to clear your entire cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, clear it!"
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(clearCart());
      }
    });
  };

  const { loading } = useAuth();
  const user = useSelector(state => state.auth.user);

  const handleCheckout = () => {
    if (loading) return; // Wait until auth state is resolved
  
    if (!user) {
      Swal.fire({
        title: "Login Required",
        text: "You need to login or sign up before placing an order.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Login / Signup",
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.setItem("redirectAfterLogin", location.pathname);
          navigate("/login");
        }
      });
    } else {
      Swal.fire({
        title: "Proceed to Checkout?",
        text: "You're about to proceed to the checkout page.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, proceed!"
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/checkout");
        }
      });
    }
  };
  
  if (loading) return <p className="text-center py-20">Checking your login status...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-4xl font-bold text-gray-900 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Your Cart
      </h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 space-y-6">
          <div className="mx-auto w-48 h-48 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
            <span className="text-6xl">🛒</span>
          </div>
          <p className="text-xl text-gray-600">Your cart feels lonely</p>
          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3.5 rounded-xl hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            Discover Books
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
              >
                <div className="flex items-center gap-6">
                  <img
                    src={getImgUrl(item.coverImage)}
                    alt={item.title}
                    className="w-24 h-32 object-cover rounded-lg shadow-sm border-2 border-gray-100"
                    onError={(e) => {
                      console.log("Image load error in cart, using fallback");
                      e.target.src = getImgUrl('default-book-cover.jpg');
                    }}
                  />

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 font-medium">{item.author}</p>
                    <p className="text-lg font-bold text-blue-700 mt-1">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            dispatch(decrementQuantity(item.id));
                          }
                        }}
                        disabled={item.quantity <= 1}
                        className={`px-2 py-1 rounded cursor-pointer ${
                          item.quantity <= 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        -
                      </button>
                      <span className="px-3 text-gray-800 font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          dispatch(incrementQuantity(item.id));
                          Swal.fire({
                            title: "Quantity Updated",
                            text: `Quantity increased to ${item.quantity + 1}`,
                            icon: "success",
                            timer: 1000,
                            showConfirmButton: false,
                            position: 'bottom-end',
                            toast: true
                          });
                        }}
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors group-hover:animate-shake cursor-pointer"
                  title="Remove item"
                >
                  <FiTrash2 size={24} className="stroke-current" />
                </button>
              </div>
            ))}
          </div>

          {/* Total, Clear Cart & Checkout */}
          <div className="mt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">Total Amount:</p>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Rs. {totalPrice.toFixed(2)}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button
                onClick={handleClearCart}
                className="px-8 py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                Clear Cart
              </button>
              <button 
              onClick={handleCheckout}
              className="px-8 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
              Proceed To Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
