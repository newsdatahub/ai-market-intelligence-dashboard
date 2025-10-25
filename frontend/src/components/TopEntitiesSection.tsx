import React from 'react';
import styles from './TopEntitiesSection.module.css';
import { TopEntities } from '../types';
import InfoTooltip from './InfoTooltip';

type Props = {
  entities: TopEntities;
  totalArticles?: number;
};

/**
 * Top Entities Mentioned section
 * Displays AI-extracted organizations, people, and locations
 */
const TopEntitiesSection: React.FC<Props> = ({ entities, totalArticles }) => {
  // Check if we have any entities
  const hasEntities =
    entities.organizations.length > 0 ||
    entities.people.length > 0 ||
    entities.locations.length > 0;

  // Empty state: <10 articles or no entities
  if (!hasEntities || (totalArticles && totalArticles < 10)) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}></h3>
          <InfoTooltip text="Automatically extracted from article titles and descriptions using AI entity recognition." />
        </div>
        <div className={styles.emptyState}>
          <p>Entity insights are unavailable due to limited data coverage.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>Top Entities Mentioned</h4>
        <InfoTooltip text="Automatically extracted from article titles and descriptions using AI entity recognition." />
      </div>

      <div className={styles.columns}>
        {/* Organizations Column */}
        <div className={styles.column}>
          <h4 className={styles.categoryTitle}>Organizations</h4>
          {entities.organizations.length > 0 ? (
            <div className={styles.entityPills}>
              {entities.organizations.map((org, idx) => (
                <span key={idx} className={styles.pill}>
                  {org}
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.noData}>No organizations identified</p>
          )}
        </div>

        {/* People Column */}
        <div className={styles.column}>
          <h4 className={styles.categoryTitle}>People</h4>
          {entities.people.length > 0 ? (
            <div className={styles.entityPills}>
              {entities.people.map((person, idx) => (
                <span key={idx} className={styles.pill}>
                  {person}
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.noData}>No people identified</p>
          )}
        </div>

        {/* Locations Column */}
        <div className={styles.column}>
          <h4 className={styles.categoryTitle}>Locations</h4>
          {entities.locations.length > 0 ? (
            <div className={styles.entityPills}>
              {entities.locations.map((location, idx) => (
                <span key={idx} className={styles.pill}>
                  {location}
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.noData}>No locations identified</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopEntitiesSection;
