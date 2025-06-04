import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">GIGZS</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-accent transition-colors duration-300 font-medium">
              Home
            </Link>
            <Link to="/jobs" className="text-gray-700 hover:text-accent transition-colors duration-300 font-medium">
              Find Work
            </Link>
            <Link to="/post-job" className="text-gray-700 hover:text-accent transition-colors duration-300 font-medium">
              Post a Job
            </Link>
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary">
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-accent hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-accent hover:bg-gray-50 transition-colors duration-300 font-medium"
            >
              Home
            </Link>
            <Link
              to="/jobs"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-accent hover:bg-gray-50 transition-colors duration-300 font-medium"
            >
              Find Work
            </Link>
            <Link
              to="/post-job"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-accent hover:bg-gray-50 transition-colors duration-300 font-medium"
            >
              Post a Job
            </Link>
            <Link
              to="/login"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-accent hover:bg-gray-50 transition-colors duration-300 font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-accent hover:bg-gray-50 transition-colors duration-300 font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 