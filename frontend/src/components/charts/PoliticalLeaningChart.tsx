import React from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import { POLITICAL_LEANING_COLORS, PLOTLY_COMMON_CONFIG, PLOTLY_COMMON_LAYOUT } from '../../utils/chartConstants';
import { formatLabel } from '../../utils/helpers';

type Props = {
  distribution: { leaning: string; count: number; share: number }[];
};

const PoliticalLeaningChart: React.FC<Props> = ({ distribution }) => {
  // Filter out entries with 0 count and sort by share descending
  const sorted = [...distribution]
    .filter(d => d.count > 0)
    .sort((a, b) => b.share - a.share);

  const values = sorted.map(d => Math.round(d.share * 100));
  const labels = sorted.map(d => formatLabel(d.leaning));
  const colors = sorted.map(d => POLITICAL_LEANING_COLORS[d.leaning.toLowerCase()] || POLITICAL_LEANING_COLORS.unknown);
  const counts = sorted.map(d => d.count);

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
      hovertemplate: '<b>%{label}</b><br>%{customdata} articles<br>%{value}%<extra></extra>',
      customdata: counts,
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

  // Calculate if ideologically balanced
  const maxShare = Math.max(...sorted.map(d => d.share));
  const dominant = sorted.find(d => d.share === maxShare);

  const getInsightText = (): string => {
    if (!dominant) return 'Coverage appears ideologically diverse across different political leanings.';

    const percentage = Math.round(dominant.share * 100);

    if (dominant.leaning === 'nonpartisan') {
      if (maxShare > 0.7) {
        return `Coverage is dominated by nonpartisan sources (${percentage}%), suggesting neutral or factual reporting.`;
      } else {
        return `Most coverage comes from nonpartisan sources (${percentage}%), with balanced representation from other outlets.`;
      }
    } else if (maxShare > 0.5) {
      return `Coverage is skewed toward ${formatLabel(dominant.leaning)} sources (${percentage}%), indicating potential ideological bias.`;
    } else {
      return 'Coverage appears ideologically diverse across different political leanings.';
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

export default PoliticalLeaningChart;
