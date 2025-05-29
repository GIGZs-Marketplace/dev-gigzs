import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  title: string;
  content: string;
}

const Card: React.FC<CardProps> = ({ title, content }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-secondary p-6 rounded-2xl shadow-lg hover-effect"
    >
      <h3 className="text-xl font-semibold text-primary mb-4">{title}</h3>
      <p className="text-dark">{content}</p>
    </motion.div>
  );
};

export default Card;