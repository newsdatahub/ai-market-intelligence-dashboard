import React from 'react';
import Plot from 'react-plotly.js';

type KeywordStat = { keyword: string; count: number };

type Props = {
  keywords: KeywordStat[];
  maxItems?: number;
};

/**
 * Keyword Statistics Chart - Mini Bar Chart
 * Displays top keywords as horizontal bars with counts
 */
const KeywordStatsChart: React.FC<Props> = ({ keywords, maxItems = 10 }) => {
  if (!keywords || keywords.length === 0) {
    return null;
  }

  // Limit to maxItems and prepare data
  const items = keywords.slice(0, maxItems);
  const keywordLabels = items.map(item => item.keyword);
  const counts = items.map(item => item.count);

  // Calculate max value and add 10% padding for labels
  const maxCount = Math.max(...counts);
  const xAxisMax = Math.ceil(maxCount * 1.1);

  // Calculate percentages for tooltips
  const totalCount = items.reduce((sum, item) => sum + item.count, 0);
  const percentages = counts.map(count => ((count / totalCount) * 100).toFixed(1));

  // Custom hover text with keyword, count, and percentage
  const hoverText = items.map((item, idx) =>
    `${item.keyword}: ${item.count} mentions (${percentages[idx]}%)`
  );

  // Build accessible description text
  const chartDescription = `Bar chart showing keyword frequency. ${items.map((item, idx) =>
    `${item.keyword}: ${item.count} mentions (${percentages[idx]}%)`
  ).join('. ')}.`;

  const data = [
    {
      x: counts,
      y: keywordLabels,
      type: 'bar',
      orientation: 'h',
      marker: {
        color: '#494564',
        line: {
          color: '#494564',
          width: 1,
        },
      },
      text: counts.map(String),
      textposition: 'outside',
      textfont: { size: 14 },
      hovertemplate: '%{customdata}<extra></extra>',
      customdata: hoverText,
    },
  ];

  return (
    <div
      role="img"
      aria-label={chartDescription}
      style={{ position: 'relative', width: '100%' }}
    >
      <Plot
        data={data as any}
        layout={{
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { family: 'Manrope', color: '#2c3e50', size: 11 },
          margin: { t: 10, r: 60, b: 30, l: 10 },
          autosize: true,
          xaxis: {
            title: 'Mentions',
            showgrid: true,
            gridcolor: 'rgba(0, 0, 0, 0.05)',
            zeroline: false,
            range: [0, xAxisMax],
            automargin: true,
          },
          yaxis: {
            autorange: 'reversed', // Top item at top
            showgrid: false,
            tickfont: { size: 14 },
            automargin: true,
          },
          hoverlabel: {
            bgcolor: '#2c3e50',
            font: { family: 'Manrope', size: 12, color: 'white' },
          },
          hovermode: 'closest',
        } as any}
        style={{ width: '100%', height: `${Math.max(250, items.length * 30 + 60)}px` }}
        useResizeHandler
        config={{
          displayModeBar: false,
        }}
      />
      {/* Screen reader only text alternative */}
      <div style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}>
        <p>Keyword frequency data:</p>
        <ul>
          {items.map((item, idx) => (
            <li key={idx}>
              {item.keyword}: {item.count} mentions ({percentages[idx]}%)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default KeywordStatsChart;
