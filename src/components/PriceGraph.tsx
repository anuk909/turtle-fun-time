import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useState, useEffect } from 'react'

interface PriceGraphProps {
  coinId: string;
  timeframe: '24h' | '7d' | '30d' | '1y';
}

export function PriceGraph({ coinId, timeframe }: PriceGraphProps) {
  const [data, setData] = useState<Array<{ time: string; price: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true)
      setError(null)
      try {
        const days = timeframe === '24h' ? 1
          : timeframe === '7d' ? 7
          : timeframe === '30d' ? 30
          : 365

        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch historical data')
        }

        const json = await response.json()
        setData(json.prices.map(([timestamp, price]: [number, number]) => ({
          time: new Date(timestamp).toLocaleString(),
          price
        })))
      } catch (error) {
        console.error('Error fetching historical data:', error)
        setError('Failed to load price history')
      } finally {
        setLoading(false)
      }
    }

    fetchHistoricalData()
    const interval = setInterval(fetchHistoricalData, 60000)
    return () => clearInterval(interval)
  }, [coinId, timeframe])

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-white rounded-lg p-4">
        Loading price history...
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-white rounded-lg p-4 text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            tickFormatter={(time) => {
              const date = new Date(time)
              return timeframe === '24h'
                ? date.toLocaleTimeString()
                : date.toLocaleDateString()
            }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
            labelFormatter={(label) => new Date(label).toLocaleString()}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2E7D32"
            strokeWidth={2}
            dot={false}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
