import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeBackground from './components/ThreeBackground';
import FloatingShapes from './components/FloatingShapes';
import Navbar from './components/Navbar';

function App() {
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#00704a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}>
        <motion.h1
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            fontFamily: 'Impact',
            fontSize: '5rem',
            color: 'white',
          }}
        >
          gigzs
        </motion.h1>
      </div>
    );
  }

  const sectionStyle = {
    position: 'relative' as const,
    padding: '5rem 1rem',
    borderTopLeftRadius: '3rem',
    borderTopRightRadius: '3rem',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  };

  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
  };

  const cursorStyle = {
    position: 'fixed' as const,
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 112, 74, 0.2)',
    pointerEvents: 'none',
    transform: `translate(${mousePosition.x - 25}px, ${mousePosition.y - 25}px)`,
    zIndex: 9999,
    transition: 'transform 0.1s ease',
  };

  const decorativeCircle = {
    position: 'absolute' as const,
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 112, 74, 0.15)',
    zIndex: 0,
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={cursorStyle} />
      <ThreeBackground />
      <FloatingShapes />
      <Navbar />

      <section style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0, 112, 74, 0.85)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ ...decorativeCircle, width: '120px', height: '120px', top: '10%', left: '5%' }} />
        <div style={{ ...decorativeCircle, width: '80px', height: '80px', bottom: '15%', right: '10%' }} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3 }}
          style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
        >
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1.5rem',
            fontFamily: 'BoldOnse',
          }}>
            Redefining Freelance Experience
          </h1>
          <p style={{
            fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
            color: '#f7f7f7',
            maxWidth: '36rem',
            margin: '0 auto',
            fontFamily: 'Onest',
          }}>
            A curated platform connecting exceptional talent with visionary projects.
          </p>
        </motion.div>
      </section>

      <section id="about" style={sectionStyle}>
        <div style={{ ...decorativeCircle, width: '150px', height: '150px', top: '-5%', right: '15%' }} />
        <div style={{ ...decorativeCircle, width: '100px', height: '100px', bottom: '10%', left: '8%' }} />
        
        <div style={{
          maxWidth: '72rem',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#00704a',
            marginBottom: '3rem',
            textAlign: 'center',
            fontFamily: 'Impact',
          }}>
            What is gigzs?
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: '#272727',
            textAlign: 'center',
            maxWidth: '48rem',
            margin: '0 auto',
            fontFamily: 'Onest',
          }}>
            Gigzs is a next-generation freelance platform connecting exceptional talent with visionary projects. 
            We empower professionals and businesses to collaborate seamlessly and achieve outstanding results.
          </p>
        </div>
      </section>

      <section id="solutions" style={{
        ...sectionStyle,
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
      }}>
        <div style={{ ...decorativeCircle, width: '180px', height: '180px', top: '15%', left: '-5%' }} />
        <div style={{ ...decorativeCircle, width: '120px', height: '120px', bottom: '20%', right: '-3%' }} />
        
        <div style={{
          maxWidth: '72rem',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#00704a',
            marginBottom: '3rem',
            textAlign: 'center',
            fontFamily: 'Impact',
          }}>
            How gigzs Solves This
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {[
              {
                title: 'Verified Clients and Freelancers',
                content: 'Exclusive platform for skilled, verified users. Top 10 matchmaking ensures quality connections.',
              },
              {
                title: 'Hybrid Freelancing Marketplace',
                content: 'Small organizations can form dedicated virtual teams for seamless collaboration.',
              },
              {
                title: 'Safe Payments with Smart Contracts',
                content: 'Escrow-based system with auto-release on milestone completion. No more payment delays or disputes.',
              },
              {
                title: 'Built-in SaaS Tools',
                content: 'Integrated tools and AI agents streamline freelancing and project management.',
              },
              {
                title: 'AI-Driven Marketplace',
                content: 'AI supervises matchmaking, gig management, and payment transfer for reliability.',
              },
              {
                title: 'Smart Pricing at Affordable Rate',
                content: 'AI-powered pricing suggestions reduce disputes and keep transaction fees flexible and fair.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                style={cardStyle}
              >
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#00704a',
                  marginBottom: '1rem',
                  fontFamily: 'Rubik',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  color: '#272727',
                  fontFamily: 'Onest',
                }}>
                  {item.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="why-different" style={{
        ...sectionStyle,
        backgroundColor: 'rgba(0, 112, 74, 0.85)',
        padding: '8rem 1rem',
      }}>
        <div style={{ ...decorativeCircle, width: '200px', height: '200px', top: '10%', right: '5%', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
        <div style={{ ...decorativeCircle, width: '150px', height: '150px', bottom: '15%', left: '8%', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
        
        <div style={{
          maxWidth: '72rem',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}>
          <h2 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '3rem',
            textAlign: 'center',
            fontFamily: 'Impact',
          }}>
            Why we are different?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem',
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '2rem',
              borderRadius: '1rem',
            }}>
              <h3 style={{
                fontSize: '1.75rem',
                fontWeight: 'bold',
                color: '#00704a',
                marginBottom: '1.5rem',
                fontFamily: 'Rubik',
              }}>
                Quality Over Quantity
              </h3>
              <p style={{
                fontSize: '1.1rem',
                color: '#272727',
                fontFamily: 'Onest',
                lineHeight: '1.6',
              }}>
                We maintain strict vetting processes for both freelancers and clients. Only top 10% talent and serious clients make it to our platform, ensuring high-quality collaborations every time.
              </p>
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '2rem',
              borderRadius: '1rem',
            }}>
              <h3 style={{
                fontSize: '1.75rem',
                fontWeight: 'bold',
                color: '#00704a',
                marginBottom: '1.5rem',
                fontFamily: 'Rubik',
              }}>
                Fair Compensation
              </h3>
              <p style={{
                fontSize: '1.1rem',
                color: '#272727',
                fontFamily: 'Onest',
                lineHeight: '1.6',
              }}>
                Our AI-driven pricing system ensures fair rates for freelancers while keeping costs reasonable for clients. No race to the bottom, just value-based pricing that works for everyone.
              </p>
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '2rem',
              borderRadius: '1rem',
            }}>
              <h3 style={{
                fontSize: '1.75rem',
                fontWeight: 'bold',
                color: '#00704a',
                marginBottom: '1.5rem',
                fontFamily: 'Rubik',
              }}>
                Long-term Focus
              </h3>
              <p style={{
                fontSize: '1.1rem',
                color: '#272727',
                fontFamily: 'Onest',
                lineHeight: '1.6',
              }}>
                We encourage and facilitate long-term partnerships between clients and freelancers. Our platform is designed for sustainable relationships, not just one-off gigs.
              </p>
            </div>
          </div>
          <p style={{
            fontSize: '1.25rem',
            color: 'white',
            textAlign: 'center',
            maxWidth: '48rem',
            margin: '0 auto',
            fontFamily: 'Onest',
            lineHeight: '1.8',
          }}>
            Our platform goes beyond traditional freelancing marketplaces by providing a comprehensive ecosystem that supports both freelancers and clients. With advanced AI tools, transparent processes, and a focus on quality relationships, we're building the future of work.
          </p>
        </div>
      </section>

      <footer style={{
        backgroundColor: 'white',
        padding: '4rem 1rem',
        color: '#272727',
        fontFamily: 'Rubik',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ ...decorativeCircle, width: '160px', height: '160px', top: '-5%', left: '10%' }} />
        <div style={{ ...decorativeCircle, width: '130px', height: '130px', bottom: '-3%', right: '15%' }} />
        
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          position: 'relative',
          zIndex: 1,
        }}>
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#00704a',
            }}>Join our Newsletter</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #00704a',
                  backgroundColor: 'transparent',
                  color: '#272727',
                }}
              />
              <button style={{
                padding: '0.5rem',
                backgroundColor: '#00704a',
                color: 'white',
                borderRadius: '0.375rem',
                fontWeight: 'bold',
              }}>
                Subscribe
              </button>
            </div>
          </div>
          
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#00704a',
            }}>Links</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><a href="#" style={{ color: '#272727', ':hover': { textDecoration: 'underline' } }}>Terms and Conditions</a></li>
              <li><a href="#" style={{ color: '#272727', ':hover': { textDecoration: 'underline' } }}>Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#00704a',
            }}>Location</h3>
            <address style={{ fontStyle: 'normal', color: '#272727' }}>
              House no 108 Pachkedhi Gandli<br />
              Pachkhedi Kuhi,<br />
              Nagpur, Maharashtra, PIN: 441210
            </address>
          </div>
          
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#00704a',
            }}>Contact</h3>
            <p style={{ color: '#272727' }}>+91 7038725831</p>
            <a href="mailto:info@gigzs.com" style={{ color: '#272727', ':hover': { textDecoration: 'underline' } }}>
              info@gigzs.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;