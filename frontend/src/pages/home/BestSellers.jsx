import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";
import BookCard from "../books/BookCard";


const BestSellers = () => {
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await fetch("/bestsellers.json"); // Fetch from public folder
        if (!response.ok) throw new Error("Failed to load best sellers");

        const data = await response.json();
        setBestSellers(data.bestsellers);
      } catch (error) {
        console.error("Error fetching best sellers:", error);
      }
    };

    fetchBestSellers();
  }, []);

  return (
    <div className="container mx-auto px-6 py-16 bg-white-500">
      <div className="mb-12 text-left">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          <span className="text-color-black">
            Best Sellers
          </span>
        </h2>
        <p className="text-lg text-gray-600 mt-2">Curated Selection Just For You</p>
      </div>

      {bestSellers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500 text-lg">No Best Sellers available currently.</p>
        </div>
      ) : (
        <Swiper
          spaceBetween={30}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          pagination={{ 
            clickable: true,
            bulletClass: 'swiper-pagination-bullet bg-gray-300 opacity-100',
            bulletActiveClass: 'swiper-pagination-bullet-active bg-gradient-to-r from-blue-500 to-purple-500'
          }}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 }
          }}
          modules={[Pagination, Navigation]}
          className="relative group w-full"
        >
          {/* Custom Navigation Arrows */}
          <div className="swiper-button-next !text-white !bg-gradient-to-r from-blue-600 to-purple-600 !w-12 !h-12 rounded-full shadow-lg hover:scale-105 transition-transform after:!text-xl"></div>
          <div className="swiper-button-prev !text-white !bg-gradient-to-r from-blue-600 to-purple-600 !w-12 !h-12 rounded-full shadow-lg hover:scale-105 transition-transform after:!text-xl"></div>

          {bestSellers.map((book) => (
            <SwiperSlide 
              key={book.id} 
              className="pb-12 hover:-translate-y-2 transition-all duration-300"
            >
              <BookCard book={book} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default BestSellers;
