declare module 'react-plotly.js' {
  import { Component } from 'react';
  import * as Plotly from 'plotly.js';

  export interface PlotParams {
    data: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    frames?: Plotly.Frame[];
    revision?: number;
    onInitialized?: (figure: Readonly<Plotly.Figure>, graphDiv: Readonly<HTMLElement>) => void;
    onUpdate?: (figure: Readonly<Plotly.Figure>, graphDiv: Readonly<HTMLElement>) => void;
    onPurge?: (figure: Readonly<Plotly.Figure>, graphDiv: Readonly<HTMLElement>) => void;
    onError?: (err: Readonly<Error>) => void;
    onClickAnnotation?: (event: Readonly<Plotly.ClickAnnotationEvent>) => void;
    onClick?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onHover?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onUnhover?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onSelected?: (event: Readonly<Plotly.PlotSelectionEvent>) => void;
    onSelecting?: (event: Readonly<Plotly.PlotSelectionEvent>) => void;
    onDeselect?: () => void;
    onDoubleClick?: () => void;
    onRedraw?: () => void;
    onAnimated?: () => void;
    onAnimatingFrame?: (event: Readonly<Plotly.FrameAnimationEvent>) => void;
    onAnimationInterrupted?: () => void;
    onAfterExport?: () => void;
    onAfterPlot?: () => void;
    onAutoSize?: () => void;
    onBeforeExport?: () => void;
    onBeforeHover?: (event: Readonly<Plotly.PlotMouseEvent>) => boolean;
    onButtonClicked?: (event: Readonly<Plotly.ButtonClickEvent>) => void;
    onFramework?: () => void;
    onLegendClick?: (event: Readonly<Plotly.LegendClickEvent>) => boolean;
    onLegendDoubleClick?: (event: Readonly<Plotly.LegendClickEvent>) => boolean;
    onRelayout?: (event: Readonly<Plotly.PlotRelayoutEvent>) => void;
    onRelayouting?: (event: Readonly<Plotly.PlotRelayoutEvent>) => void;
    onRestyle?: (event: Readonly<Plotly.PlotRestyleEvent>) => void;
    onSliderChange?: (event: Readonly<Plotly.SliderChangeEvent>) => void;
    onSliderEnd?: (event: Readonly<Plotly.SliderEndEvent>) => void;
    onSliderStart?: (event: Readonly<Plotly.SliderStartEvent>) => void;
    onSunburstClick?: (event: Readonly<Plotly.SunburstClickEvent>) => void;
    onTransitioning?: () => void;
    onTransitionInterrupted?: () => void;
    onWebGlContextLost?: () => void;
    divId?: string;
    className?: string;
    style?: React.CSSProperties;
    useResizeHandler?: boolean;
    debug?: boolean;
  }

  export default class Plot extends Component<PlotParams> {}
}
