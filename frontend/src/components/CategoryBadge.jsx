import React from 'react';
import './CategoryBadge.css';

const CategoryBadge = ({ name, className = '' }) => {
  return (
    <span className={`category-badge ${className}`}>
      {name}
    </span>
  );
};

export default CategoryBadge;

