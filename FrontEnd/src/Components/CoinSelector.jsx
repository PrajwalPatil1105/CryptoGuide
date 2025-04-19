import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

function CoinSelector({ coins, selectedCoin, onSelectCoin }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value) {
      setIsDropdownOpen(true);
    }
  };

  const handleSelectCoin = (coinId) => {
    onSelectCoin(coinId);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const filteredCoins = searchQuery
    ? coins.filter(
        (coin) =>
          coin.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coin.item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : coins;

  const selectedCoinData = coins.find(
    (coin) => coin.item.id === selectedCoin
  )?.item;

  return (
    <div className="relative z-10">
      <div className="flex flex-col md:flex-row md:items-center mb-2">
        <div className="relative flex-grow md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-800 text-white w-full pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search for a cryptocurrency..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={() => {
              // Delay closing the dropdown to allow clicking on options
              setTimeout(() => setIsDropdownOpen(false), 150);
            }}
          />
        </div>

        {selectedCoinData && !searchQuery && (
          <div className="mt-3 md:mt-0 md:ml-4 flex items-center">
            <span className="text-gray-400 mr-2">Currently viewing:</span>
            <div className="flex items-center bg-gray-800 px-3 py-1 rounded-lg border border-gray-700">
              <img
                src={selectedCoinData.large}
                alt={selectedCoinData.name}
                className="w-6 h-6 mr-2 rounded-full"
              />
              <span className="font-medium">{selectedCoinData.name}</span>
              <span className="ml-1 text-gray-400">
                ({selectedCoinData.symbol.toUpperCase()})
              </span>
            </div>
          </div>
        )}
      </div>

      {isDropdownOpen && filteredCoins.length > 0 && (
        <motion.div
          className="absolute mt-1 w-full md:max-w-md bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="max-h-64 overflow-y-auto">
            {filteredCoins.map((coin) => (
              <div
                key={coin.item.id}
                className={`flex items-center p-3 cursor-pointer hover:bg-gray-700 transition ${
                  selectedCoin === coin.item.id ? "bg-gray-700" : ""
                }`}
                onClick={() => handleSelectCoin(coin.item.id)}
              >
                <img
                  src={coin.item.large}
                  alt={coin.item.name}
                  className="w-8 h-8 mr-3 rounded-full"
                />
                <div>
                  <div className="font-medium">{coin.item.name}</div>
                  <div className="text-sm text-gray-400">
                    {coin.item.symbol.toUpperCase()}
                  </div>
                </div>
                {coin.item.market_cap_rank && (
                  <div className="ml-auto bg-gray-900 px-2 py-1 rounded text-xs">
                    Rank #{coin.item.market_cap_rank}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default CoinSelector;
