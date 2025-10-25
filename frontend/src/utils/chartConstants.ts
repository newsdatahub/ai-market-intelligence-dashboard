/**
 * Chart color constants.
 * These match the CSS variables defined in index.css.
 */

/**
 * Gets a CSS variable value from the root element.
 */
function getCSSVariable(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Main chart color palette for series/lines.
 */
export const CHART_COLORS = {
  primary: getCSSVariable('--chart-primary'),
  secondary: getCSSVariable('--chart-secondary'),
  tertiary: getCSSVariable('--chart-tertiary'),
  quaternary: getCSSVariable('--chart-quaternary'),
  quinary: getCSSVariable('--chart-quinary'),
};

/**
 * Array of chart colors for series.
 */
export const CHART_COLOR_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.quaternary,
  CHART_COLORS.quinary,
];

/**
 * Sentiment analysis colors.
 */
export const SENTIMENT_COLORS = {
  positive: getCSSVariable('--sentiment-positive'),
  neutral: getCSSVariable('--sentiment-neutral'),
  negative: getCSSVariable('--sentiment-negative'),
} as const;

/**
 * Political leaning colors.
 */
export const POLITICAL_LEANING_COLORS: Record<string, string> = {
  far_left: getCSSVariable('--political-far-left'),
  left: getCSSVariable('--political-left'),
  center_left: getCSSVariable('--political-center-left'),
  center: getCSSVariable('--political-center'),
  center_right: getCSSVariable('--political-center-right'),
  right: getCSSVariable('--political-right'),
  far_right: getCSSVariable('--political-far-right'),
  nonpartisan: getCSSVariable('--political-nonpartisan'),
  unknown: getCSSVariable('--political-unknown'),
};

/**
 * Common chart configuration for Plotly charts.
 */
export const PLOTLY_COMMON_CONFIG = {
  displayModeBar: false,
};

/**
 * Common layout settings for Plotly charts.
 */
export const PLOTLY_COMMON_LAYOUT = {
  paper_bgcolor: getCSSVariable('--chart-paper-bg'),
  plot_bgcolor: getCSSVariable('--chart-bg'),
  font: {
    family: 'Manrope',
    color: getCSSVariable('--text-primary'),
    size: 12,
  },
  hoverlabel: {
    bgcolor: getCSSVariable('--primary-dark'),
    font: {
      family: 'Manrope',
      size: 13,
      color: 'white',
    },
  },
};

/**
 * Common ECharts configuration.
 */
export const ECHARTS_COMMON_CONFIG = {
  renderer: 'canvas' as const,
};

/**
 * Common tooltip configuration for ECharts.
 */
export const ECHARTS_TOOLTIP_CONFIG = {
  backgroundColor: 'rgba(50, 50, 50, 0.9)',
  borderColor: getCSSVariable('--chart-primary'),
  borderWidth: 1,
  textStyle: {
    color: '#fff',
  },
};
