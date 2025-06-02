import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';

const COLORS = [
  'rgba(0, 123, 255, 0.8)',  // Blue
  'rgba(0, 98, 204, 0.8)',   // Darker Blue
  'rgba(51, 154, 240, 0.8)', // Light Blue
  'rgba(0, 71, 171, 0.8)',   // Navy Blue
  'rgba(102, 178, 255, 0.8)', // Sky Blue
  'rgba(0, 51, 102, 0.8)',   // Deep Blue
  'rgba(153, 204, 255, 0.8)', // Pale Blue
  'rgba(0, 82, 165, 0.8)',   // Royal Blue
  'rgba(204, 229, 255, 0.8)', // Ice Blue
  'rgba(0, 41, 82, 0.8)',    // Midnight Blue
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-blue-100">
        <p className="text-blue-900 font-medium">{payload[0].name}</p>
        <p className="text-blue-700">{`Value: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  if (percent < 0.03) return null; // Skip tiny labels

  const RADIAN = Math.PI / 180;
  const pieX = cx + (outerRadius + 3) * Math.cos(-midAngle * RADIAN);
  const pieY = cy + (outerRadius + 3) * Math.sin(-midAngle * RADIAN);
  const radius = outerRadius + (window.innerWidth < 640 ? 20 : window.innerWidth < 1024 ? 40 : 50);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Calculate two control points very close to the midpoint for a nearly straight line
  const midX = (pieX + x) / 2;
  const midY = (pieY + y) / 2;
  const tinyCurve = 4; // Small offset for a very slight curve
  const controlX1 = midX + tinyCurve * Math.cos(-midAngle * RADIAN + Math.PI/2);
  const controlY1 = midY + tinyCurve * Math.sin(-midAngle * RADIAN + Math.PI/2);
  const controlX2 = midX - tinyCurve * Math.cos(-midAngle * RADIAN + Math.PI/2);
  const controlY2 = midY - tinyCurve * Math.sin(-midAngle * RADIAN + Math.PI/2);

  return (
    <g>
      <path
        d={`M${pieX},${pieY} C${controlX1},${controlY1} ${controlX2},${controlY2} ${x},${y}`}
        stroke={COLORS[index % COLORS.length]}
        strokeWidth={1.5}
        fill="none"
        className="transition-all duration-300"
        style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1))' }}
      />
      <circle
        cx={x}
        cy={y}
        r={2.5}
        fill={COLORS[index % COLORS.length]}
        style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1))' }}
      />
      <text
        x={x + (x > cx ? 4 : -4)}
        y={y}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-[10px] sm:text-xs font-medium fill-blue-900"
        style={{ filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.1))' }}
      >
        {name}
      </text>
    </g>
  );
};

export default function PieChart({ data }) {
  const [outerRadius, setOuterRadius] = useState(160);
  const [innerRadius, setInnerRadius] = useState(80);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) { // sm breakpoint
        setOuterRadius(60);
        setInnerRadius(30);
      } else if (window.innerWidth < 1024) { // lg breakpoint
        setOuterRadius(120);
        setInnerRadius(60);
      } else {
        setOuterRadius(160);
        setInnerRadius(80);
      }
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const safeData = Array.isArray(data)
    ? data
    : data && typeof data === 'object'
    ? Object.entries(data).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="w-full h-[600px] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-white/50 rounded-2xl backdrop-blur-sm" />
      <ResponsiveContainer>
        <RechartsPieChart>
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
            </filter>
          </defs>
          <Pie
            data={safeData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
            filter="url(#shadow)"
            label={renderCustomizedLabel}
            labelLine={false}
          >
            {safeData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                className="transition-transform duration-300 ease-out"
                style={{
                  filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))',
                  transform: 'translateZ(20px)',
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateZ(20px) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateZ(20px) scale(1)';
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
