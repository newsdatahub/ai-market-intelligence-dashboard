import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import styles from './CoverageTimeline.module.css';
import {
  CHART_COLOR_PALETTE,
  ECHARTS_COMMON_CONFIG,
  ECHARTS_TOOLTIP_CONFIG,
  CHART_COLORS,
} from '../../utils/chartConstants';

type Series = {
  name: string;
  dates: string[];
  values: number[];
};

type Props = {
  series: Series[];
  onPointClick?: (topic: string, date: string) => void;
  compact?: boolean;
  disabled?: boolean;
};

interface ChartClickParams {
  componentType: string;
  seriesName?: string;
  name?: string;
}

const CoverageTimeline: React.FC<Props> = React.memo(({
  series,
  onPointClick,
  compact = false,
  disabled = false
}) => {
  const option = useMemo<EChartsOption>(() => {
    const dates = series[0]?.dates || [];

    return {
      color: CHART_COLOR_PALETTE,
      tooltip: {
        ...ECHARTS_TOOLTIP_CONFIG,
        trigger: 'item',
        formatter: '{b}<br/>Mentions: {c}<br/><b>Click to generate insights</b>',
      },
      legend: { top: 0 },
      grid: { top: 40, right: 20, bottom: 50, left: 60 },
      xAxis: {
        type: 'category',
        data: dates,
        name: 'Date',
      },
      yAxis: {
        type: 'value',
        name: 'Mentions',
      },
      dataZoom: [
        { type: 'inside' },
        { type: 'slider' }
      ],
      series: series.map((s) => ({
        type: 'line',
        name: s.name,
        smooth: false,
        symbolSize: 8,
        symbol: 'circle',
        itemStyle: {
          color: CHART_COLORS.secondary,
          borderColor: CHART_COLORS.secondary,
          borderWidth: 2,
        },
        emphasis: {
          focus: 'series',
          scale: true,
          symbolSize: 18,
          itemStyle: {
            color: CHART_COLORS.secondary,
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 15,
            shadowColor: 'rgba(44, 62, 80, 0.6)',
          },
        },
        data: s.values,
      })),
    };
  }, [series]);

  const onEvents = useMemo(() => ({
    click: (params: ChartClickParams) => {
      if (!onPointClick || disabled) return;
      if (!params || params.componentType !== 'series') return;

      const topic = String(params.seriesName);
      const date = String(params.name);

      onPointClick(topic, date);
    },
  }), [onPointClick, disabled]);

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartWrapper}>
        <ReactECharts
          option={option}
          onEvents={onEvents}
          style={{
            width: '100%',
            height: '100%',
            cursor: (onPointClick && !disabled) ? 'pointer' : 'default',
            opacity: disabled ? 0.6 : 1,
          }}
          opts={ECHARTS_COMMON_CONFIG}
          notMerge={false}
          lazyUpdate={false}
        />
      </div>
    </div>
  );
});

CoverageTimeline.displayName = 'CoverageTimeline';

export default CoverageTimeline;
