"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

const CHART_COLORS = ["#22d3ee", "#fbbf24", "#34d399", "#f87171", "#a78bfa"];

type ChartSpec = {
  chartType: "bar" | "line" | "pie";
  title?: string;
  labels: string[];
  datasets: { label: string; values: number[] }[];
};

function buildBarLineData(spec: ChartSpec) {
  const { labels, datasets } = spec;
  return labels.map((name, i) => {
    const point: Record<string, string | number> = { name };
    datasets.forEach((ds) => {
      point[ds.label] = ds.values[i] ?? 0;
    });
    return point;
  });
}

function buildPieData(spec: ChartSpec) {
  const { labels, datasets } = spec;
  const ds = datasets[0];
  if (!ds) return [];
  return labels.map((name, i) => ({ name, value: ds.values[i] ?? 0 })).filter((d) => d.value > 0);
}

export default function ChartWidget({ spec }: { spec: ChartSpec }) {
  const { chartType, title } = spec;
  const hasData = spec.labels.length > 0 && spec.datasets.some((d) => d.values.length > 0);
  if (!hasData) return null;

  const barLineData = (chartType === "bar" || chartType === "line") ? buildBarLineData(spec) : [];
  const pieData = chartType === "pie" ? buildPieData(spec) : [];
  const keys = spec.datasets.map((d) => d.label);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
      {title && (
        <div className="border-b border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200">
          {title}
        </div>
      )}
      <div className="p-4 min-h-[240px]">
        {chartType === "bar" && (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barLineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} stroke="#52525b" />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} stroke="#52525b" />
              <Tooltip
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                labelStyle={{ color: "#e4e4e7" }}
              />
              <Legend />
              {keys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
        {chartType === "line" && (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={barLineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} stroke="#52525b" />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} stroke="#52525b" />
              <Tooltip
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                labelStyle={{ color: "#e4e4e7" }}
              />
              <Legend />
              {keys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS[i % CHART_COLORS.length], r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
        {chartType === "pie" && pieData.length > 0 && (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: "#71717a" }}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                formatter={(value: number) => [value, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
