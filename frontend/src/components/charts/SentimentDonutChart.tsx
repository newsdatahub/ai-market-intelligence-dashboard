import React from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import { SENTIMENT_COLORS, PLOTLY_COMMON_CONFIG, PLOTLY_COMMON_LAYOUT } from '../../utils/chartConstants';

type Props = {
  sentiment: { positive: number; neutral: number; negative: number };
};

const SentimentDonutChart: React.FC<Props> = ({ sentiment }) => {
  // Convert to percentages and round to nearest 1%
  const positive = Math.round(sentiment.positive * 100);
  const neutral = Math.round(sentiment.neutral * 100);
  const negative = Math.round(sentiment.negative * 100);

  const data: Data[] = [
    {
      values: [positive, neutral, negative],
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

  const getInsightText = (): string => {
    if (neutral >= 70) {
      return `Coverage is predominantly neutral (${neutral}%), indicating factual rather than opinion-driven reporting.`;
    } else if (positive >= 25) {
      return `Positive tone dominates (${positive}%), often reflecting breakthroughs or optimistic developments.`;
    } else if (negative >= 25) {
      return `Negative tone is significant (${negative}%), often tied to regulatory, legal, or risk-related issues.`;
    } else {
      return 'Coverage shows mixed sentiment distribution across positive, neutral, and negative tones.';
    }
  };

  return (
    <div>
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
        {getInsightText()}
      </div>
    </div>
  );
};

export default SentimentDonutChart;
