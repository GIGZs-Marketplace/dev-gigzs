import React from 'react';
import { motion } from 'framer-motion';

const FloatingShapes = () => {
  const shapes = [
    // Background circles
    { type: 'circle', size: 40, color: '#00704a15', left: '10%', top: '20%', duration: 20 },
    { type: 'circle', size: 60, color: '#00704a10', right: '15%', top: '30%', duration: 25 },
    { type: 'circle', size: 80, color: '#00704a08', left: '20%', bottom: '20%', duration: 30 },
    { type: 'circle', size: 50, color: '#00704a12', right: '25%', bottom: '30%', duration: 22 },
    
    // Decorative elements
    { type: 'square', size: 15, color: '#00704a20', left: '5%', top: '40%', duration: 15, rotate: true },
    { type: 'square', size: 20, color: '#00704a25', right: '8%', top: '60%', duration: 18, rotate: true },
    { type: 'circle', size: 10, color: '#00704a30', left: '15%', top: '70%', duration: 12 },
    { type: 'circle', size: 12, color: '#00704a35', right: '20%', bottom: '15%', duration: 14 },
    
    // Navbar decoration
    { type: 'circle', size: 25, color: '#00704a15', left: '2%', top: '5%', duration: 8 },
    { type: 'circle', size: 15, color: '#00704a20', right: '5%', top: '8%', duration: 10 },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            width: shape.size,
            height: shape.size,
            backgroundColor: shape.color,
            borderRadius: shape.type === 'circle' ? '50%' : '15%',
            left: shape.left,
            right: shape.right,
            top: shape.top,
            bottom: shape.bottom,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: shape.rotate ? [0, 360] : 0,
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default FloatingShapes;