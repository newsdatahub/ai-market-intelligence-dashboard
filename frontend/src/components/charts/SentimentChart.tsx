import React from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout, PlotMouseEvent } from 'plotly.js';
import { SENTIMENT_COLORS, PLOTLY_COMMON_CONFIG, PLOTLY_COMMON_LAYOUT } from '../../utils/chartConstants';
import { formatLabel } from '../../utils/helpers';
import type { SentimentCategory } from '../../types';

type Props = {
  topics: string[];
  sentiments: Record<string, { positive: number; neutral: number; negative: number }>; // as fractions 0..1
  onSentimentClick?: (topic: string, sentiment: SentimentCategory) => void;
};

const SentimentChart: React.FC<Props> = ({ topics, sentiments, onSentimentClick }) => {
  const categories: SentimentCategory[] = ['positive', 'neutral', 'negative'];

  const data: Data[] = categories.map((category) => ({
    x: topics,
    y: topics.map((topic) => Math.round(((sentiments[topic]?.[category] || 0) * 1000)) / 10),
    name: formatLabel(category),
    type: 'bar',
    marker: { color: SENTIMENT_COLORS[category] },
    hovertemplate: '<b>%{fullData.name}</b><br>%{x}<br>%{y:.1f}%<extra></extra>',
    customdata: topics.map(() => category),
  }));

  const layout: Partial<Layout> = {
    ...PLOTLY_COMMON_LAYOUT,
    barmode: 'stack',
    xaxis: {
      title: {
        text: 'Topic',
        font: {
          family: 'Manrope',
          size: 14,
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
        }
      }
    },
    yaxis: {
      title: {
        text: 'Percentage',
        font: {
          family: 'Manrope',
          size: 14,
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
        }
      }
    },
    margin: { t: 20, r: 20, b: 60, l: 60 },
    showlegend: true,
    legend: {
      orientation: 'h',
      y: -0.2,
    },
  };

  const handleClick = (event: Readonly<PlotMouseEvent>) => {
    if (!onSentimentClick) return;

    const point = event.points?.[0];
    if (!point) return;

    const topic = String(point.x);
    const sentiment = (point.data as Data & { customdata?: string[] }).customdata?.[point.pointIndex] as SentimentCategory;

    if (sentiment) {
      onSentimentClick(topic, sentiment);
    }
  };

  return (
    <div>
      <h3 style={{ marginBottom: 12, color: 'var(--primary-dark)' }}>Sentiment Comparison</h3>
      <Plot
        data={data}
        layout={layout}
        style={{
          width: '100%',
          height: '350px',
          cursor: onSentimentClick ? 'pointer' : 'default'
        }}
        useResizeHandler
        onClick={handleClick}
        config={PLOTLY_COMMON_CONFIG}
      />
      {onSentimentClick && (
        <div style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          marginTop: 8,
          textAlign: 'center'
        }}>
          💡 Click any bar to filter articles by sentiment
        </div>
      )}
    </div>
  );
};

export default SentimentChart;
