import React, { useEffect, useMemo, useState, useCallback } from 'react';
import styles from './AnalysisDashboard.module.css';
import TopicInput from './TopicInput';
import { newsApi } from '../services/newsApi';
import { reportApi } from '../services/reportApi';
import { NewsArticle, ProcessedTopicData } from '../types';
import CoverageTimeline from './charts/CoverageTimeline';
import SentimentChart from './charts/SentimentChart';
import SentimentDonutChart from './charts/SentimentDonutChart';
import PoliticalLeaningChart from './charts/PoliticalLeaningChart';
import TopEntitiesSection from './TopEntitiesSection';
import TopKeywords from './TopKeywords';
import GeographicMap from './GeographicMap';
import IntelligenceReport from './IntelligenceReport';
import ExportReportPDF from './ExportReportPDF';
import { useToast } from './Toast';
import InfoTooltip from './InfoTooltip';
import ProgressIndicator from './ProgressIndicator';
import { Brain, PieChart, Newspaper, Building2, TrendingUp, Globe, BarChart3, MapPin } from 'lucide-react';
import { getCountryName } from '../constants/countries';
import { formatDate, deduplicateArticles } from '../utils/helpers';
import {
  MIN_ARTICLES_FOR_ANALYSIS,
  TIMELINE_DATE_RANGE_DAYS,
  MIN_ARTICLES_BEFORE_FETCHING_RELATED,
  MAX_ARTICLES_FOR_AI_ANALYSIS,
  MAX_RELATED_ARTICLES_TO_FETCH,
  SENTIMENT_THRESHOLDS,
} from '../constants/analysisThresholds';

const AnalysisDashboard: React.FC = () => {
  const toast = useToast();
  const today = new Date();
  const startDefault = new Date();
  startDefault.setDate(today.getDate() - 7);
  const [topic, setTopic] = useState<string>('');
  const [startDate, setStartDate] = useState(formatDate(startDefault));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProcessedTopicData | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [report, setReport] = useState<string>('');
  const [loadingTimelineArticles, setLoadingTimelineArticles] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatingTimelineReport, setGeneratingTimelineReport] = useState(false);
  const [geoReport, setGeoReport] = useState<string>('');
  const [generatingGeoReport, setGeneratingGeoReport] = useState(false);
  const [geoArticles, setGeoArticles] = useState<NewsArticle[]>([]);
  const [loadingGeoArticles, setLoadingGeoArticles] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [timelineReport, setTimelineReport] = useState<string>('');
  const [showMainReferences, setShowMainReferences] = useState(false);
  const [showTimelineReferences, setShowTimelineReferences] = useState(false);
  const [showGeoReferences, setShowGeoReferences] = useState(false);
  const [reportReady, setReportReady] = useState<string>(''); // Holds report until progress reaches 100%
  const [showReport, setShowReport] = useState(false); // Controls when to actually display the report

  const onAnalyze = async () => {
    // Clear content immediately - this will trigger loading states in panels
    setData(null);
    setReport('');
    setReportReady('');
    setShowReport(false);
    setArticles([]);
    setGeoArticles([]);
    setGeoReport('');
    setTimelineReport('');
    setSelectedTopic('');
    setSelectedCountry('');
    setSelectedDate('');
    setGeneratingReport(false);
    setGeneratingTimelineReport(false);
    setGeneratingGeoReport(false);
    setLoadingTimelineArticles(false);
    setLoadingGeoArticles(false);

    setLoading(true);

    try {
      const resp = await newsApi.analyzeTopic({ topic, startDate, endDate, language });

      // Guardrail: Check if we have sufficient articles
      const articleCount = resp.topic?.totalMentions || 0;
      if (articleCount < MIN_ARTICLES_FOR_ANALYSIS) {
        setLoading(false);
        if (articleCount === 0) {
          toast.error(`Insufficient data found. No articles found for "${topic}". Please try a different topic.`);
          return;
        }

        toast.error(`Insufficient data found. Only ${articleCount} article${articleCount !== 1 ? 's' : ''} found for "${topic}". Please try a different topic.`);
        return;
      }

      setData(resp.topic);

      // Check if this is demo mode
      const isDemoMode = topic.trim().endsWith('-demo');

      // Auto-generate insights after successful analysis
      setGeneratingReport(true);
      try {
        const reportResp = await reportApi.generateReport({ topic, startDate, endDate, language, reportType: 'custom' });
        // Store report but don't show it yet - wait for progress to reach 100%
        setReportReady(reportResp.report);
      } catch (reportErr) {
        // Don't set error - analysis succeeded, just report generation failed
      } finally {
        setGeneratingReport(false);
      }

      // Auto-generate demo reports for timeline and geographic
      if (isDemoMode && resp.topic) {
        // Auto-generate timeline report for the highest spike date
        const mentionsByDay = resp.topic.mentionsByDay || {};
        const dates = Object.keys(mentionsByDay);
        if (dates.length > 0) {
          // Find date with most mentions
          const highestDate = dates.reduce((max, date) =>
            mentionsByDay[date] > mentionsByDay[max] ? date : max
          , dates[0]);

          // Trigger timeline report automatically
          handleSpike(topic, highestDate);
        }

        // Auto-generate geographic report for the top country
        const geoDistribution = resp.topic.geographicDistribution || [];
        if (geoDistribution.length > 0) {
          const topCountry = geoDistribution[0].country;
          // Trigger geographic report automatically
          handleGeo(topic, topCountry);
        }
      }
    } catch (e: any) {
      // Check if this is an unsupported demo topic error
      console.log('=======>',)
      if (e?.statusCode === 400 && e?.data?.supportedDemos) {
        const supportedDemos = e.data.supportedDemos;
        const exampleCommand = supportedDemos.length > 0 ? `"${supportedDemos[0]}"-demo` : '';
        toast.error(`This demo topic not supported.\n Try: ${exampleCommand}`, 10000);
      } else if (e?.message?.includes('Missing API configuration')) {
        toast.error(e.message, 10000);
      } else {
        toast.error('Oops! Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProgressComplete = () => {
    // When progress reaches 100%, show the report
    setReport(reportReady);
    setShowReport(true);
  };

  const allDates = useMemo(() => {
    if (!data) return [] as string[];
    return Object.keys(data.mentionsByDay).sort();
  }, [data]);

  const series = useMemo(() => {
    if (!data) return [] as { name: string; dates: string[]; values: number[] }[];
    return [{ name: data.topic, dates: allDates, values: allDates.map((d) => data.mentionsByDay[d] || 0) }];
  }, [data, allDates]);

  const sentiments = useMemo(() => {
    if (!data) return {} as Record<string, { positive: number; neutral: number; negative: number }>;
    return { [data.topic]: data.sentimentAverage };
  }, [data]);

  const handleSpike = useCallback(async (topic: string, date: string) => {
    setLoadingTimelineArticles(true);
    setArticles([]);
    setTimelineReport('');
    setSelectedDate(date);
    setGeneratingTimelineReport(true);
    try {
      // Calculate date range based on TIMELINE_DATE_RANGE_DAYS
      const selectedDate = new Date(date);
      const dayBefore = new Date(selectedDate);
      dayBefore.setDate(selectedDate.getDate() - TIMELINE_DATE_RANGE_DAYS);
      const dayAfter = new Date(selectedDate);
      dayAfter.setDate(selectedDate.getDate() + TIMELINE_DATE_RANGE_DAYS);

      const start_date = formatDate(dayBefore);
      const end_date = formatDate(dayAfter);

      // Fetch articles for date range
      const resp = await newsApi.searchArticles({ topic, start_date, end_date, language });
      setSelectedTopic(topic);
      let fetchedArticles = resp.data || [];

      // If we have fewer articles than threshold, fetch related articles
      if (fetchedArticles.length < MIN_ARTICLES_BEFORE_FETCHING_RELATED && fetchedArticles.length > 0) {
        const relatedPromises = fetchedArticles.slice(0, MAX_RELATED_ARTICLES_TO_FETCH).map(article =>
          newsApi.getRelatedArticles(article.id).catch(() => ({ data: [] }))
        );

        const relatedResults = await Promise.all(relatedPromises);
        const relatedArticles = relatedResults.flatMap(r => r.data || []);

        // Combine original and related, remove duplicates
        const allArticles = [...fetchedArticles, ...relatedArticles];
        fetchedArticles = deduplicateArticles(allArticles);
      }

      setArticles(fetchedArticles);
      setLoadingTimelineArticles(false);

      // Auto-generate timeline insights
      if (fetchedArticles.length > 0) {
        try {
          const res = await reportApi.analyzeContext({
            context: 'spike',
            topic,
            articles: fetchedArticles.slice(0, MAX_ARTICLES_FOR_AI_ANALYSIS)
          });
          setTimelineReport(res.summary);
        } catch (aiErr) {
          toast.error('Oops! Something went wrong. Please try again later.');
        }
      }
    } catch (e) {
      toast.error('Oops! Something went wrong. Please try again later.');
      setLoadingTimelineArticles(false);
    } finally {
      setGeneratingTimelineReport(false);
    }
  }, [language, toast]);

  const handleGeo = async (topic: string, country: string) => {
    setLoadingGeoArticles(true);
    setGeoArticles([]);
    setGeoReport('');
    setSelectedCountry(country);
    setGeneratingGeoReport(true);
    try {
      const resp = await newsApi.getArticlesByCountry({ topic, country, startDate, endDate, language });
      setSelectedTopic(topic);
      const fetchedArticles = resp.data;
      setGeoArticles(fetchedArticles);
      setLoadingGeoArticles(false);

      // Auto-generate geographic insights
      if (fetchedArticles.length > 0) {
        try {
          const res = await reportApi.analyzeContext({
            context: 'geo',
            topic,
            country,
            articles: fetchedArticles.slice(0, MAX_ARTICLES_FOR_AI_ANALYSIS)
          });
          setGeoReport(res.summary);
        } catch (aiErr) {
          toast.error('Oops! Something went wrong. Please try again later.');
        }
      }
    } catch (e) {
      toast.error('Oops! Something went wrong. Please try again later.');
      setLoadingGeoArticles(false);
    } finally {
      setGeneratingGeoReport(false);
    }
  };

  const handleSentimentClick = async (topic: string, sentiment: 'positive' | 'neutral' | 'negative') => {
    setLoadingTimelineArticles(true);
    setArticles([]);
    setSelectedTopic(topic);

    try {
      // Fetch all articles for this topic in the date range
      const resp = await newsApi.searchArticles({ topic, start_date: startDate, end_date: endDate, language });

      // Filter by sentiment on the frontend
      const filtered = resp.data.filter((article) => {
        const s = article.sentiment || {};
        const pos = s.pos ?? 0;
        const neg = s.neg ?? 0;
        const neu = s.neu ?? 0;

        if (sentiment === 'positive') return pos >= neg && pos >= neu && pos > SENTIMENT_THRESHOLDS.SIGNIFICANCE;
        if (sentiment === 'negative') return neg >= pos && neg >= neu && neg > SENTIMENT_THRESHOLDS.SIGNIFICANCE;
        if (sentiment === 'neutral') return neu >= pos && neu >= neg;
        return false;
      });

      setArticles(filtered);
    } catch (e) {
      toast.error('Oops! Something went wrong. Please try again later.');
    } finally {
      setLoadingTimelineArticles(false);
    }
  };

  const generateReport = async (topic: string) => {
    setGeneratingReport(true);
    try {
      const res = await reportApi.generateReport({ topic, startDate, endDate, language, reportType: 'custom' });
      setReport(res.report);
    } catch (e) {
      toast.error('Oops! Something went wrong. Please try again later.');
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <TopicInput topic={topic} setTopic={setTopic} startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} language={language} setLanguage={setLanguage} onAnalyze={onAnalyze} loading={loading} />
          <a
            href="https://newsdatahub.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'color 0.2s',
              whiteSpace: 'nowrap',
              marginLeft: '16px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Powered by <strong style={{ color: 'var(--primary-dark)' }}>NewsDataHub API</strong>
          </a>
        </div>
      </div>

      {/* Main insights - Full Width */}
      <div className={`${styles.panel} ${styles.intelligencePanel}`}>
        <div className={styles.reportHeader}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexDirection: 'column'}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0 }}>AI-Powered News Brief</h3>
              <InfoTooltip text="AI-generated comprehensive analysis of the topic, synthesizing key developments, media tone, entities, and strategic insights." />
            </div>
            {report && (
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                Powered by NewsDataHub API | Period: {new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – {new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
          {report && data && (
            <ExportReportPDF
              report={report}
              articles={data.topArticles?.map(article => ({
                title: article.title,
                url: article.articleUrl,
                source: article.source
              }))}
              filename={`${data.topic.replace(/\s+/g, '-')}_News-Brief_${startDate}-to-${endDate}.pdf`}
              reportType="main"
              startDate={startDate}
              endDate={endDate}
              topic={data.topic}
            />
          )}
        </div>
        {loading && !data ? (
          <ProgressIndicator stage="fetching" onComplete={handleProgressComplete} />
        ) : generatingReport ? (
          <ProgressIndicator stage="generating" onComplete={handleProgressComplete} />
        ) : reportReady && !showReport ? (
          <ProgressIndicator stage="complete" onComplete={handleProgressComplete} />
        ) : report ? (
          <div>
            <IntelligenceReport
              report={report}
              containerId="report-container"
              reportType="main"
              startDate={startDate}
              endDate={endDate}
            />
            {data?.topArticles && data.topArticles.length > 0 && (
              <div className={styles.articleReferences}>
                <h4
                  onClick={() => setShowMainReferences(!showMainReferences)}
                  className={styles.collapsibleHeader}
                >
                  <span className={styles.collapseIcon}>{showMainReferences ? '▼' : '▶'}</span>
                  Referenced Articles ({data.topArticles.length})
                </h4>
                {showMainReferences && (
                  <div className={styles.referenceListContainer}>
                    <ul className={styles.referenceList}>
                      {data.topArticles.map((article, idx) => (
                        <li key={idx}>
                          <a href={article.articleUrl} target="_blank" rel="noopener noreferrer">
                            [{idx + 1}] {article.title}
                          </a>
                          <span className={styles.referenceSource}> - {article.source}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Brain size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
            <p>AI-powered news brief will appear here after analysis</p>
          </div>
        )}
      </div>

      {/* Sentiment and Political Leaning Charts */}
      <div className={styles.row}>
        <div className={styles.geoColumn}>
          <div className={`${styles.panel} ${styles.chartPanel}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: 'var(--primary-dark)' }}>Media Tone Distribution</h3>
              <InfoTooltip text="Shows the sentiment distribution across all analyzed articles: positive, neutral, and negative tones." />
            </div>
            {loading ? (
              <div className={styles.emptyState}>
                <div className="loading-spinner-dark"></div>
                <p>Analyzing sentiment...</p>
              </div>
            ) : !data ? (
              <div className={styles.emptyState}>
                <PieChart size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                <p>Sentiment analysis will appear here after you analyze a topic</p>
              </div>
            ) : (
              <SentimentDonutChart sentiment={data.sentimentAverage} />
            )}
          </div>
        </div>
        <div className={styles.geoColumn}>
          <div className={`${styles.panel} ${styles.chartPanel}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: 'var(--primary-dark)' }}>Source Ideological Distribution</h3>
              <InfoTooltip text="Distribution of articles by the political leaning of their sources, helping identify potential bias in coverage." />
            </div>
            {loading ? (
              <div className={styles.emptyState}>
                <div className="loading-spinner-dark"></div>
                <p>Analyzing source distribution...</p>
              </div>
            ) : !data ? (
              <div className={styles.emptyState}>
                <Newspaper size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                <p>Source distribution will appear here after you analyze a topic</p>
              </div>
            ) : (
              <PoliticalLeaningChart distribution={data.politicalLeaningDistribution} />
            )}
          </div>
        </div>
      </div>

      {/* Top Entities Mentioned Section */}
      <div className={`${styles.panel} ${styles.entitiesPanel}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '18px', fontWeight: 600 }}>Key Entities & Keywords</h3>
          <InfoTooltip text="AI-extracted organizations, people, locations, and frequently mentioned keywords from article content." />
        </div>
        {loading ? (
          <div className={styles.emptyState}>
            <div className="loading-spinner-dark"></div>
            <p>Extracting entities and keywords...</p>
          </div>
        ) : !data ? (
          <div className={styles.emptyState}>
            <Building2 size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
            <p>Entities and keywords will appear here after you analyze a topic</p>
          </div>
        ) : (
          <>
            <TopEntitiesSection entities={data.topEntities} totalArticles={data.totalMentions} />
            <TopKeywords keywords={data.topKeywords} />
          </>
        )}
      </div>

      {/* Coverage Timeline + Geographic Map side by side */}
      <div className={styles.row}>
        <div className={styles.geoColumn}>
          <div className={`${styles.panel} ${styles.chartPanel}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Coverage Over Time</h3>
              <InfoTooltip text="Timeline showing daily article volume. Click any point to see articles from that day and generate a detailed report." />
            </div>
            {loading ? (
              <div className={styles.emptyState}>
                <div className="loading-spinner-dark"></div>
                <p>Loading timeline data...</p>
              </div>
            ) : !data ? (
              <div className={styles.emptyState}>
                <TrendingUp size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                <p>Timeline chart will appear here after you analyze a topic</p>
              </div>
            ) : (
              <CoverageTimeline
                series={series}
                onPointClick={handleSpike}
                compact={false}
                disabled={loadingTimelineArticles || generatingTimelineReport}
              />
            )}
          </div>
            <div className={`${styles.panel} ${styles.intelligencePanel}`}>
              <div className={styles.reportHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0 }}>AI-Powered Timeline Insights</h3>
                    <InfoTooltip text="AI-generated analysis of articles from a specific date, explaining key events and developments." />
                  </div>
                  {timelineReport && selectedDate && (
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Powered by NewsDataHub API | Period: {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
                {timelineReport && data && selectedDate && (
                  <ExportReportPDF
                    report={timelineReport}
                    articles={articles.slice(0, 20).map(article => ({
                      title: article.title,
                      url: article.article_link,
                      source: article.source_title
                    }))}
                    filename={`${data.topic.replace(/\s+/g, '-')}_Timeline-Insights_${selectedDate}.pdf`}
                    reportType="timeline"
                    specificDate={selectedDate}
                  />
                )}
              </div>
              {loadingTimelineArticles ? (
                <div className={styles.emptyState}>
                  <div className="loading-spinner-dark"></div>
                  <p>Loading articles...</p>
                </div>
              ) : generatingTimelineReport ? (
                <div className={styles.emptyState}>
                  <div className="loading-spinner-dark"></div>
                  <p>Generating timeline intelligence...</p>
                </div>
              ) : timelineReport ? (
                <div className={styles.geoReportContent}>
                  <IntelligenceReport
                    report={timelineReport}
                    containerId="timeline-report-container"
                    reportType="timeline"
                    specificDate={selectedDate}
                  />
                  <div className={styles.articleReferences}>
                    <h4
                      onClick={() => setShowTimelineReferences(!showTimelineReferences)}
                      className={styles.collapsibleHeader}
                    >
                      <span className={styles.collapseIcon}>{showTimelineReferences ? '▼' : '▶'}</span>
                      Referenced Articles ({articles.slice(0, 20).length})
                    </h4>
                    {showTimelineReferences && articles.length > 0 && (
                      <div className={styles.referenceListContainer}>
                        <ul className={styles.referenceList}>
                          {articles.slice(0, 20).map((article, idx) => (
                            <li key={article.id}>
                              <a href={article.article_link} target="_blank" rel="noopener noreferrer">
                                [{idx + 1}] {article.title}
                              </a>
                              <span className={styles.referenceSource}> - {article.source_title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {articles.length === 0 && showTimelineReferences && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                        No articles available
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <BarChart3 size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                  <p>Click any point on the timeline to generate timeline insights</p>
                </div>
              )}
            </div>
          </div>
          <div className={styles.geoColumn}>
            <div className={`${styles.panel} ${styles.chartPanel}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: 'var(--primary-dark)' }}>Geographic Coverage</h3>
                <InfoTooltip text="Interactive map showing article distribution by country. Click on any marker to generate geographic intelligence." />
              </div>
              {loading ? (
                <div className={styles.emptyState}>
                  <div className="loading-spinner-dark"></div>
                  <p>Loading geographic data...</p>
                </div>
              ) : !data ? (
                <div className={styles.emptyState}>
                  <Globe size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                  <p>Geographic map will appear here after you analyze a topic</p>
                </div>
              ) : (
                <GeographicMap
                  topic={data.topic}
                  geography={Object.fromEntries(data.geographicDistribution.map((g) => [g.country, g.count]))}
                  onCountryClick={handleGeo}
                  disabled={loadingGeoArticles || generatingGeoReport}
                />
              )}
            </div>
            <div className={`${styles.panel} ${styles.intelligencePanel}`}>
              <div className={styles.reportHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: 'column'}}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0 }}>
                      {selectedCountry && geoReport
                        ? `AI-Powered Regional Insights - ${getCountryName(selectedCountry)}`
                        : 'AI-Powered Regional Insights'}
                    </h3>
                    <InfoTooltip text="AI-generated analysis of articles from a specific country, showing regional perspectives and developments." />
                  </div>
                  {geoReport && selectedCountry && (
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Powered by NewsDataHub API | Period: {new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – {new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
                {geoReport && data && selectedCountry && (
                  <ExportReportPDF
                    report={geoReport}
                    articles={geoArticles.slice(0, 20).map(article => ({
                      title: article.title,
                      url: article.article_link,
                      source: article.source_title
                    }))}
                    filename={`${data.topic.replace(/\s+/g, '-')}_Regional-Insights_${selectedCountry}_${startDate}-to-${endDate}.pdf`}
                    reportType="geographic"
                    startDate={startDate}
                    endDate={endDate}
                    countryCode={selectedCountry}
                  />
                )}
              </div>
              {loadingGeoArticles ? (
                <div className={styles.emptyState}>
                  <div className="loading-spinner-dark"></div>
                  <p>Loading articles...</p>
                </div>
              ) : generatingGeoReport ? (
                <div className={styles.emptyState}>
                  <div className="loading-spinner-dark"></div>
                  <p>Generating AI-Powered Regional Insights...</p>
                </div>
              ) : geoReport ? (
                <div className={styles.geoReportContent}>
                  <IntelligenceReport
                    report={geoReport}
                    containerId="geo-report-container"
                    reportType="geographic"
                    startDate={startDate}
                    endDate={endDate}
                  />
                  <div className={styles.articleReferences}>
                    <h4
                      onClick={() => setShowGeoReferences(!showGeoReferences)}
                      className={styles.collapsibleHeader}
                    >
                      <span className={styles.collapseIcon}>{showGeoReferences ? '▼' : '▶'}</span>
                      Referenced Articles ({geoArticles.slice(0, 20).length})
                    </h4>
                    {showGeoReferences && geoArticles.length > 0 && (
                      <div className={styles.referenceListContainer}>
                        <ul className={styles.referenceList}>
                          {geoArticles.slice(0, 20).map((article, idx) => (
                            <li key={article.id}>
                              <a href={article.article_link} target="_blank" rel="noopener noreferrer">
                                [{idx + 1}] {article.title}
                              </a>
                              <span className={styles.referenceSource}> - {article.source_title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {geoArticles.length === 0 && showGeoReferences && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                        No articles available
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <MapPin size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                  <p>Click a country on the map to generate regional insights</p>
                </div>
              )}
            </div>
          </div>
        </div>
      {/* Footer */}
      <footer style={{
        marginTop: '48px',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: '1.6'
      }}>
        <p>
          Powered by <a href="https://newsdatahub.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>NewsDataHub API</a>
        </p>
        <p style={{ marginTop: '8px' }}>
          AI-generated content for demonstration and research purposes only. Not financial or professional advice.
        </p>
      </footer>
      </div>
  );
};

export default AnalysisDashboard;
