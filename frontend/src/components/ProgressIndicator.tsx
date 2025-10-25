import React, { useState, useEffect } from 'react';
import styles from './ProgressIndicator.module.css';

type Props = {
  stage: 'fetching' | 'generating' | 'complete';
  onComplete?: () => void;
};

const statusMessages = [
  'Getting news articles...',
  'Analyzing articles...',
  'Extracting insights...',
  'Generating news brief...'
];

const ProgressIndicator: React.FC<Props> = ({ stage, onComplete }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Rotate status messages every 2.5 seconds, but only once through the array
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        const next = prev + 1;
        // Stop at last message, don't loop
        if (next >= statusMessages.length) {
          clearInterval(interval);
          return statusMessages.length - 1;
        }
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Simulate progress based on stage with variable speeds
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    if (stage === 'fetching') {
      // Reset to 0 and progress to 60% over ~15 seconds with variable speed
      setProgress(0);

      // Define ranges with different speeds: [start, end, duration in ms]
      const ranges = [
        [0, 5, 3000 + Math.random() * 1000],     // 0-5: 3-4 seconds (slow)
        [5, 26, 4000 + Math.random() * 2000],    // 5-26: 4-6 seconds (medium)
        [26, 60, 6000 + Math.random() * 2000],   // 26-60: 6-8 seconds (slow)
      ];

      let currentRangeIndex = 0;

      const progressThroughRanges = () => {
        if (currentRangeIndex >= ranges.length) return;

        const [start, end, duration] = ranges[currentRangeIndex];
        const steps = end - start;
        const intervalTime = duration / steps;

        const timer = setInterval(() => {
          setProgress((prev) => {
            const next = prev + 1;
            if (next >= end) {
              clearInterval(timer);
              currentRangeIndex += 1;
              if (currentRangeIndex < ranges.length) {
                progressThroughRanges();
              }
              return end;
            }
            return next;
          });
        }, intervalTime);

        timers.push(timer);
      };

      progressThroughRanges();

      return () => timers.forEach(t => clearInterval(t));
    } else if (stage === 'generating') {
      // Continue from 60% to 95% over ~10 seconds with variable speed
      setProgress(60);

      const ranges = [
        [60, 65, 2500 + Math.random() * 1000],   // 60-65: 2.5-3.5 seconds (slower)
        [65, 85, 4000 + Math.random() * 2000],   // 65-85: 4-6 seconds (faster)
        [85, 95, 3000 + Math.random() * 1000],   // 85-95: 3-4 seconds (medium)
      ];

      let currentRangeIndex = 0;

      const progressThroughRanges = () => {
        if (currentRangeIndex >= ranges.length) return;

        const [start, end, duration] = ranges[currentRangeIndex];
        const steps = end - start;
        const intervalTime = duration / steps;

        const timer = setInterval(() => {
          setProgress((prev) => {
            const next = prev + 1;
            if (next >= end) {
              clearInterval(timer);
              currentRangeIndex += 1;
              if (currentRangeIndex < ranges.length) {
                progressThroughRanges();
              }
              return end;
            }
            return next;
          });
        }, intervalTime);

        timers.push(timer);
      };

      progressThroughRanges();

      return () => timers.forEach(t => clearInterval(t));
    } else if (stage === 'complete') {
      // Fast-forward to 100%
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            // Call onComplete after reaching 100%
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 200);
            return 100;
          }
          return prev + 2; // Faster increment
        });
      }, 20);

      timers.push(timer);
      return () => timers.forEach(t => clearInterval(t));
    }

    return () => {};
  }, [stage, onComplete]);

  // Ensure progress is clamped between 0 and 100
  const displayProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={styles.container}>
      <h2 className={styles.percentage}>{displayProgress}%</h2>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: `${displayProgress}%`,
            backgroundColor: displayProgress > 0 ? '#fc7753' : 'transparent'
          }}
        />
      </div>
      <p className={styles.statusText}>{statusMessages[messageIndex]}</p>
    </div>
  );
};

export default ProgressIndicator;
