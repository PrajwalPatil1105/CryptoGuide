import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

function GainersLosersPanel({ trendingCoins }) {
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (trendingCoins && trendingCoins.length > 0) {
      const coinsWithPriceChange = trendingCoins
        .filter(
          (coin) =>
            coin.item.data &&
            coin.item.data.price_change_percentage_24h &&
            coin.item.data.price_change_percentage_24h.usd !== undefined
        )
        .map((coin) => ({
          id: coin.item.id,
          name: coin.item.name,
          symbol: coin.item.symbol,
          image: coin.item.large,
          price: coin.item.data.price,
          priceChangePercentage: coin.item.data.price_change_percentage_24h.usd,
          marketCap: coin.item.data.market_cap,
          volume: coin.item.data.total_volume,
        }));
      const sorted = [...coinsWithPriceChange].sort(
        (a, b) => b.priceChangePercentage - a.priceChangePercentage
      );
      setTopGainers(sorted.slice(0, 5));
      setTopLosers([...sorted].reverse().slice(0, 5));
      setIsLoading(false);
    }
  }, [trendingCoins]);

  const formatCurrency = (value) => {
    if (!value) return "N/A";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: parseFloat(value) < 1 ? 6 : 2,
      maximumFractionDigits: parseFloat(value) < 1 ? 6 : 2,
    }).format(value);
  };

  const formatPercentage = (value) => {
    if (value === undefined || value === null) return "N/A";
    return `${value.toFixed(2)}%`;
  };

  const renderCoinCard = (coin) => {
    const isPositive = coin.priceChangePercentage >= 0;

    return (
      <motion.div
        key={coin.id}
        className="bg-gray-700 p-4 rounded-lg mb-2 flex items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
      >
        <img
          src={coin.image}
          alt={coin.name}
          className="w-8 h-8 mr-3 rounded-full"
        />

        <div className="flex-grow">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">
              {coin.name}
              <span className="ml-1 text-gray-400 text-xs">
                {coin.symbol.toUpperCase()}
              </span>
            </h3>
            <span
              className={`text-sm font-semibold flex items-center ${
                isPositive ? "text-green-400" : "text-red-400"
              }`}
            >
              {isPositive ? (
                <TrendingUp size={16} className="mr-1" />
              ) : (
                <TrendingDown size={16} className="mr-1" />
              )}
              {formatPercentage(coin.priceChangePercentage)}
            </span>
          </div>

          <div className="flex justify-between text-sm text-gray-300 mt-1">
            <span>{formatCurrency(coin.price)}</span>
            <span>Vol: {coin.volume}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-lg shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6">Market Movers</h2>

      <div className="mb-6">
        <div className="flex items-center mb-4">
          <TrendingUp size={20} className="text-green-400 mr-2" />
          <h3 className="text-xl font-semibold text-green-400">Top Gainers</h3>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-400"></div>
          </div>
        ) : topGainers.length > 0 ? (
          <div>{topGainers.map((coin) => renderCoinCard(coin))}</div>
        ) : (
          <p className="text-gray-400 italic">No data available</p>
        )}
      </div>

      <div>
        <div className="flex items-center mb-4">
          <TrendingDown size={20} className="text-red-400 mr-2" />
          <h3 className="text-xl font-semibold text-red-400">Top Losers</h3>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-400"></div>
          </div>
        ) : topLosers.length > 0 ? (
          <div>{topLosers.map((coin) => renderCoinCard(coin))}</div>
        ) : (
          <p className="text-gray-400 italic">No data available</p>
        )}
      </div>
    </motion.div>
  );
}

export default GainersLosersPanel;
