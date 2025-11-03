import React from 'react';
import styles from './UpgradePrompt.module.css';
import { Lock, ArrowRight } from 'lucide-react';

interface UpgradePromptProps {
  feature: string;
  description?: string;
  icon?: React.ReactNode;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ feature, description, icon }) => {
  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        {icon || <Lock size={32} className={styles.lockIcon} />}
      </div>
      <h4 className={styles.title}>{feature}</h4>
      {description && <p className={styles.description}>{description}</p>}
      <div className={styles.actions}>
        <a
          href="https://newsdatahub.com/plans"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.upgradeButton}
        >
          Upgrade to Unlock
          <ArrowRight size={16} />
        </a>
        <a
          href="https://newsdatahub.com/docs"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.learnMore}
        >
          Learn More
        </a>
      </div>
    </div>
  );
};

export default UpgradePrompt;
