import React from 'react'
import Banner1 from './Banner1';
import NowTrending from './NowTrending';
import Banner2 from './Banner2';
import Recommend from './Recommend';
import BestSellers from './BestSellers';

const Home = () => {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      {/* Banner Section */}
      <Banner1 />

      {/* Now Trending Section */}
      <NowTrending />
      

      {/* Banner2 Section */}
      <Banner2 />
      
      {/* Recommend Section */}
      <Recommend />

      {/* Best Sellers Section */}
      <BestSellers />

    </div>


  );
};

export default Home;