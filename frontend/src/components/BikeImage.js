import React, { useEffect, useState } from 'react';
import bikePlaceholder from '../Bike-Image.png';

const BikeImage = ({ src, alt, ...imageProps }) => {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [src]);

  const handleError = () => {
    if (!hasImageError) setHasImageError(true);
  };

  return (
    <img
      {...imageProps}
      src={!hasImageError && src ? src : bikePlaceholder}
      alt={alt || 'Bike'}
      onError={handleError}
    />
  );
};

export default BikeImage;
