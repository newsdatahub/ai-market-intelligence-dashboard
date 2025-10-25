import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Link } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { getCountryName } from '../constants/countries';
import { formatDateRange } from '../utils/helpers';

interface Article {
  title: string;
  url: string;
  source: string;
}

type Props = {
  report: string;
  articles?: Article[];
  filename?: string;
  reportType?: 'main' | 'timeline' | 'geographic';
  startDate?: string;
  endDate?: string;
  specificDate?: string;
  countryCode?: string;
  topic?: string;
};

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.6,
  },
  h1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
    color: '#2c3e50',
    borderBottomWidth: 2,
    borderBottomColor: '#fc7753',
    paddingBottom: 8,
  },
  h2: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 16,
    color: '#2c3e50',
  },
  h3: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
    color: '#2c3e50',
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  listItem: {
    marginBottom: 6,
    marginLeft: 20,
    flexDirection: 'row',
  },
  bullet: {
    width: 15,
  },
  listContent: {
    flex: 1,
  },
  strong: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  link: {
    color: '#fc7753',
    textDecoration: 'underline',
  },
  referencesSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e2e2e2',
  },
  referencesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  referenceItem: {
    marginBottom: 8,
    fontSize: 10,
    flexDirection: 'row',
  },
  referenceNumber: {
    width: 30,
    color: '#5a6c7d',
  },
  referenceContent: {
    flex: 1,
  },
  referenceTitle: {
    color: '#2c3e50',
    marginBottom: 2,
  },
  referenceLink: {
    color: '#fc7753',
    textDecoration: 'none',
    marginBottom: 2,
  },
  referenceSource: {
    color: '#5a6c7d',
    fontSize: 9,
    fontStyle: 'italic',
  },
  referenceUrl: {
    color: '#7f7f7f',
    fontSize: 8,
    marginTop: 2,
    fontStyle: 'italic',
  },
  hr: {
    borderBottomWidth: 2,
    borderBottomColor: '#fc7753',
    marginTop: 12,
    marginBottom: 12,
  },
});

/**
 * Markdown element types for PDF rendering
 */
type MarkdownElement =
  | { type: 'h1'; content: string }
  | { type: 'h2'; content: string }
  | { type: 'h3'; content: string }
  | { type: 'paragraph'; content: string }
  | { type: 'list'; items: string[] }
  | { type: 'hr' };

// Parse markdown into structured data
function parseMarkdown(markdown: string): MarkdownElement[] {
  const lines = markdown.split('\n');
  const elements: MarkdownElement[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push({ type: 'list', items: [...currentList] });
      currentList = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList();
      elements.push({ type: 'hr' });
    }
    // Headers
    else if (trimmed.startsWith('### ')) {
      flushList();
      elements.push({ type: 'h3', content: trimmed.substring(4) });
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push({ type: 'h2', content: trimmed.substring(3) });
    } else if (trimmed.startsWith('# ')) {
      flushList();
      elements.push({ type: 'h1', content: trimmed.substring(2) });
    }
    // List items
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentList.push(trimmed.substring(2));
    }
    // Paragraphs
    else if (trimmed.length > 0) {
      flushList();
      elements.push({ type: 'paragraph', content: trimmed });
    }
  });

  flushList();
  return elements;
}

// Clean markdown syntax from text (bold, italic, links)
function cleanMarkdownText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
    .replace(/\*(.+?)\*/g, '$1') // Italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1'); // Links - just show link text
}

// PDF Document component
const PDFDocument: React.FC<{
  report: string;
  articles?: Article[];
  reportType?: 'main' | 'timeline' | 'geographic';
  startDate?: string;
  endDate?: string;
  specificDate?: string;
  countryCode?: string;
  topic?: string;
}> = ({ report, articles, reportType = 'main', startDate, endDate, specificDate, countryCode, topic }) => {
  const disclaimer = `

**Disclaimer:**
This report was generated using data from the NewsDataHub API (https://newsdatahub.com). © 2025 NewsDataHub — All rights reserved. The analysis and summaries are AI-derived and intended for informational and research purposes only. Results may include inaccuracies or incomplete data, especially for topics with limited coverage. This report does not constitute financial, legal, or professional advice.`;

  const dateRange = formatDateRange(startDate, endDate, specificDate);

  let header = '';
  if (reportType === 'main') {
    const title = topic ? `AI-Powered News Brief - ${topic}` : 'AI-Powered News Brief';
    header = `## ${title}\n### Powered by NewsDataHub API | Period: ${dateRange}\n\n---\n\n`;
  } else if (reportType === 'timeline') {
    header = `## AI-Powered Timeline Insights\n### Powered by NewsDataHub API | Period: ${dateRange}\n\n---\n\n`;
  } else if (reportType === 'geographic') {
    const countryName = countryCode ? getCountryName(countryCode) : '';
    const title = countryName ? `AI-Powered Regional Insights - ${countryName}` : 'AI-Powered Regional Insights';
    header = `## ${title}\n### Powered by NewsDataHub API | Period: ${dateRange}\n\n---\n\n`;
  }

  const reportWithDisclaimer = header + report + disclaimer;
  const elements = parseMarkdown(reportWithDisclaimer);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {elements.map((element, index) => {
          switch (element.type) {
            case 'h1':
              return (
                <Text key={index} style={styles.h1}>
                  {cleanMarkdownText(element.content)}
                </Text>
              );
            case 'h2':
              return (
                <Text key={index} style={styles.h2}>
                  {cleanMarkdownText(element.content)}
                </Text>
              );
            case 'h3':
              return (
                <Text key={index} style={styles.h3}>
                  {cleanMarkdownText(element.content)}
                </Text>
              );
            case 'paragraph':
              return (
                <Text key={index} style={styles.paragraph}>
                  {cleanMarkdownText(element.content)}
                </Text>
              );
            case 'list':
              return (
                <View key={index}>
                  {element.items.map((item: string, i: number) => (
                    <View key={i} style={styles.listItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.listContent}>{cleanMarkdownText(item)}</Text>
                    </View>
                  ))}
                </View>
              );
            case 'hr':
              return <View key={index} style={styles.hr} />;
            default:
              return null;
          }
        })}

        {/* Referenced Articles Section */}
        {articles && articles.length > 0 && (
          <View style={styles.referencesSection}>
            <Text style={styles.referencesTitle}>Referenced Articles ({articles.length})</Text>
            {articles.map((article, idx) => (
              <View key={idx} style={styles.referenceItem}>
                <Text style={styles.referenceNumber}>[{idx + 1}]</Text>
                <View style={styles.referenceContent}>
                  <Link src={article.url} style={styles.referenceLink}>
                    <Text style={styles.referenceTitle}>{article.title}</Text>
                  </Link>
                  <Text style={styles.referenceSource}>{article.source}</Text>
                  <Text style={styles.referenceUrl}>{article.url}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

const ExportReportPDF: React.FC<Props> = ({
  report,
  articles,
  filename = 'intelligence-report.pdf',
  reportType = 'main',
  startDate,
  endDate,
  specificDate,
  countryCode,
  topic
}) => {
  const handleExport = async () => {
    try {
      const blob = await pdf(
        <PDFDocument
          report={report}
          articles={articles}
          reportType={reportType}
          startDate={startDate}
          endDate={endDate}
          specificDate={specificDate}
          countryCode={countryCode}
          topic={topic}
        />
      ).toBlob();
      saveAs(blob, filename);
    } catch (error) {
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <button className="btn-secondary btn-small" onClick={handleExport}>
      📄 Export PDF
    </button>
  );
};

export default ExportReportPDF;
