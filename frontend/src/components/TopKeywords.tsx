import React, { useState, useEffect } from 'react';
import styles from './TopKeywords.module.css';
import KeywordStatsChart from './KeywordStatsChart';
import InfoTooltip from './InfoTooltip';

type Props = {
  keywords: { keyword: string; count: number }[];
  maxItems?: number;
};

/**
 * Top Keywords component
 * Displays keyword frequency statistics as inline pills and horizontal bar chart
 */
const TopKeywords: React.FC<Props> = ({ keywords, maxItems = 10 }) => {
  const [showChart, setShowChart] = useState(true);

  // Handle responsive behavior - hide chart on small screens
  useEffect(() => {
    const handleResize = () => {
      setShowChart(window.innerWidth >= 768); // md breakpoint
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!keywords || keywords.length === 0) {
    return null;
  }

  // Low data threshold - show list only if <3 items
  const showChartForData = keywords.length >= 3;

  return (
    <div className={styles.container} role="region" aria-labelledby="keyword-stats">
      <div className={styles.header}>
        <h4 className={styles.title} id="keyword-stats">Top Keywords</h4>
        <InfoTooltip text="Most frequently mentioned keywords across all analyzed articles" />
      </div>

      <div className={styles.content}>
        {/* Left column: Pills list */}
        <div className={styles.listColumn}>
          <div className={styles.keywordPills}>
            {keywords.slice(0, maxItems).map((item, idx) => (
              <span
                key={idx}
                className={styles.pill}
                role="listitem"
                aria-label={`${item.keyword}: ${item.count} mentions`}
              >
                {item.keyword}
                <span className={styles.count}>{item.count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right column: Chart (desktop only, if sufficient data) */}
        {showChart && showChartForData && (
          <div className={styles.chartColumn}>
            <KeywordStatsChart keywords={keywords} maxItems={maxItems} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TopKeywords;
