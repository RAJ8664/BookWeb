// frontend/src/pages/SearchResultsPage.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import { useSearchBooksQuery } from "../redux/features/books/booksAPI";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResultsPage = () => {
  const query = useQuery();
  const searchQuery = query.get("q") || "";
  const { data: searchResults, isLoading, error } = useSearchBooksQuery(searchQuery, {
    skip: searchQuery.length < 3,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Oops, something went wrong.</div>;

  return (
    <div>
      <h2>Search Results for "{searchQuery}"</h2>
      {searchResults && searchResults.length > 0 ? (
        <ul>
          {searchResults.map(book => (
            <li key={book._id}>{book.title} by {book.author}</li>
          ))}
        </ul>
      ) : (
        <div>No books found.</div>
      )}
    </div>
  );
};

export default SearchResultsPage;