import React, { useState, useEffect } from 'react';
import InfoTooltip from './InfoTooltip';
import { formatDate } from '../utils/helpers';

type Props = {
  topic: string;
  setTopic: (t: string) => void;
  startDate: string;
  endDate: string;
  setStartDate: (v: string) => void;
  setEndDate: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  onAnalyze: () => void;
  loading?: boolean;
};

type TimeRange = '14d' | '21d';

const exampleQueriesBasic = [
  '"artificial intelligence"',
  '"quantum computing"',
  '"electric vehicles"',
  '"semiconductor shortage"',
  '"cybersecurity breach"',
  '"space exploration"',
  '"robotics"',
  '"housing market"',
  '"interest rate hike"',
  '"gold mining"',
  '"coffee production"',
  '"supply chain"',
  '"immigration reform"',
  '"russia ukraine conflict"',
  '"trade war"',
  '"global food crisis"',
  '"oil price"'
];

const exampleQueriesAdvanced: string[] = [
  '"electric vehicles" AND battery',
  '"renewable energy" OR solar',
  "crypto NOT bitcoin",
  "ai AND regulation",
  "inflation OR recession",
  "china AND trade",
  "technology AND jobs",
  '"oil prices" AND US',
  "climate OR environment",
  '"electric vehicles" AND charging'
];

const getRandomPlaceholder = (): string => {
  // Randomly choose between basic and advanced (60% basic, 40% advanced)
  const useBasic = Math.random() < 0.6;
  const array = useBasic ? exampleQueriesBasic : exampleQueriesAdvanced;
  const randomQuery = array[Math.floor(Math.random() * array.length)];
  return `Try ${randomQuery}`;
};

const TopicInput: React.FC<Props> = ({ topic, setTopic, startDate, endDate, setStartDate, setEndDate, language, setLanguage, onAnalyze, loading }) => {
  const [placeholder, setPlaceholder] = useState<string>('');

  useEffect(() => {
    setPlaceholder(getRandomPlaceholder());
  }, []);
  const handleTimeRangeChange = (range: TimeRange) => {
    const now = new Date();
    const end = formatDate(now);
    let start: string;

    switch (range) {
      case '14d':
        const fourteenDaysAgo = new Date(now);
        fourteenDaysAgo.setDate(now.getDate() - 14);
        start = formatDate(fourteenDaysAgo);
        break;
      case '21d':
      default:
        const twentyOneDaysAgo = new Date(now);
        twentyOneDaysAgo.setDate(now.getDate() - 21);
        start = formatDate(twentyOneDaysAgo);
        break;
    }

    setStartDate(start);
    setEndDate(end);
  };

  // Determine current selected time range based on dates
  const getCurrentRange = (): TimeRange => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 14) return '14d';
    return '21d';
  };

  const tooltipText = `Search Tips:

• Exact phrases: Use quotes for precise matches
  Example: "artificial intelligence"

• Boolean operators: Combine terms with AND, OR, NOT
  • AND: "electric vehicles" AND battery
  • OR: "renewable energy" OR solar
  • NOT: "artificial intelligence" NOT IBM

• Simple queries: Just type keywords without quotes
  Example: quantum computing`;

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          placeholder={placeholder}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={{ width: 260 }}
        />
        <InfoTooltip text={tooltipText} />
      </div>
      <select value={getCurrentRange()} onChange={(e) => handleTimeRangeChange(e.target.value as TimeRange)}>
        <option value="14d">Last 14 days</option>
        <option value="21d">Last 21 days</option>
      </select>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
      </select>
      <button className="btn-primary" onClick={onAnalyze} disabled={loading}>
        Analyze
      </button>
    </div>
  );
};

export default TopicInput;
