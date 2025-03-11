import { motion } from 'framer-motion'
import type { HistogramResult } from '../utils/statsUtils'

interface StatsProps {
  stats: HistogramResult;
  formula: string;
}

// Color interpolation function
const getColor = (frequency: number, isThreshold: boolean, stats: HistogramResult) => {
  // Get max frequency for normalization
  const maxFreq = isThreshold
    ? Math.max(...Array.from(stats.thresholdStats!.successProbabilities.values()))
    : Math.max(...Array.from(stats.frequencies.values()));
  const normalizedValue = frequency / maxFreq;
  
  if (normalizedValue < 0.2) {
    const hue = 120;
    const saturation = 70;
    const lightness = 45 + (normalizedValue * 5);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  } else if (normalizedValue < 0.4) {
    const hue = 120 - ((normalizedValue - 0.2) * 5 * 60);
    return `hsl(${hue}, 70%, 50%)`;
  } else if (normalizedValue < 0.6) {
    const hue = 60 - ((normalizedValue - 0.4) * 5 * 30);
    return `hsl(${hue}, 70%, 50%)`;
  } else if (normalizedValue < 0.8) {
    const hue = 30 - ((normalizedValue - 0.6) * 5 * 15);
    return `hsl(${hue}, 70%, 50%)`;
  } else {
    const hue = 15 - ((normalizedValue - 0.8) * 5 * 15);
    const saturation = 70 + ((normalizedValue - 0.8) * 5 * 10);
    return `hsl(${hue}, ${saturation}%, 50%)`;
  }
};

export function Stats({ stats, formula }: StatsProps) {
  if (stats.isThresholdRoll) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-700 rounded-lg p-4 mb-6"
      >
        <h2 className="text-xl font-bold mb-2">Statistical Analysis</h2>
        <div className="text-slate-300 mb-1">Formula: {formula}</div>
        <div className="text-slate-400 text-sm mb-4">Based on {stats.totalRolls.toLocaleString()} iterations</div>

        <div className="space-y-2 mb-6">
          <div>
            <span className="text-slate-400">Average Successes:</span> {stats.thresholdStats!.averageSuccesses.toFixed(2)}
          </div>
          <div>
            <span className="text-slate-400">Probability of Any Success:</span> {(stats.thresholdStats!.probabilityOfAtLeastOne * 100).toFixed(1)}%
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-bold mb-2">Success Distribution</h3>
          <div className="h-40 flex items-end gap-1 relative">
            {Array.from(stats.thresholdStats!.successProbabilities.entries()).map(([successes, probability], _index, _array) => {
              // Scale the height relative to the maximum probability
              const maxProb = Math.max(...Array.from(stats.thresholdStats!.successProbabilities.values()));
              const height = (probability / maxProb) * 100;
              const backgroundColor = getColor(probability, true, stats);
              
              return (
                <div
                  key={successes}
                  className="relative group flex-1 transition-colors"
                  style={{ 
                    height: `${height}%`,
                    backgroundColor,
                  }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-2 py-1 rounded text-xs whitespace-nowrap">
                    {successes} successes: {(probability * 100).toFixed(1)}%
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs text-slate-400">
                    {successes}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="h-6" /> {/* Spacing for labels */}
        </div>
      </motion.div>
    );
  }

  // Original stats display for non-threshold rolls
  const maxFrequency = Math.max(...Array.from(stats.frequencies.values()));
  //const minFrequency = Math.min(...Array.from(stats.frequencies.values()));
  
  const getHeight = (frequency: number) => {
    return (frequency / maxFrequency) * 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-700 rounded-lg p-4 mb-6"
    >
      <h2 className="text-xl font-bold mb-2">Statistical Analysis</h2>
      <div className="text-slate-300 mb-1">Formula: {formula}</div>
      <div className="text-slate-400 text-sm mb-4">Based on {stats.totalRolls.toLocaleString()} iterations</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <div>
            <span className="text-slate-400">Mean:</span> {stats.mean.toFixed(2)}
          </div>
          <div>
            <span className="text-slate-400">Standard Deviation:</span> {stats.standardDeviation.toFixed(2)}
          </div>
          <div>
            <span className="text-slate-400">Range:</span> {stats.min} to {stats.max}
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <span className="text-slate-400">Median (P50):</span> {stats.percentiles.p50}
          </div>
          <div>
            <span className="text-slate-400">25th-75th Percentile:</span> {stats.percentiles.p25}-{stats.percentiles.p75}
          </div>
          <div>
            <span className="text-slate-400">90th/95th/99th:</span> {stats.percentiles.p90}/{stats.percentiles.p95}/{stats.percentiles.p99}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">Distribution</h3>
        <div className="h-40 flex items-end gap-1 relative">
          {Array.from(stats.frequencies.entries()).map(([value, frequency], index, array) => {
            const height = getHeight(frequency);
            const backgroundColor = getColor(frequency, false, stats);
            const isKeyPoint = (
              index === 0 || // leftmost
              index === Math.floor(array.length / 2) || // middle
              index === array.length - 1 // rightmost
            );
            
            return (
              <div
                key={value}
                className="relative group flex-1 transition-colors"
                style={{ 
                  height: `${height}%`,
                  backgroundColor,
                }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-2 py-1 rounded text-xs whitespace-nowrap">
                  {value}: {frequency} ({(frequency/stats.totalRolls * 100).toFixed(1)}%)
                </div>
                {isKeyPoint && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs text-slate-400">
                    {value}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="h-6" /> {/* Spacing for labels */}
      </div>
    </motion.div>
  );
} 