import React from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import { SENTIMENT_COLORS, PLOTLY_COMMON_CONFIG, PLOTLY_COMMON_LAYOUT } from '../../utils/chartConstants';
import styles from './BlurredChart.module.css';

const BlurredSentimentChart: React.FC = () => {
  // Demo data for visual effect
  const data: Data[] = [
    {
      values: [35, 50, 15],
      labels: ['Positive', 'Neutral', 'Negative'],
      type: 'pie',
      hole: 0.4,
      marker: {
        colors: [
          SENTIMENT_COLORS.positive,
          SENTIMENT_COLORS.neutral,
          SENTIMENT_COLORS.negative,
        ],
      },
      textinfo: 'percent',
      textposition: 'inside',
      insidetextorientation: 'radial',
      hovertemplate: '<b>%{label}</b><br>%{value}%<br><extra></extra>',
    },
  ];

  const layout: Partial<Layout> = {
    ...PLOTLY_COMMON_LAYOUT,
    margin: { t: 10, r: 20, b: 100, l: 20 },
    showlegend: true,
    legend: {
      orientation: 'h',
      y: -0.4,
      x: 0.5,
      xanchor: 'center',
    },
  };

  return (
    <div className={styles.blurredChartContainer}>
      <div className={styles.blurredContent}>
        <Plot
          data={data}
          layout={layout}
          style={{ width: '100%', height: '300px' }}
          useResizeHandler
          config={PLOTLY_COMMON_CONFIG}
        />
        <div style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          marginTop: 12,
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          Coverage shows sentiment distribution across positive, neutral, and negative tones.
        </div>
      </div>
      <div className={styles.overlay}>
        <div className={styles.overlayContent}>
          <h3>Upgrade to Unlock</h3>
          <p>Access sentiment analysis on paid plans</p>
        </div>
      </div>
    </div>
  );
};

export default BlurredSentimentChart;
