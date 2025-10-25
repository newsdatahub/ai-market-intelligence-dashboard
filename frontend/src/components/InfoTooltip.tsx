import React from 'react';
import { Info } from 'lucide-react';
import styles from './InfoTooltip.module.css';

type Props = {
  text: string;
  size?: number;
};

const InfoTooltip: React.FC<Props> = ({ text, size = 16 }) => {
  return (
    <span className={styles.container}>
      <Info size={size} className={styles.icon} />
      <span className={styles.tooltip}>{text}</span>
    </span>
  );
};

export default InfoTooltip;
