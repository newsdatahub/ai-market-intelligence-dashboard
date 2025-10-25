import React from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './IntelligenceReport.module.css';
import { formatDateRange } from '../utils/helpers';

type Props = {
  report: string;
  containerId?: string;
  reportType?: 'main' | 'timeline' | 'geographic';
  startDate?: string;
  endDate?: string;
  specificDate?: string;
};

const IntelligenceReport: React.FC<Props> = ({
  report,
  containerId = 'report-container',
  reportType = 'main',
  startDate,
  endDate,
  specificDate
}) => {
  const disclaimer = `

**Disclaimer:**
This report was generated using data from the [NewsDataHub API](https://newsdatahub.com). © 2025 NewsDataHub — All rights reserved. The analysis and summaries are AI-derived and intended for informational and research purposes only. Results may include inaccuracies or incomplete data, especially for topics with limited coverage. This report does not constitute financial, legal, or professional advice.`;

  return (
    <div id={containerId} className={styles.reportContainer}>
      <ReactMarkdown>{report + disclaimer}</ReactMarkdown>
    </div>
  );
};

export default IntelligenceReport;

