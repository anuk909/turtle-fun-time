import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins } from 'lucide-react'
import { PriceGraph } from './PriceGraph'
import { useState } from 'react'

interface CryptoCardProps {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
}

export function CryptoCard({ id, name, symbol, price, change24h }: CryptoCardProps) {
  const [showGraph, setShowGraph] = useState(false)
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '1y'>('7d')

  return (
    <Card className="bg-turtle-sand-light hover:bg-white transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="text-turtle-shell" />
          {name} ({symbol.toUpperCase()})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-turtle-shell">
          ${price.toLocaleString()}
        </div>
        <div className={change24h >= 0 ? "text-green-600" : "text-red-600"}>
          {change24h.toFixed(2)}%
        </div>
        <button
          onClick={() => setShowGraph(!showGraph)}
          className="mt-2 px-4 py-2 bg-turtle-shell text-white rounded-lg"
        >
          {showGraph ? 'Hide Graph' : 'Show Graph'}
        </button>
        {showGraph && (
          <div className="mt-4">
            <div className="flex gap-2 mb-2">
              {(['24h', '7d', '30d', '1y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-1 rounded ${
                    timeframe === tf ? 'bg-turtle-shell text-white' : 'bg-gray-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <PriceGraph coinId={id} timeframe={timeframe} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
