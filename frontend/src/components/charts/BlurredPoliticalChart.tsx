import React from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import { POLITICAL_LEANING_COLORS, PLOTLY_COMMON_CONFIG, PLOTLY_COMMON_LAYOUT } from '../../utils/chartConstants';
import styles from './BlurredChart.module.css';

const BlurredPoliticalChart: React.FC = () => {
  // Demo data for visual effect
  const values = [25, 30, 20, 25];
  const labels = ['Left', 'Center', 'Right', 'Nonpartisan'];
  const colors = [
    POLITICAL_LEANING_COLORS.left,
    POLITICAL_LEANING_COLORS.center,
    POLITICAL_LEANING_COLORS.right,
    POLITICAL_LEANING_COLORS.nonpartisan,
  ];

  const data: Data[] = [
    {
      values,
      labels,
      type: 'pie',
      hole: 0.4,
      marker: {
        colors,
      },
      textinfo: 'percent',
      textposition: 'inside',
      insidetextorientation: 'radial',
      hovertemplate: '<b>%{label}</b><br>%{value}%<extra></extra>',
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
          Coverage appears ideologically diverse across different political leanings.
        </div>
      </div>
      <div className={styles.overlay}>
        <div className={styles.overlayContent}>
          <h3>Upgrade to Unlock</h3>
          <p>Access political bias analysis on paid plans</p>
        </div>
      </div>
    </div>
  );
};

export default BlurredPoliticalChart;
