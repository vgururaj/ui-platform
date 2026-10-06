import * as React from 'react';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '../lib/utils';

const DEFAULT_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(var(--muted-foreground))',
];

export interface ChartDatum {
  name: string;
  value: number;
  [key: string]: string | number;
}

/** Avoid Recharts ResponsiveContainer errors when width is 0 (common on mobile layout transitions). */
function useContainerWidth<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.getBoundingClientRect().width);
    update();
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 0;
      setWidth(next);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

export interface PieChartProps {
  data: ChartDatum[];
  className?: string;
  colors?: string[];
  dataKey?: string;
  nameKey?: string;
  height?: number;
}

export function PieChart({
  data,
  className,
  colors = DEFAULT_COLORS,
  dataKey = 'value',
  nameKey = 'name',
  height = 280,
}: PieChartProps) {
  const { ref, width } = useContainerWidth<HTMLDivElement>();

  return (
    <div ref={ref} className={cn('w-full min-w-0', className)} style={{ height }}>
      {width > 0 ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <RechartsPieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius="80%"
              label
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}

export interface BarChartProps {
  data: ChartDatum[];
  className?: string;
  colors?: string[];
  dataKey?: string;
  categoryKey?: string;
  height?: number;
}

export function BarChart({
  data,
  className,
  colors = DEFAULT_COLORS,
  dataKey = 'value',
  categoryKey = 'name',
  height = 280,
}: BarChartProps) {
  const { ref, width } = useContainerWidth<HTMLDivElement>();

  return (
    <div ref={ref} className={cn('w-full min-w-0', className)} style={{ height }}>
      {width > 0 ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <RechartsBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={categoryKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} width={36} />
            <Tooltip />
            <Legend />
            <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
