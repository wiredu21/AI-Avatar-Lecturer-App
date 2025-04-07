import React from 'react';

// Bar Chart Component
export const BarChart = ({ data, index, categories, colors, valueFormatter, height }) => {
  const maxValue = Math.max(...data.map(item => item.value)) * 1.2;

  return (
    <div style={{ height: `${height}px` }} className="w-full">
      <div className="flex items-end h-full space-x-2">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div className="relative w-full flex-1 flex flex-col-reverse">
              <div 
                className="absolute bottom-0 w-full rounded-t bg-teal-500"
                style={{ 
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: colors[0]
                }}
              ></div>
            </div>
            <div className="text-xs mt-1 font-medium text-center">{item.name}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[0] }}></div>
          <span className="text-xs">{categories[0]}</span>
        </div>
      </div>
    </div>
  );
};

// Line Chart Component
export const LineChart = ({ data, index, categories, colors, valueFormatter, height }) => {
  const maxValue = Math.max(...data.map(item => item.count)) * 1.2;
  
  // Calculate points for the SVG path
  const points = data.map((item, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((item.count / maxValue) * 100);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ height: `${height}px` }} className="w-full">
      <div className="relative h-full w-full">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={colors[0]}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Points */}
          {data.map((item, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((item.count / maxValue) * 100);
            return (
              <circle 
                key={i}
                cx={x}
                cy={y}
                r="1.5"
                fill="white"
                stroke={colors[0]}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 w-full flex justify-between">
          {data.map((item, i) => (
            <div key={i} className="text-xs text-center" style={{ width: `${100 / data.length}%` }}>
              {item.date}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end mt-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[0] }}></div>
          <span className="text-xs">{categories[0]}</span>
        </div>
      </div>
    </div>
  );
};

// Pie Chart Component
export const PieChart = ({ data, index, categories, colors, valueFormatter, height }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate angles for each slice
  let startAngle = 0;
  const slices = data.map((item, i) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const slice = {
      name: item.name,
      value: item.value,
      percentage,
      startAngle,
      endAngle: startAngle + angle,
      color: colors[i % colors.length]
    };
    startAngle += angle;
    return slice;
  });

  return (
    <div style={{ height: `${height}px` }} className="w-full flex justify-center items-center">
      <div className="relative" style={{ width: '150px', height: '150px' }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          {slices.map((slice, i) => {
            // Convert angles to radians for calculation
            const startRad = (slice.startAngle - 90) * (Math.PI / 180);
            const endRad = (slice.endAngle - 90) * (Math.PI / 180);
            
            // Calculate path
            const x1 = 50 + 50 * Math.cos(startRad);
            const y1 = 50 + 50 * Math.sin(startRad);
            const x2 = 50 + 50 * Math.cos(endRad);
            const y2 = 50 + 50 * Math.sin(endRad);
            
            // Determine large arc flag
            const largeArcFlag = slice.endAngle - slice.startAngle <= 180 ? "0" : "1";
            
            const d = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            return (
              <path 
                key={i} 
                d={d} 
                fill={slice.color} 
                stroke="white" 
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </div>
      
      <div className="ml-4 space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[i % colors.length] }}></div>
            <span className="text-xs">{item.name} ({item.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}; 