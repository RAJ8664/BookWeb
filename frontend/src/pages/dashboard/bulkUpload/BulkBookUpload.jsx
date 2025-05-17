import React, { useState, useRef } from 'react';
import axios from 'axios';
import getBaseURL from '../../../utils/baseURL';
import Swal from 'sweetalert2';
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const BulkBookUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile && !selectedFile.name.endsWith('.csv')) {
      Swal.fire({
        title: 'Invalid file',
        text: 'Please upload a CSV file',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    setFile(selectedFile);
  };
  
  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire({
          title: 'Authentication required',
          text: 'Please login as admin to download the template',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        return;
      }
      
      const response = await axios.get(`${getBaseURL()}/api/books/bulk/template`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/csv'
        },
        responseType: 'blob',
        withCredentials: true
      });
      
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('text/csv')) {
        console.error('Server returned non-CSV response:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          const errorText = await new Response(response.data).text();
          let errorMessage = 'Server returned JSON instead of CSV';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch (e) {
            // Ignore JSON parse errors
          }
          throw new Error(errorMessage);
        } else {
          throw new Error('Server returned invalid content type: ' + (contentType || 'unknown'));
        }
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'book-import-template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading template:', error);
      let errorMessage = 'Failed to download template';
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Access denied. Please check your login status.';
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later or contact support.';
        } else if (error.response.data) {
          try {
            const blob = error.response.data;
            const text = await blob.text();
            try {
              const json = JSON.parse(text);
              errorMessage = json.message || json.error || errorMessage;
            } catch (e) {
              if (text.length < 100) errorMessage = text;
            }
          } catch (e) {
            // If we can't read the blob, use default message
          }
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      Swal.fire({
        title: 'Download failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };
  
  const exportBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire({
          title: 'Authentication required',
          text: 'Please login as admin to export books',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        return;
      }
      
      const response = await axios.get(`${getBaseURL()}/api/books/bulk/export`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/csv'
        },
        responseType: 'blob',
        withCredentials: true
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'books-export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting books:', error);
      let errorMessage = 'Failed to export books';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Access denied. Please check your login status.';
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      Swal.fire({
        title: 'Export failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };
  
  const uploadFile = async () => {
    if (!file) {
      Swal.fire({
        title: 'No file selected',
        text: 'Please select a CSV file to upload',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        title: 'Authentication required',
        text: 'Please login as admin to import books',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadResults(null);
      
      const formData = new FormData();
      formData.append('csvFile', file);
      
      const response = await axios.post(`${getBaseURL()}/api/books/bulk/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      
      setUploadResults(response.data.result);
      
      Swal.fire({
        title: 'Import completed',
        text: response.data.message,
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Error importing books:', error);
      let errorMessage = 'Failed to import books';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Access denied. Please check your login status.';
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      Swal.fire({
        title: 'Import failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <DocumentTextIcon className="w-8 h-8 text-indigo-600 mr-3" />
        Bulk Book Management
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Template Download */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">1. Download Template</h2>
          <p className="text-gray-600 mb-4">
            Start by downloading our CSV template. Fill it with your book data including image URLs.
          </p>
          <button
            onClick={downloadTemplate}
            className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Download CSV Template
          </button>
        </div>
        
        {/* CSV Upload */}
        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
          <h2 className="text-xl font-semibold text-indigo-800 mb-4">2. Upload Your CSV</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Select your completed CSV file:
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileChange}
              className="w-full text-gray-600 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            
            {file && (
              <p className="mt-2 text-sm text-indigo-700 bg-indigo-100 p-2 rounded">
                Selected file: {file.name}
              </p>
            )}
          </div>
          
          <button
            onClick={uploadFile}
            disabled={isUploading || !file}
            className={`flex items-center justify-center w-full py-3 px-4 rounded-lg transition-colors ${
              isUploading || !file 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isUploading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                Upload & Import Books
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Export Books */}
      <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100 mb-8">
        <h2 className="text-xl font-semibold text-emerald-800 mb-4">Export Your Books</h2>
        <p className="text-gray-600 mb-4">
          Export all your books to a CSV file that you can edit and re-import later.
        </p>
        <button
          onClick={exportBooks}
          className="flex items-center justify-center w-full py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          Export All Books to CSV
        </button>
      </div>
      
      {/* Results Section */}
      {uploadResults && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Import Results</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Total Books</p>
              <p className="text-2xl font-bold text-gray-800">{uploadResults.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Processed</p>
              <p className="text-2xl font-bold text-blue-600">{uploadResults.processed}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Imported Successfully</p>
              <p className="text-2xl font-bold text-green-600">{uploadResults.saved}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-red-600">{uploadResults.failed}</p>
            </div>
          </div>
          
          {/* Success and Error Details */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2 flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
              Successfully Imported Books: {uploadResults.details.savedBooks.length}
            </h3>
            {uploadResults.details.savedBooks.length > 0 && (
              <div className="max-h-40 overflow-y-auto p-3 bg-green-50 rounded-lg">
                <ul className="space-y-1">
                  {uploadResults.details.savedBooks.map((book, index) => (
                    <li key={index} className="text-sm text-green-800">
                      {book.title} by {book.author}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {(uploadResults.details.processingFailures.length > 0 || uploadResults.details.saveFailures.length > 0) && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                Failed Books: {uploadResults.failed}
              </h3>
              <div className="max-h-40 overflow-y-auto p-3 bg-red-50 rounded-lg">
                <ul className="space-y-1">
                  {uploadResults.details.processingFailures.map((failure, index) => (
                    <li key={`proc-${index}`} className="text-sm text-red-800">
                      {failure.originalData.title || 'Unknown book'}: {failure.error}
                    </li>
                  ))}
                  {uploadResults.details.saveFailures.map((failure, index) => (
                    <li key={`save-${index}`} className="text-sm text-red-800">
                      {failure.book.title}: {failure.error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkBookUpload; 