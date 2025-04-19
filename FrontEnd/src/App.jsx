import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CryptoDetailPanel from "./Components/CryptoDetailPanel";
import GainersLosersPanel from "./Components/GainersLosersPanel";
import CoinSelector from "./Components/CoinSelector";
import LoadingSpinner from "./Components/LoadingSpinner";

function App() {
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingCoins = async () => {
      try {
        setIsLoading(true);
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            "x-cg-demo-api-key": import.meta.env.VITE_CG_API_KEY,
          },
        };
        const response = await fetch(
          "https://api.coingecko.com/api/v3/search/trending",
          options
        );

        if (!response.ok) {
          throw new Error("Failed to fetch trending coins");
        }

        const data = await response.json();
        setTrendingCoins(data.coins);

        if (data.coins && data.coins.length > 0) {
          setSelectedCoin(data.coins[0].item.id);
        }
      } catch (err) {
        console.error("Error fetching trending coins:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingCoins();

    // Refresh data every 60 seconds
    const intervalId = setInterval(fetchTrendingCoins, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleCoinSelect = (coinId) => {
    setSelectedCoin(coinId);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Error Loading Dashboard</h1>
          <p className="text-xl">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <motion.header
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 text-blue-400">
          Crypto Dashboard
        </h1>
        <p className="text-gray-400">
          Real-time cryptocurrency market data powered by CoinGecko
        </p>
      </motion.header>

      <div className="mb-6">
        <CoinSelector
          coins={trendingCoins}
          selectedCoin={selectedCoin}
          onSelectCoin={handleCoinSelect}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {selectedCoin && <CryptoDetailPanel coinId={selectedCoin} />}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GainersLosersPanel trendingCoins={trendingCoins} />
        </motion.div>
      </div>
    </div>
  );
}

export default App;
