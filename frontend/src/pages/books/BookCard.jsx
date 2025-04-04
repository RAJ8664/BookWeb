import React from "react";
import { FiShoppingCart } from "react-icons/fi";
import { Link } from "react-router-dom";

// Import all images from the assets folder dynamically
const bookImages = import.meta.glob("../../assets/*.{png,jpg,jpeg,webp}");

const importBookImage = async (imageName) => {
  try {
    const filePath = `../../assets/${imageName}`;
    if (bookImages[filePath]) {
      return (await bookImages[filePath]()).default;
    }
    console.error("Image not found:", imageName);
    return ""; 
  } catch (error) {
    console.error("Error loading image:", imageName, error);
    return "";
  }
};

const BookCard = ({ book }) => {
  const [imageSrc, setImageSrc] = React.useState("");

  React.useEffect(() => {
    importBookImage(book.coverImage).then(setImageSrc);
  }, [book.coverImage]);

  return (
    <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 border border-gray-200 w-full max-w-xs mx-auto">
  {/* Book Cover */}
  <div className="w-full h-64 flex-shrink-0 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:scale-105">
    <Link to={`/books/${book.id}`}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
          <span>Image Not Found</span>
        </div>
      )}
    </Link>
  </div>

  {/* Book Details (Always Below Cover) */}
  <div className="mt-5 text-center">
    <Link to={`/books/${book.id}`}>
      <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
        {book.title}
      </h3>
    </Link>
    <p className="text-gray-500">{book.author}</p>

    {/* Price Section */}
    <p className="font-semibold text-xl text-blue-700 my-3">
      NPR {book.price.toFixed(2)}
    </p>

    {/* Add to Cart Button */}
    <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer">
      <FiShoppingCart className="text-lg" />
      <span className="font-medium">Add to Cart</span>
    </button>
  </div>
</div>
  );
};

export default BookCard;
