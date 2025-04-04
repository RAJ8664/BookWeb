import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarker } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    // Simulating subscription (replace with actual API call)
    setTimeout(() => {
      setMessage("Thank you for subscribing!");
      setEmail(""); // Clear input after submission
    }, 1000);
  };

  return (
    <footer className="bg-gray-900 text-gray-300 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGgxNnYxNkgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik04IDBhOCA4IDAgMDEwIDE2QTggOCAwIDAxOCAweiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')]"></div>

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {/* Brand Section */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            BookWeb
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Discover worlds between pages.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Explore</h3>
          <ul className="space-y-3">
            {["Home", "Books", "About Us", "Contact"].map((item, idx) => (
              <li key={idx}>
                <Link to={["/", "/books", "/about", "/contact"][idx]} className="hover:text-blue-400 transition">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Subscribe to Our Newsletter</h3>
          <p className="text-gray-400 text-sm mb-3">
            Get the latest updates, news, and offers directly in your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition-all cursor-pointer"
            >
              Subscribe
            </button>
            {message && <p className="text-sm text-green-400">{message}</p>}
          </form>
        </div>

{/* Social Media */}
<div>
  <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
  <div className="flex gap-4">
    {[
      { icon: FaFacebook, url: "https://www.facebook.com/profile.php?id=100014689416043" },
      { icon: FaTwitter, url: "https://twitter.com/" },
      { icon: FaInstagram, url: "https://www.instagram.com/vishal_roy_47/" },
      { icon: FaLinkedin, url: "https://www.linkedin.com/in/bishal-roy-028386193" },
    ].map(({ icon: Icon, url }, idx) => (
      <a 
        key={idx} 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="p-3 rounded-full bg-gray-800 hover:bg-blue-500 transition-all duration-300 flex items-center justify-center w-12 h-12"
      >
        <Icon className="text-xl text-white" />
      </a>
    ))}
  </div>
</div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 mt-8 py-6 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} BookWeb. All Rights Reserved.</p>
        <div className="flex justify-center space-x-4 text-xs mt-2">
          <Link to="/privacy" className="hover:text-blue-400 transition">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-purple-400 transition">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
