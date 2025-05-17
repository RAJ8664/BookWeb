import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";
import BookCard from "../books/BookCard";
import { useFetchAllBooksQuery } from "../../redux/features/books/booksAPI";

const NowTrending = () => {
  const { data: books, isLoading, isError } = useFetchAllBooksQuery();

  // Filter trending books
  const trendingBooks = Array.isArray(books)
    ? books.filter((book) => book.trending === true)
    : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 py-12 animate-pulse">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow-md">
            <div className="h-48 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading Trending books. Please try again later.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-16 bg-white">
      <div className="mb-12 text-left">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          <span className="text-color-black">Now Trending</span>
        </h2>
        <p className="text-lg text-gray-600 mt-2">
          Discover what others are reading
        </p>
      </div>

      {trendingBooks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500 text-lg">
            No trending books available currently.
          </p>
        </div>
      ) : (
        <Swiper
          spaceBetween={30}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          pagination={{
            clickable: true,
            bulletClass: "swiper-pagination-bullet bg-gray-300 opacity-100",
            bulletActiveClass:
              "swiper-pagination-bullet-active bg-gradient-to-r from-blue-500 to-purple-500",
          }}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          modules={[Pagination, Navigation]}
          className="relative group w-full"
        >
          {/* Custom Navigation Arrows */}
          <div className="swiper-button-next !text-white !bg-gradient-to-r from-blue-600 to-purple-600 !w-12 !h-12 rounded-full shadow-lg hover:scale-105 transition-transform after:!text-xl"></div>
          <div className="swiper-button-prev !text-white !bg-gradient-to-r from-blue-600 to-purple-600 !w-12 !h-12 rounded-full shadow-lg hover:scale-105 transition-transform after:!text-xl"></div>

          {trendingBooks.map((book) => (
            <SwiperSlide
              key={book._id || book.id}
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

export default NowTrending;
