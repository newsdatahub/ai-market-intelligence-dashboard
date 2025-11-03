import React from 'react';
import styles from './charts/BlurredChart.module.css';
import { TrendingUp } from 'lucide-react';

const BlurredTimeline: React.FC = () => {
  return (
    <div className={styles.blurredChartContainer} style={{ minHeight: '300px' }}>
      <div className={styles.blurredContent}>
        {/* Placeholder timeline */}
        <div style={{
          width: '100%',
          height: '300px',
          background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          padding: '20px',
          gap: '8px'
        }}>
          {/* Fake bars */}
          {[40, 60, 35, 80, 55, 70, 45].map((height, i) => (
            <div
              key={i}
              style={{
                width: '12%',
                height: `${height}%`,
                background: 'var(--primary)',
                borderRadius: '4px 4px 0 0',
                opacity: 0.5
              }}
            />
          ))}
        </div>
      </div>
      <div className={styles.overlay}>
        <div className={styles.overlayContent}>
          <h3>Upgrade to Unlock</h3>
          <p>Access timeline analysis on paid plans</p>
        </div>
      </div>
    </div>
  );
};

export default BlurredTimeline;
