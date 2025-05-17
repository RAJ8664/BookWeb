import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaCheck } from 'react-icons/fa';
import Swal from 'sweetalert2';
import emailjs from 'emailjs-com';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '../utils/validationSchemas';

// Use environment variables instead of hardcoded values
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;

const ContactPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);

  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      confirmEmail: '',
      address: '',
      phone: '',
      subject: '',
      issueType: 'general',
      message: ''
    }
  });

  const issueOptions = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'order', label: 'Order Issue' },
    { value: 'product', label: 'Product Question' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'feedback', label: 'Feedback/Suggestion' },
    { value: 'other', label: 'Other' }
  ];

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Prepare template parameters for EmailJS
      const templateParams = {
        from_name: data.name,
        reply_to: data.email,
        subject: data.subject,
        message: data.message,
        issue_type: data.issueType,
        phone: data.phone || 'Not provided',
        address: data.address || 'Not provided'
      };
      
      // Send email using EmailJS
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        USER_ID
      );
      
      // Show success message
      setMessageSuccess(true);
      
      // Reset form after successful submission
      reset();
      
      // Show success alert
      Swal.fire({
        title: 'Message Sent!',
        text: 'We have received your message and will get back to you soon.',
        icon: 'success',
        confirmButtonColor: '#3085d6'
      });
      
      // Navigate back to home page after successful submission
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'There was a problem sending your message. Please try again later.';
      
      // Handle specific EmailJS errors
      if (error.status === 412 && error.text.includes('Gmail_API')) {
        errorMessage = 'Email service authentication error: You need to update your Gmail API permissions in your EmailJS account. Please visit the EmailJS dashboard and ensure your Gmail integration has the necessary scopes.';
      }
      
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Contact Us</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Have a question, feedback, or need assistance? Fill out the form below and we'll get back to you as soon as possible.
        </p>
      </div>
      
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h2 className="text-xl font-semibold">Get in Touch</h2>
          <p className="mt-2 text-blue-100">
            Your feedback and questions help us improve BookWeb for everyone.
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                {...register("name")}
                type="text"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Your name"
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : ""}
              />
              {errors.name && <p id="name-error" className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>
            
            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                {...register("phone")}
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                placeholder="Your phone number (optional)"
              />
            </div>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                {...register("email")}
                type="email"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Your email address"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : ""}
              />
              {errors.email && <p id="email-error" className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>
            
            {/* Confirm Email Field */}
            <div>
              <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Email <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmEmail"
                {...register("confirmEmail")}
                type="email"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                  errors.confirmEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your email"
                aria-invalid={errors.confirmEmail ? "true" : "false"}
                aria-describedby={errors.confirmEmail ? "confirm-email-error" : ""}
              />
              {errors.confirmEmail && <p id="confirm-email-error" className="mt-1 text-sm text-red-500">{errors.confirmEmail.message}</p>}
            </div>
          </div>
          
          {/* Address Field */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              id="address"
              {...register("address")}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
              placeholder="Your address (optional)"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                id="subject"
                {...register("subject")}
                type="text"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Message subject"
                aria-invalid={errors.subject ? "true" : "false"}
                aria-describedby={errors.subject ? "subject-error" : ""}
              />
              {errors.subject && <p id="subject-error" className="mt-1 text-sm text-red-500">{errors.subject.message}</p>}
            </div>
            
            {/* Issue Type Field */}
            <div>
              <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">
                Issue Type
              </label>
              <select
                id="issueType"
                {...register("issueType")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
              >
                {issueOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Message Field */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              {...register("message")}
              rows="5"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Your message..."
              aria-invalid={errors.message ? "true" : "false"}
              aria-describedby={errors.message ? "message-error" : ""}
            ></textarea>
            {errors.message && <p id="message-error" className="mt-1 text-sm text-red-500">{errors.message.message}</p>}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg text-white font-medium flex items-center transition-all ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Sending...</span>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </>
              ) : messageSuccess ? (
                <>
                  <span className="mr-2">Sent Successfully</span>
                  <FaCheck />
                </>
              ) : (
                <>
                  <span className="mr-2">Send Message</span>
                  <FaPaperPlane />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPage; 