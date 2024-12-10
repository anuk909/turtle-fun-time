import { useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CryptoCard } from './components/CryptoCard'

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface NewsItem {
  title: string;
  url: string;
}

function App() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrices = async (retryCount = 0) => {
      try {
        if (cryptos.length === 0) return
        const ids = cryptos.map(c => c.id).join(',')
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
        )
        if (!response.ok) throw new Error('Failed to fetch prices')
        const data = await response.json()
        setCryptos(prev => prev.map(crypto => ({
          ...crypto,
          current_price: data[crypto.id]?.usd ?? crypto.current_price
        })))
        setLastUpdate(new Date())
        setError(null)
      } catch (error) {
        console.error('Error fetching prices:', error)
        if (retryCount < 3) {
          const backoffTime = Math.pow(2, retryCount) * 1000
          setTimeout(() => fetchPrices(retryCount + 1), backoffTime)
        } else {
          setError('Failed to update prices')
        }
      }
    }

    const fetchFullData = async (retryCount = 0) => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&sparkline=false'
        )
        if (!response.ok) throw new Error('Failed to fetch market data')
        const data = await response.json()
        setCryptos(data)
        setLastUpdate(new Date())
        setError(null)
      } catch (error) {
        console.error('Error fetching crypto data:', error)
        if (retryCount < 3) {
          const backoffTime = Math.pow(2, retryCount) * 1000
          setTimeout(() => fetchFullData(retryCount + 1), backoffTime)
        } else {
          setError('Failed to update market data')
        }
      }
    }

    const fetchNews = async () => {
      try {
        const response = await fetch(
          'https://min-api.cryptocompare.com/data/v2/news/?lang=EN'
        )
        if (!response.ok) throw new Error('Failed to fetch news')
        const data = await response.json()
        setNews(data.Data.slice(0, 5).map((item: any) => ({
          title: item.title,
          url: item.url
        })))
      } catch (error) {
        console.error('Error fetching news:', error)
      }
    }

    // Initial fetches
    fetchFullData()
    fetchNews()

    // Set up intervals with different frequencies
    const priceInterval = setInterval(fetchPrices, 15000) // 15s updates
    const fullDataInterval = setInterval(fetchFullData, 45000) // 45s updates
    const newsInterval = setInterval(fetchNews, 300000) // 5min updates

    return () => {
      clearInterval(priceInterval)
      clearInterval(fullDataInterval)
      clearInterval(newsInterval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-turtle-sand p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-turtle-shell text-center">
          🐢 Crypto Turtle Tracker
        </h1>
        <div className="text-center text-sm text-gray-600">
          Last updated: {lastUpdate.toLocaleTimeString()}
          {error && <div className="text-red-500 mt-1">{error}</div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cryptos.map((crypto) => (
            <CryptoCard
              key={crypto.id}
              id={crypto.id}
              name={crypto.name}
              symbol={crypto.symbol}
              price={crypto.current_price}
              change24h={crypto.price_change_percentage_24h}
            />
          ))}
        </div>

        <div className="bg-white rounded-shell p-6">
          <h2 className="text-2xl font-bold text-turtle-shell mb-4">
            Latest Crypto News
          </h2>
          <ScrollArea className="h-64">
            {news.map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 hover:bg-turtle-sand-light"
              >
                {item.title}
              </a>
            ))}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

export default App
