import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
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
    <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300 group">
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
                  className="w-full h-[150px] md:h-[250px] lg:h-[300px] object-cover transform transition-all duration-500 hover:scale-105"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-transparent transition-opacity duration-300 group-hover:opacity-80"></div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
        
        {/* Custom Navigation Arrows */}
        <div className="swiper-button-next !text-white !bg-gradient-to-r from-blue-600/90 to-purple-600/90 !w-10 !h-10 md:!w-12 md:!h-12 rounded-full shadow-xl backdrop-blur-sm hover:!scale-110 transition-transform after:!text-lg md:after:!text-xl !right-4"></div>
        <div className="swiper-button-prev !text-white !bg-gradient-to-r from-blue-600/90 to-purple-600/90 !w-10 !h-10 md:!w-12 md:!h-12 rounded-full shadow-xl backdrop-blur-sm hover:!scale-110 transition-transform after:!text-lg md:after:!text-xl !left-4"></div>
      </Swiper>

      {/* Animated Scroll Indicator (Optional) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:block">
        <div className="animate-bounce w-8 h-14 rounded-3xl border-2 border-white/50 flex items-start justify-center p-1">
          <div className="w-3 h-3 rounded-full bg-white/80"></div>
        </div>
      </div>
    </div>
  );
};

export default Banner2;