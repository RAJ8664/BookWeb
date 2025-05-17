import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";

const Banner2 = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("/banner2.json");
        if (!response.ok) throw new Error("Failed to load banners");
        const data = await response.json();
        setBanners(data.banners);
      } catch (error) {
        console.error("Error loading banners:", error);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className="relative w-full max-w-[1816px] mx-auto overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 group">
      <Swiper
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        modules={[Navigation, Autoplay]}
        className="mySwiper w-full"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={index}>
            <Link to={banner.link} className="relative block">
              <div className="relative overflow-hidden">
                <img
                  src={banner.image}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-[150px] sm:h-[300px] md:h-[400px] lg:h-[603px] object-cover transform transition-all duration-500 hover:scale-105"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-transparent transition-opacity duration-300 group-hover:opacity-80"></div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
        
        {/* Custom Navigation Arrows */}
        <div className="swiper-button-next !text-white !bg-gradient-to-r from-blue-600/90 to-purple-600/90 !w-8 !h-8 md:!w-10 md:!h-10 rounded-full shadow-xl backdrop-blur-sm hover:!scale-110 transition-transform after:!text-sm md:after:!text-lg !right-3"></div>
        <div className="swiper-button-prev !text-white !bg-gradient-to-r from-blue-600/90 to-purple-600/90 !w-8 !h-8 md:!w-10 md:!h-10 rounded-full shadow-xl backdrop-blur-sm hover:!scale-110 transition-transform after:!text-sm md:after:!text-lg !left-3"></div>
      </Swiper>

      {/* Animated Scroll Indicator (Optional) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 hidden md:block">
        <div className="animate-bounce w-6 h-10 rounded-3xl border-2 border-white/50 flex items-start justify-center p-1">
          <div className="w-2 h-2 rounded-full bg-white/80"></div>
        </div>
      </div>
    </div>
  );
};

export default Banner2;