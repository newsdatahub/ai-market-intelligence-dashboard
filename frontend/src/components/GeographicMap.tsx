import React from 'react';
import Map from './Map';

type Props = {
  topic: string;
  geography: Record<string, number>;
  onCountryClick: (topic: string, country: string) => void;
  disabled?: boolean;
};

const GeographicMap: React.FC<Props> = ({ topic, geography, onCountryClick, disabled = false }) => {
  return <Map brand={topic} geography={geography} onCountryClick={(cc) => onCountryClick(topic, cc)} disabled={disabled} />;
};

export default GeographicMap;

