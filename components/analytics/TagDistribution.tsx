import type { TagCount } from '@/lib/types';

interface TagDistributionProps {
  data: TagCount[];
  totalTasks: number;
}

/**
 * Map of tag colors to their hex values
 * Used only for SVG rendering (which doesn't support CSS variables)
 * Fallback uses primary color (#8b5cf6)
 */
const TAG_COLOR_HEX: Record<string, string> = {
  red: '#ef4444', orange: '#f97316', amber: '#f59e0b',
  yellow: '#eab308', lime: '#84cc16', green: '#22c55e',
  emerald: '#10b981', teal: '#14b8a6', cyan: '#06b6d4',
  sky: '#0ea5e9', blue: '#3b82f6', indigo: '#6366f1',
  violet: '#8b5cf6', purple: '#a855f7', fuchsia: '#d946ef',
  pink: '#ec4899', rose: '#f43f5e',
};

const DEFAULT_COLOR = '#8b5cf6'; // Primary violet fallback

export function TagDistribution({ data, totalTasks }: TagDistributionProps) {
  const radius = 55;
  const circumference = 2 * Math.PI * radius;

  const segments = data.reduce<Array<TagCount & { segmentLength: number; offset: number }>>((acc, tag) => {
    const prevOffset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].segmentLength : 0;
    const segmentLength = totalTasks > 0 ? (tag.count / totalTasks) * circumference : 0;
    acc.push({ ...tag, segmentLength, offset: prevOffset });
    return acc;
  }, []);

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-secondary rounded-[24px] p-6 flex flex-col gap-5 flex-1">
      <h3 className="text-lg font-bold font-heading text-foreground">Distribución por Etiquetas</h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut Chart */}
        <div className="relative shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Background circle */}
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              className="stroke-border"
              strokeWidth="14"
            />
            {/* Segments */}
            {segments.map((seg) => (
              <circle
                key={seg.tagId}
                cx="70" cy="70" r={radius}
                fill="none"
                stroke={TAG_COLOR_HEX[seg.tagColor] || DEFAULT_COLOR}
                strokeWidth="14"
                strokeDasharray={`${seg.segmentLength} ${circumference - seg.segmentLength}`}
                strokeDashoffset={-seg.offset}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
              />
            ))}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{totalTasks}</span>
            <span className="text-xs text-muted-foreground">tareas</span>
          </div>
        </div>

        {/* Tag List */}
        <div className="flex flex-col gap-3 flex-1 w-full">
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sin etiquetas</p>
          ) : (
            data.map((tag) => (
              <div key={tag.tagId} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-[5px]"
                      style={{ backgroundColor: TAG_COLOR_HEX[tag.tagColor] || DEFAULT_COLOR }}
                    />
                    <span className="text-[13px] font-semibold text-foreground">{tag.tagName}</span>
                  </div>
                  <span className="text-[13px] text-muted-foreground">{tag.count}</span>
                </div>
                <div className="h-1.5 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(tag.count / maxCount) * 100}%`,
                      backgroundColor: TAG_COLOR_HEX[tag.tagColor] || DEFAULT_COLOR,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
