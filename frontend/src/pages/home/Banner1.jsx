import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";

const Banner1 = () => {
  const [bannerData, setBannerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        console.log("Fetching banner data...");
        const response = await fetch("/banner1/banner1.json"); // Adjust the path as necessary
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("Fetched banner data:", data);
        setBannerData(data);
      } catch (error) {
        console.error("Error fetching banner data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBannerData();
  }, []);

  if (loading) {
    return <p>Loading banner...</p>;
  }

  if (!bannerData) {
    return <p>Error loading banner</p>;
  }

  return (
    <div className="relative bg-white-500 py-20 px-4 md:px-8 overflow-hidden">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24">
        {/* Image Slider Section */}
        <div className="md:w-1/2 w-full flex items-center justify-center relative">
          <div className="w-full overflow-hidden rounded-2xl shadow-2xl border-8 border-white/20">
            <Swiper
              slidesPerView={1}
              spaceBetween={30}
              loop={true}
              pagination={{
                clickable: true,
                bulletClass: 'swiper-pagination-bullet bg-gray-300 opacity-100',
                bulletActiveClass: 'swiper-pagination-bullet-active bg-gradient-to-r from-blue-500 to-purple-500'
              }}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
              }}
              modules={[Pagination, Autoplay]}
              className="mySwiper"
            >
              {/* Default image from banner data */}
              <SwiperSlide>
                <img 
                  src={bannerData.image} 
                  alt={bannerData.alt || "New book releases"}
                  className="w-full h-auto object-cover transform transition-all duration-500 hover:scale-105"
                />
              </SwiperSlide>
              
              {/* Cloudinary images from banner data */}
              {bannerData.images && bannerData.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <img 
                    src={image} 
                    alt={`Book banner ${index + 1}`}
                    className="w-full h-auto object-cover transform transition-all duration-500 hover:scale-105"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
        </div>

        {/* Content Section */}
        <div className="md:w-1/2 w-full space-y-6 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-blue-600 leading-tight">
            {bannerData.title}
          </h1>
          
          <div className="relative">
            <div className="absolute -left-4 top-1/2 w-1 h-16 bg-gradient-to-b from-blue-400 to-purple-400 transform -translate-y-1/2"></div>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed pl-6">
              {bannerData.description}
            </p>
          </div>
          <Link to="/new-arrivals" className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            <span className="mr-3">{bannerData.buttonText || "See All"}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {/* Error State */}
      {!bannerData && !loading && (
        <div className="text-center py-12 bg-red-50 rounded-xl">
          <p className="text-red-600 font-medium">Failed to load banner content</p>
        </div>
      )}
    </div>
  );
};

export default Banner1;
