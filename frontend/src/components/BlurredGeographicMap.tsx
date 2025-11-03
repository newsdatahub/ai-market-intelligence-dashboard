import React from 'react';
import styles from './charts/BlurredChart.module.css';
import { MapPin } from 'lucide-react';

const BlurredGeographicMap: React.FC = () => {
  return (
    <div className={styles.blurredChartContainer} style={{ minHeight: '400px' }}>
      <div className={styles.blurredContent}>
        {/* Placeholder map content */}
        <div style={{
          width: '100%',
          height: '400px',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <MapPin size={64} style={{ color: 'var(--primary)', opacity: 0.3 }} />
          {/* Fake markers */}
          <div style={{ position: 'absolute', top: '30%', left: '20%', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.5 }} />
          <div style={{ position: 'absolute', top: '50%', left: '60%', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.5 }} />
          <div style={{ position: 'absolute', top: '70%', left: '40%', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.5 }} />
        </div>
      </div>
      <div className={styles.overlay}>
        <div className={styles.overlayContent}>
          <h3>Upgrade to Unlock</h3>
          <p>Access geographic coverage analysis on paid plans</p>
        </div>
      </div>
    </div>
  );
};

export default BlurredGeographicMap;
