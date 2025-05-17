import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaLock, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from './firebaseconfig';

const UserSettings = () => {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile settings state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  
  // Address settings state
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  // Password settings state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    showProfileToOthers: true,
    emailNotifications: true,
    activityHistory: true
  });
  
  // Status messages
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Clear message after 3 seconds
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Event handlers
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile({ 
        displayName,
        email 
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleAddressUpdate = async (e) => {
    e.preventDefault();
    try {
      // Here you would typically call an API to save the address in your database
      // For demo purposes we're just showing a success message
      Swal.fire({
        icon: 'success',
        title: 'Address Updated',
        text: 'Your shipping address has been updated successfully!',
        confirmButtonColor: '#3b82f6'
      });
      setMessage({ type: 'success', text: 'Address updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMessage({ type: 'error', text: 'New passwords do not match!' });
    }
    
    if (passwordData.newPassword.length < 6) {
      return setMessage({ type: 'error', text: 'Password must be at least 6 characters!' });
    }
    
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, passwordData.newPassword);
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Password Updated',
        text: 'Your password has been updated successfully!',
        confirmButtonColor: '#3b82f6'
      });
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setMessage({ type: 'error', text: 'Current password is incorrect' });
      } else {
        setMessage({ type: 'error', text: error.message });
      }
    }
  };

  const handlePrivacyUpdate = async (e) => {
    e.preventDefault();
    try {
      // Here you would typically call an API to save privacy settings
      Swal.fire({
        icon: 'success',
        title: 'Privacy Settings Updated',
        text: 'Your privacy settings have been updated successfully!',
        confirmButtonColor: '#3b82f6'
      });
      setMessage({ type: 'success', text: 'Privacy settings updated!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
      
      {/* Message Alert */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <ul>
              {[
                { id: 'profile', label: 'Profile Information', icon: <FaUserCircle /> },
                { id: 'address', label: 'Address', icon: <FaMapMarkerAlt /> },
                { id: 'password', label: 'Change Password', icon: <FaLock /> },
                { id: 'privacy', label: 'Privacy Settings', icon: <FaShieldAlt /> },
              ].map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full p-4 flex items-center space-x-3 text-left ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 text-blue-600'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:w-3/4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            {/* Profile Information */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="Your display name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="Your email"
                    />
                    <p className="text-sm text-gray-500 mt-1">Changing your email may require you to re-login for security purposes.</p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="Your phone number"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}
            
            {/* Address Settings */}
            {activeTab === 'address' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Address Information</h2>
                <form onSubmit={handleAddressUpdate} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({...address, street: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="Street address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({...address, city: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="City"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2">State/Province</label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) => setAddress({...address, state: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="State/Province"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Zip/Postal Code</label>
                      <input
                        type="text"
                        value={address.zipCode}
                        onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Zip/Postal code"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={address.country}
                        onChange={(e) => setAddress({...address, country: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
                  >
                    Save Address
                  </button>
                </form>
              </div>
            )}
            
            {/* Password Settings */}
            {activeTab === 'password' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="Your current password"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="Your new password"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 text-sm">
                    <p className="font-medium">Password requirements:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>At least 6 characters long</li>
                      <li>Include both uppercase and lowercase characters</li>
                      <li>Include at least one number or special character</li>
                    </ul>
                  </div>
                  
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}
            
            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Privacy Settings</h2>
                <form onSubmit={handlePrivacyUpdate} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Profile Visibility</h3>
                        <p className="text-sm text-gray-500">Allow others to see your profile information</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={privacySettings.showProfileToOthers}
                          onChange={(e) => setPrivacySettings({...privacySettings, showProfileToOthers: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Receive emails about your account activity and orders</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={privacySettings.emailNotifications}
                          onChange={(e) => setPrivacySettings({...privacySettings, emailNotifications: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Activity History</h3>
                        <p className="text-sm text-gray-500">Store your browsing and order history for recommendations</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={privacySettings.activityHistory}
                          onChange={(e) => setPrivacySettings({...privacySettings, activityHistory: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
                  >
                    Save Privacy Settings
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings; 