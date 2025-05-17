import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarker } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage("Thank you for subscribing!");
      setEmail(""); // Clear input after submission
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateTo = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  const currentYear = new Date().getFullYear();
  
  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Books", path: "/books" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Orders", path: "/orders" },
    { name: "Wishlist", path: "/wishlist" }
  ];

  const socialLinks = [
    { icon: FaFacebook, url: "https://www.facebook.com/profile.php?id=100014689416043", label: "Facebook" },
    { icon: FaTwitter, url: "https://x.com/Bishal_Roy_10", label: "Twitter" },
    { icon: FaInstagram, url: "https://www.instagram.com/vishal_roy_47/", label: "Instagram" },
    { icon: FaLinkedin, url: "https://www.linkedin.com/in/bishal-roy-028386193", label: "LinkedIn" },
  ];

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
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <FaPhone className="text-blue-400" />
            <span>+977-9807704850</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <FaEnvelope className="text-blue-400" />
            <span>bishalroy909@gmail.com</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Explore</h3>
          <ul className="space-y-3 grid grid-cols-2">
            {quickLinks.map((link, idx) => (
              <li key={idx} className="col-span-1">
                <button 
                  onClick={() => navigateTo(link.path)} 
                  className="hover:text-blue-400 transition duration-300 text-left cursor-pointer"
                >
                  {link.name}
                </button>
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
              className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
              aria-label="Email for newsletter"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition-all duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
            {message && (
              <p className={`text-sm ${message.includes("valid") ? "text-yellow-400" : "text-green-400"} transition-all duration-300`}>
                {message}
              </p>
            )}
          </form>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
          <div className="flex gap-4">
            {socialLinks.map(({ icon: Icon, url, label }, idx) => (
              <a 
                key={idx} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={label}
                className="p-3 rounded-full bg-gray-800 hover:bg-blue-500 hover:scale-110 transition-all duration-300 flex items-center justify-center w-12 h-12 shadow-lg"
              >
                <Icon className="text-xl text-white" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 mt-8 py-6 text-center text-sm text-gray-400">
        <p>&copy; {currentYear} BookWeb. All Rights Reserved.</p>
        <div className="flex justify-center space-x-4 text-xs mt-2">
          <button onClick={() => navigateTo('/privacy')} className="hover:text-blue-400 transition duration-300">Privacy Policy</button>
          <button onClick={() => navigateTo('/terms')} className="hover:text-purple-400 transition duration-300">Terms of Service</button>
          <button onClick={() => navigateTo('/faq')} className="hover:text-green-400 transition duration-300">FAQ</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
