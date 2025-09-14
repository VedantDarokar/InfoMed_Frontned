import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from './UI';

const Layout = ({ children, showNavigation = true }) => {
  const { admin, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      {showNavigation && (
        <nav className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/" className="flex-shrink-0">
                  <h1 className="flex items-center text-xl sm:text-2xl font-bold text-green-500">
                    <img src="/logo.png" alt="InfoMed Logo" className="w-6 h-6 sm:w-9 sm:h-9 mr-2"/>
                    <span className="xs:inline">InfoMed</span>
                  </h1>
                </Link>
                
                {/* Desktop Navigation */}
                {isAuthenticated && (
                  <div className="hidden md:ml-10 md:flex md:items-center md:space-x-8">
                    <Link
                      to="/dashboard"
                      className={`text-sm font-medium transition-colors pb-4 ${
                        isActive('/dashboard')
                          ? 'text-green-500 border-b-2 border-green-500'
                          : 'text-gray-600 hover:text-green-500'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/create"
                      className={`text-sm font-medium transition-colors pb-4 ${
                        isActive('/create')
                          ? 'text-green-500 border-b-2 border-green-500'
                          : 'text-gray-600 hover:text-green-500'
                      }`}
                    >
                      Create QR
                    </Link>
                  </div>
                )}
              </div>

              {/* Desktop User Menu */}
              <div className="hidden md:flex md:items-center md:space-x-4">
                {isAuthenticated ? (
                  <>
                    <span className="text-sm text-gray-700 hidden lg:inline">
                      Welcome, {admin?.name}
                    </span>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/login"
                      className="text-sm font-medium text-gray-600 hover:text-green-500"
                    >
                      Login
                    </Link>
                    <Link to="/signup">
                      <Button size="sm">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileMenuOpen ? (
                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 border-t border-gray-200">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          isActive('/dashboard')
                            ? 'text-green-500 bg-green-50'
                            : 'text-gray-600 hover:text-green-500 hover:bg-gray-100'
                        }`}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/create"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          isActive('/create')
                            ? 'text-green-500 bg-green-50'
                            : 'text-gray-600 hover:text-green-500 hover:bg-gray-100'
                        }`}
                      >
                        Create QR Code
                      </Link>
                      <div className="px-3 py-2 border-t border-gray-200 mt-3">
                        <p className="text-sm text-gray-500 mb-2">Welcome, {admin?.name}</p>
                        <Button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleLogout();
                          }}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          Logout
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-green-500 hover:bg-gray-100"
                      >
                        Login
                      </Link>
                      <div className="px-3 py-2">
                        <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                          <Button size="sm" className="w-full">
                            Sign Up
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Main content */}
      <main className={`${showNavigation ? 'pt-8' : ''}`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            © 2024 InfoMed. Built with React, Express.js, and MongoDB.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
