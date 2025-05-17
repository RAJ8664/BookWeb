import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useOutletContext } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueChart = ({ orderData = [] }) => {
  const { isDarkMode } = useOutletContext() || { isDarkMode: false };
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('month');
  const [chartData, setChartData] = useState(null);
  const [isEmptyData, setIsEmptyData] = useState(false);

  useEffect(() => {
    if (orderData && orderData.length > 0) {
      setIsEmptyData(false);
      generateChartData();
    } else {
      setIsEmptyData(true);
      // Generate sample data if no orders
      generateSampleData(true);
    }
  }, [orderData, timeRange, chartType, isDarkMode]);

  const generateChartData = () => {
    // Create date labels and data points based on time range
    let labels = [];
    let dataPoints = [];
    
    // Set up date ranges
    const currentDate = new Date();
    let startDate;
    
    if (timeRange === 'week') {
      // Past 7 days
      startDate = new Date();
      startDate.setDate(currentDate.getDate() - 6);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        dataPoints.push(0); // Initialize with zeros
      }
    } else if (timeRange === 'month') {
      // Past 30 days in weekly segments
      startDate = new Date();
      startDate.setDate(currentDate.getDate() - 29);
      
      for (let i = 0; i < 5; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + (i * 7));
        labels.push(`Week ${i+1}`);
        dataPoints.push(0); // Initialize with zeros
      }
    } else if (timeRange === 'year') {
      // Past 12 months
      startDate = new Date();
      startDate.setMonth(currentDate.getMonth() - 11);
      
      for (let i = 0; i < 12; i++) {
        const month = new Date(startDate);
        month.setMonth(startDate.getMonth() + i);
        labels.push(month.toLocaleDateString('en-US', { month: 'short' }));
        dataPoints.push(0); // Initialize with zeros
      }
    }
    
    // Parse order data to fill in the data points
    orderData.forEach(order => {
      const orderDate = new Date(order.createdAt || order.date);
      const orderAmount = order.totalPrice || 0;
      
      if (timeRange === 'week') {
        // Only consider orders in the past 7 days
        if (orderDate >= startDate && orderDate <= currentDate) {
          const dayIndex = Math.floor((orderDate - startDate) / (1000 * 60 * 60 * 24));
          if (dayIndex >= 0 && dayIndex < 7) {
            dataPoints[dayIndex] += orderAmount;
          }
        }
      } else if (timeRange === 'month') {
        // Only consider orders in the past 30 days
        if (orderDate >= startDate && orderDate <= currentDate) {
          const dayDiff = Math.floor((orderDate - startDate) / (1000 * 60 * 60 * 24));
          const weekIndex = Math.min(Math.floor(dayDiff / 7), 4);
          if (weekIndex >= 0 && weekIndex < 5) {
            dataPoints[weekIndex] += orderAmount;
          }
        }
      } else if (timeRange === 'year') {
        // Only consider orders in the past 12 months
        if (orderDate >= startDate && orderDate <= currentDate) {
          const monthIndex = (orderDate.getMonth() - startDate.getMonth() + 12) % 12;
          if (monthIndex >= 0 && monthIndex < 12) {
            dataPoints[monthIndex] += orderAmount;
          }
        }
      }
    });
    
    setChartData({
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: dataPoints,
          borderColor: '#3b82f6',
          backgroundColor: chartType === 'bar' 
            ? 'rgba(59, 130, 246, 0.6)' 
            : 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        }
      ]
    });
  };

  // Generate sample data if no real data
  const generateSampleData = (isReset = false) => {
    let labels = [];
    let data = [];
    
    if (timeRange === 'week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = isReset ? [0, 0, 0, 0, 0, 0, 0] : [18500, 25800, 20400, 24100, 27800, 32000, 29600];
    } else if (timeRange === 'month') {
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
      data = isReset ? [0, 0, 0, 0, 0] : [98000, 120000, 85000, 93000, 105000];
    } else {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = isReset ? Array(12).fill(0) : [
        250000, 290000, 310000, 360000, 330000, 380000,
        420000, 450000, 400000, 500000, 580000, 650000
      ];
    }
    
    setChartData({
      labels,
      datasets: [
        {
          label: 'Revenue',
          data,
          borderColor: '#3b82f6',
          backgroundColor: chartType === 'bar' 
            ? 'rgba(59, 130, 246, 0.6)' 
            : 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        }
      ]
    });
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#1f2937',
          font: {
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#374151' : 'white',
        titleColor: isDarkMode ? 'white' : '#111827',
        bodyColor: isDarkMode ? '#e5e7eb' : '#4b5563',
        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 8,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `Revenue: ₹${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        }
      },
      y: {
        grid: {
          color: isDarkMode ? 'rgba(156, 163, 175, 0.1)' : 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className={`rounded-lg shadow-md ${isDarkMode ? 'bg-gray-700' : 'bg-white'} p-4 h-full`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Revenue Overview
          {isEmptyData && <span className="ml-2 text-sm text-gray-400">(No order data)</span>}
        </h2>
        <div className="flex space-x-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`text-sm px-2.5 py-1.5 rounded-md border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-gray-200' 
                : 'border-gray-300 text-gray-700'
            }`}
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="year">Last 12 months</option>
          </select>
          <select 
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className={`text-sm px-2.5 py-1.5 rounded-md border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-gray-200' 
                : 'border-gray-300 text-gray-700'
            }`}
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
        </div>
      </div>

      <div className="h-80">
        {chartData && (
          chartType === 'line' ? (
            <Line data={chartData} options={options} />
          ) : (
            <Bar data={chartData} options={options} />
          )
        )}
        {isEmptyData && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <p>No order data to display</p>
              <p className="text-sm mt-2">All statistics have been reset</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;