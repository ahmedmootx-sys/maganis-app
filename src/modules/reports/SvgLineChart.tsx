interface DataPoint {
  label: string
  value: number
}

interface SvgLineChartProps {
  data: DataPoint[]
  width?: number
  height?: number
  color?: string
}

export function SvgLineChart({
  data,
  width = 400,
  height = 200,
  color = '#0284c7',
}: SvgLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p className="muted">لا توجد بيانات لعرضها</p>
      </div>
    )
  }

  const padding = { top: 20, right: 10, bottom: 50, left: 50 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const values = data.map((d) => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range = maxVal - minVal || 1
  const yMin = Math.floor(minVal - range * 0.1)
  const yMax = Math.ceil(maxVal + range * 0.1)
  const yRange = yMax - yMin || 1

  const yTicks = 5
  const yTickValues: number[] = []
  for (let i = 0; i <= yTicks; i++) {
    yTickValues.push(Math.round(yMin + (yRange * i) / yTicks))
  }

  const points = data.map((d, i) => {
    const x =
      padding.left +
      (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2)
    const y = padding.top + chartH - ((d.value - yMin) / yRange) * chartH
    return { x, y }
  })

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="svg-chart"
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {/* Y-axis */}
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={padding.top + chartH}
        stroke="#e2e8f0"
      />
      {/* X-axis */}
      <line
        x1={padding.left}
        y1={padding.top + chartH}
        x2={padding.left + chartW}
        y2={padding.top + chartH}
        stroke="#e2e8f0"
      />

      {/* Y ticks */}
      {yTickValues.map((v) => {
        const y = padding.top + chartH - ((v - yMin) / yRange) * chartH
        return (
          <g key={v}>
            <line
              x1={padding.left}
              y1={y}
              x2={padding.left + chartW}
              y2={y}
              stroke="#f1f5f9"
            />
            <text
              x={padding.left - 5}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#64748b"
            >
              {v}
            </text>
          </g>
        )
      })}

      {/* X labels */}
      {data.map((d, i) => {
        const x = points[i].x
        // Show every nth label to avoid overlap
        const step = Math.max(1, Math.floor(data.length / 6))
        const show = i % step === 0 || i === data.length - 1
        return show ? (
          <text
            key={d.label}
            x={x}
            y={padding.top + chartH + 16}
            textAnchor="middle"
            fontSize="9"
            fill="#64748b"
            transform={`rotate(-35, ${x}, ${padding.top + chartH + 16})`}
          >
            {d.label}
          </text>
        ) : null
      })}

      {/* Area fill */}
      <polygon
        points={`${padding.left},${padding.top + chartH} ${polyline} ${points[points.length - 1].x},${padding.top + chartH}`}
        fill={`${color}15`}
      />

      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill={color}
          stroke="#fff"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}
