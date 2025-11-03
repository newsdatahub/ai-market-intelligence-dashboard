import React from 'react';
import { ApiTier } from '../types';
import styles from './TierBanner.module.css';
import { Zap } from 'lucide-react';

interface TierBannerProps {
  tier: ApiTier;
}

const TierBanner: React.FC<TierBannerProps> = ({ tier }) => {
  // Show free tier banner if detected
  if (tier === 'free') {
    return (
      <div className={styles.bannerFree}>
        <div className={styles.bannerContent}>
          <Zap size={18} />
          <span>
            You are on a free tier. Some features are limited. To see the full power of the application - try <strong>"artificial intelligence"-demo</strong>.{' '}
            <a
              href="https://newsdatahub.com/plans"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.bannerLink}
            >
              Upgrade to a paid plan
            </a>
            {' '}to access all features.
          </span>
        </div>
      </div>
    );
  }

  // No banner for paid tiers
  return null;
};

export default TierBanner;
