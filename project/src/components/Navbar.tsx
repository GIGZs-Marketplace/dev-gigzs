import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <>
      <nav style={{
        position: 'fixed',
        width: '100%',
        padding: '1rem',
        zIndex: 50,
        backgroundColor: '#f7f7f7',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            left: '-1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 112, 74, 0.1)',
            animation: 'pulse 2s infinite',
          }} />
          <div style={{
            position: 'absolute',
            right: '-1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '1.5rem',
            height: '1.5rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 112, 74, 0.15)',
            animation: 'pulse 2s infinite',
          }} />
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#00704a',
            fontFamily: 'Impact',
            position: 'relative',
          }}>
            gigzs
            <div style={{
              position: 'absolute',
              right: '-0.5rem',
              top: '-0.5rem',
              width: '1rem',
              height: '1rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 112, 74, 0.2)',
            }} />
          </h1>
          
          {!isScrolled && (
            <button
              onClick={() => setIsOpen(true)}
              style={{
                color: '#00704a',
                transition: 'color 0.3s',
                marginLeft: 'auto',
                position: 'relative',
              }}
            >
              <Menu size={32} />
              <div style={{
                position: 'absolute',
                right: '-0.5rem',
                bottom: '-0.5rem',
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 112, 74, 0.3)',
              }} />
            </button>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 112, 74, 0.95)',
              backdropFilter: 'blur(8px)',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                color: 'white',
                transition: 'color 0.3s',
              }}
            >
              <X size={32} />
            </button>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                alignItems: 'center',
              }}
            >
              {showAuth ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}>
                  <button
                    onClick={() => window.location.href = 'http://localhost:5173/login'}
                    style={{
                      padding: '0.75rem 2rem',
                      backgroundColor: 'white',
                      color: '#00704a',
                      fontWeight: 600,
                      borderRadius: '0.5rem',
                      transition: 'background-color 0.3s',
                      cursor: 'pointer',
                    }}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => window.location.href = 'http://localhost:5173/signup'}
                    style={{
                      padding: '0.75rem 2rem',
                      backgroundColor: 'transparent',
                      border: '2px solid white',
                      color: 'white',
                      fontWeight: 600,
                      borderRadius: '0.5rem',
                      transition: 'background-color 0.3s',
                      cursor: 'pointer',
                    }}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => setShowAuth(false)}
                    style={{
                      color: 'white',
                      marginTop: '1rem',
                    }}
                  >
                    Back to Menu
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowAuth(true)}
                    style={{
                      fontSize: '1.5rem',
                      color: 'white',
                      transition: 'color 0.3s',
                      fontFamily: 'Rubik',
                    }}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => scrollToSection('solutions')}
                    style={{
                      fontSize: '1.5rem',
                      color: 'white',
                      transition: 'color 0.3s',
                      fontFamily: 'Rubik',
                    }}
                  >
                    Solutions
                  </button>
                  <button
                    onClick={() => scrollToSection('why-different')}
                    style={{
                      fontSize: '1.5rem',
                      color: 'white',
                      transition: 'color 0.3s',
                      fontFamily: 'Rubik',
                    }}
                  >
                    Features
                  </button>
                  <button
                    onClick={() => scrollToSection('about')}
                    style={{
                      fontSize: '1.5rem',
                      color: 'white',
                      transition: 'color 0.3s',
                      fontFamily: 'Rubik',
                    }}
                  >
                    About Us
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;