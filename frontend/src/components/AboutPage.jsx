import React from 'react';
import { FaBook, FaCheckCircle, FaShippingFast, FaHeadset, FaSmile } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Bishal from '../assets/Profile2.jpg';
import Raj from '../assets/Profile3.jpg'


const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Bishal Roy',
      role: 'Creator of BookWeb',
      image: Bishal,
      bio: 'Passionate about books and technology, Bishal founded BookWeb to share his love for reading with the world.',
    },
    {
      name : 'Raj Roy',
      role : 'Bug Finder and Tester',
      image : Raj,
      bio : 'No Bio',
    }
  ];

  const features = [
    {
      title: 'Curated Selection',
      description: 'Handpicked books across various genres to suit all reading preferences.',
      icon: <FaBook className="text-blue-500 text-3xl" />,
    },
    {
      title: 'Quality Assurance',
      description: 'Every book is inspected for quality before shipping to ensure perfect condition.',
      icon: <FaCheckCircle className="text-green-500 text-3xl" />,
    },
    {
      title: 'Fast Delivery',
      description: 'Efficient delivery services to get your books to you as quickly as possible.',
      icon: <FaShippingFast className="text-purple-500 text-3xl" />,
    },
    {
      title: '24/7 Support',
      description: 'Our customer service team is always ready to assist with any queries.',
      icon: <FaHeadset className="text-red-500 text-3xl" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-20 space-y-4"
      >
        <div className="inline-block relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 blur opacity-30 rounded-full"></div>
          <h1 className="relative text-4xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 leading-tight">
            About BookWeb
          </h1>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-600 max-w-3xl mx-auto font-light"
        >
          Connecting readers with incredible books since 2025
          <span className="ml-2 inline-block animate-bounce">📚</span>
        </motion.p>
      </motion.div>
  
      {/* Our Story Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid md:grid-cols-2 gap-16 items-center mb-24"
      >
        <div className="space-y-6">
          <div className="inline-block mb-6">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              Our Journey
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">From Passion to Pages</h2>
          </div>
          <div className="space-y-5 text-gray-600 leading-relaxed">
            <p className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-blue-500 before:rounded-full">
              BookWeb began with a simple idea: to create an online bookstore that feels like your
              favorite local bookshop – warm, welcoming, and filled with wonderful reads waiting to be
              discovered.
            </p>
            <p className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-purple-500 before:rounded-full">
              Created in 2025 by Bishal Roy, a book enthusiast with a background in technology,
              BookWeb has grown from a small collection to a comprehensive digital bookstore serving
              readers nationwide.
            </p>
            <p className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-indigo-500 before:rounded-full">
              We believe that books have the power to educate, inspire, and transform lives. Our
              AI-powered recommendations and curated collections make discovery effortless.
            </p>
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative group rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
          <img
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f"
            alt="Book store"
            className="w-full h-[480px] object-cover transform group-hover:scale-105 transition-all duration-500"
          />
          <div className="absolute bottom-6 left-6 text-white">
            <span className="text-xs font-semibold tracking-wider">ESTABLISHED</span>
            <div className="text-4xl font-bold">2025</div>
          </div>
        </motion.div>
      </motion.div>
  
      {/* Mission Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-[2rem] p-8 mb-24 overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-8 inline-flex items-center gap-2 text-blue-100">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span className="font-semibold tracking-wide">Our Promise</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-8">Core Mission</h2>
          <blockquote className="text-xl text-blue-50 font-light leading-relaxed mb-12">
            "To ignite the joy of reading through personalized discovery, foster a global community of
            passionate readers, and make literature accessible to all."
          </blockquote>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "10K+", label: "Readers" },
              { value: "50K+", label: "Books" },
              { value: "98%", label: "Satisfaction" },
              { value: "24/7", label: "Support" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white/10 p-4 rounded-xl backdrop-blur-sm"
              >
                <div className="text-3xl font-bold text-white mb-1">{item.value}</div>
                <div className="text-sm text-blue-100 font-medium">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
  
      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mb-24"
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why BookWeb Stands Out</h2>
          <p className="text-gray-600">Experience the difference of a reader-first platform</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 * idx }}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-gray-100"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-xl mb-6 flex items-center justify-center text-blue-600">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
  
      {/* Team Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mb-24"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
          <p className="text-gray-600">Passionate experts behind your reading experience</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 * idx }}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div className="relative h-72 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-blue-200 font-medium">{member.role}</p>
                </div>
              </div>
              
            </motion.div>
          ))}
        </div>
      </motion.div>
  
      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="mb-24"
      >
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-100 rounded-full opacity-20"></div>
          <div className="max-w-3xl mx-auto">
            <div className="text-blue-600 mb-6 text-2xl font-bold">What Our Customers Say</div>
            <blockquote className="text-2xl font-light text-gray-800 mb-8 leading-relaxed">
            "BookWeb has transformed my reading experience. Their curated selections always lead me to books I fall in love with, and their service is exceptional. 
            It's like having a personal literary guide!"
            </blockquote>
          </div>
        </div>
      </motion.div>
  
      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="text-center bg-white rounded-2xl p-12 shadow-xl border border-gray-100"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Begin Your Reading Journey</h2>
        <p className="text-gray-600 max-w-xl mx-auto mb-8">
          Join thousands of readers discovering their next favorite book every day
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <motion.a
            whileHover={{ scale: 1.05 }}
            href="/register"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
          >
            Create Account
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.05 }}
            href="/contact"
            className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all"
          >
            Contact Us
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;
