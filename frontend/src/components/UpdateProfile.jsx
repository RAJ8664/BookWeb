import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const UpdateProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateUserProfile({ displayName: name });
    setSuccessMsg("Profile updated!");
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-gray-600">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>


        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Save Changes
        </button>

        {successMsg && <p className="text-green-600 mt-2">{successMsg}</p>}
      </form>
    </div>
  );
};

export default UpdateProfile;
