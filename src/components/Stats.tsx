import { motion } from 'framer-motion'
import type { HistogramResult } from '../utils/diceParser'

interface StatsProps {
  stats: HistogramResult;
  formula: string;
}

export function Stats({ stats, formula }: StatsProps) {
  const maxFrequency = Math.max(...Array.from(stats.frequencies.values()));
  const minFrequency = Math.min(...Array.from(stats.frequencies.values()));
  
  const getHeight = (frequency: number) => {
    return (frequency / maxFrequency) * 100;
  };

  // Color interpolation function
  const getColor = (frequency: number) => {
    const normalizedValue = (frequency - minFrequency) / (maxFrequency - minFrequency);
    
    // Create a smoother gradient using multiple color stops
    if (normalizedValue < 0.2) {
      // Green (low frequency) to yellow-green
      const hue = 120;
      const saturation = 70;
      const lightness = 45 + (normalizedValue * 5);
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    } else if (normalizedValue < 0.4) {
      // Yellow-green to yellow
      const hue = 120 - ((normalizedValue - 0.2) * 5 * 60);
      return `hsl(${hue}, 70%, 50%)`;
    } else if (normalizedValue < 0.6) {
      // Yellow to orange
      const hue = 60 - ((normalizedValue - 0.4) * 5 * 30);
      return `hsl(${hue}, 70%, 50%)`;
    } else if (normalizedValue < 0.8) {
      // Orange to red-orange
      const hue = 30 - ((normalizedValue - 0.6) * 5 * 15);
      return `hsl(${hue}, 70%, 50%)`;
    } else {
      // Red-orange to red (high frequency)
      const hue = 15 - ((normalizedValue - 0.8) * 5 * 15);
      const saturation = 70 + ((normalizedValue - 0.8) * 5 * 10);
      return `hsl(${hue}, ${saturation}%, 50%)`;
    }
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
        <div className="h-40 flex items-end gap-1">
          {Array.from(stats.frequencies.entries()).map(([value, frequency]) => {
            const height = getHeight(frequency);
            const backgroundColor = getColor(frequency);
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
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
} 