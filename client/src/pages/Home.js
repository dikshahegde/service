import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  MagnifyingGlassIcon, 
  StarIcon, 
  MapPinIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredCafes, setFeaturedCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCafes();
  }, []);

  const fetchFeaturedCafes = async () => {
    try {
      const response = await axios.get('/api/cafes?limit=6&sortBy=rating');
      setFeaturedCafes(response.data.cafes);
    } catch (error) {
      console.error('Error fetching featured cafes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/cafes?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="w-4 h-4 text-yellow-400" />
          <StarIconSolid className="w-4 h-4 text-yellow-400 absolute top-0 left-0" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </div>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cafe-50 to-cafe-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover Amazing
              <span className="text-cafe-600 block">Cafes Near You</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Find the perfect coffee shop for your mood, budget, and location. 
              Read reviews, explore menus, and connect with local cafe culture.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cafes, locations, or cuisines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 text-lg rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cafe-500 focus:border-transparent shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bg-cafe-600 hover:bg-cafe-700 text-white p-2 rounded-full transition-colors"
                >
                  <MagnifyingGlassIcon className="w-6 h-6" />
                </button>
              </div>
            </form>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/cafes"
                className="btn-primary text-lg px-8 py-3"
              >
                Browse All Cafes
                <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
              </Link>
              <Link
                to="/register?role=owner"
                className="btn-outline text-lg px-8 py-3"
              >
                List Your Cafe
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-cafe-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BuildingStorefrontIcon className="w-8 h-8 text-cafe-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{featuredCafes.length}+</h3>
              <p className="text-gray-600">Featured Cafes</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-cafe-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-cafe-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">1000+</h3>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-cafe-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-8 h-8 text-cafe-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">500+</h3>
              <p className="text-gray-600">Reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cafes Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Cafes
            </h2>
            <p className="text-xl text-gray-600">
              Discover the most popular and highly-rated cafes in your area
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCafes.map((cafe) => (
                <Link
                  key={cafe._id}
                  to={`/cafe/${cafe._id}`}
                  className="card-hover group"
                >
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={cafe.images?.[0] || '/api/placeholder/400/250'}
                      alt={cafe.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center space-x-1">
                      <span className="text-sm font-medium">{cafe.ratings.average.toFixed(1)}</span>
                      <StarIconSolid className="w-4 h-4 text-yellow-400" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-cafe-600 transition-colors">
                    {cafe.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {cafe.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{cafe.location.city}, {cafe.location.state}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      <span>${cafe.averageBudget.min}-${cafe.averageBudget.max}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {renderStars(cafe.ratings.average)}
                      <span className="text-sm text-gray-500 ml-2">
                        ({cafe.ratings.count} reviews)
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/cafes"
              className="btn-primary text-lg px-8 py-3"
            >
              View All Cafes
              <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-cafe-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Own a Cafe?
          </h2>
          <p className="text-xl text-cafe-100 mb-8 max-w-3xl mx-auto">
            Join our community of cafe owners and showcase your business to thousands of coffee lovers. 
            Manage your menu, track reviews, and grow your customer base.
          </p>
          <Link
            to="/register?role=owner"
            className="bg-white text-cafe-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
          >
            Get Started as Owner
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;