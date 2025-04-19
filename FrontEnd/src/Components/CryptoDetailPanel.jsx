import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts";
import { motion } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";

const TIME_PERIODS = [
  { value: "7", label: "7 Days" },
  { value: "14", label: "14 Days" },
  { value: "30", label: "30 Days" },
];

const CHART_TYPES = [
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
  { value: "bar", label: "Bar" },
];

function CryptoDetailPanel({ coinId }) {
  const [timeFrame, setTimeFrame] = useState("7");
  const [chartData, setChartData] = useState([]);
  const [coinInfo, setCoinInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("line");
  const [hoveredStat, setHoveredStat] = useState(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      if (!coinId) return;
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
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${timeFrame}`,
          options
        );

        if (!response.ok) {
          throw new Error("Failed to fetch market chart data");
        }

        const chartResult = await response.json();

        const formattedData = chartResult.prices.map((pricePoint, index) => {
          const timestamp = pricePoint[0];
          const price = pricePoint[1];
          const volume = chartResult.total_volumes[index]
            ? chartResult.total_volumes[index][1]
            : 0;

          return {
            date: new Date(timestamp).toLocaleDateString(),
            timestamp,
            price,
            volume,
          };
        });

        setChartData(formattedData);

        // Fetch coin info
        const coinInfoResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}`,
          options
        );

        if (coinInfoResponse.ok) {
          const coinInfoData = await coinInfoResponse.json();
          setCoinInfo(coinInfoData);
        }
      } catch (err) {
        console.error("Error fetching market data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, [coinId, timeFrame]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: value < 1 ? 6 : 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
  };

  const formatNumber = (value) => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    }
    return value.toFixed(2);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 p-4 border border-gray-700 rounded shadow-lg"
        >
          <p className="font-bold text-gray-200">
            {new Date(payload[0].payload.timestamp).toLocaleString()}
          </p>
          <p className="text-green-400 font-medium flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
            Price: {formatCurrency(payload[0].value)}
          </p>
          {payload[1] && (
            <p className="text-blue-400 font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-400"></span>
              Volume: {formatNumber(payload[1].value)}
            </p>
          )}
        </motion.div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartData.length === 0) return null;

    switch (chartType) {
      case "area":
        return (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="timestamp"
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF" }}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
              minTickGap={40}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF" }}
              domain={["auto", "auto"]}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "10px" }} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              animationDuration={1500}
              animationEasing="ease-in-out"
              name="Price"
            />
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="timestamp"
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF" }}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
              minTickGap={40}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF" }}
              domain={["auto", "auto"]}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "10px" }} />
            <Bar
              dataKey="price"
              fill="#10B981"
              animationDuration={1500}
              animationEasing="ease-in-out"
              name="Price"
            />
          </BarChart>
        );
      default:
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="timestamp"
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF" }}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
              minTickGap={40}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF" }}
              domain={["auto", "auto"]}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "10px" }} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "#10B981", stroke: "#064E3B" }}
              animationDuration={1500}
              animationEasing="ease-in-out"
              name="Price"
            />
          </LineChart>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="bg-gray-800 p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-xl font-bold mb-4 text-red-400">
          Error Loading Chart Data
        </h2>
        <p className="text-gray-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          Retry
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <motion.div
          className="flex items-center mb-4 sm:mb-0"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {coinInfo && coinInfo.image && (
            <motion.img
              src={coinInfo.image.small}
              alt={coinInfo.name}
              className="w-10 h-10 mr-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.3,
              }}
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-white">
              {coinInfo ? coinInfo.name : coinId}
              {coinInfo && (
                <span className="ml-2 text-gray-400 text-lg">
                  {coinInfo.symbol.toUpperCase()}
                </span>
              )}
            </h2>
            {coinInfo && (
              <div className="text-sm text-gray-400">
                Rank #{coinInfo.market_cap_rank}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex gap-2 mb-2 sm:mb-0">
            {TIME_PERIODS.map((period) => (
              <motion.button
                key={period.value}
                className={`px-3 py-1 rounded-md ${
                  timeFrame === period.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                } transition-all`}
                onClick={() => setTimeFrame(period.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {period.label}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-2 sm:ml-2">
            {CHART_TYPES.map((type) => (
              <motion.button
                key={type.value}
                className={`px-3 py-1 rounded-md ${
                  chartType === type.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                } transition-all`}
                onClick={() => setChartType(type.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {type.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {coinInfo && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, staggerChildren: 0.1 }}
        >
          <motion.div
            className={`bg-gray-700 p-4 rounded-lg border border-transparent hover:border-blue-500 transition-colors cursor-pointer ${
              hoveredStat === "price"
                ? "border-blue-500 shadow-lg shadow-blue-900/20"
                : ""
            }`}
            whileHover={{ scale: 1.02 }}
            onMouseEnter={() => setHoveredStat("price")}
            onMouseLeave={() => setHoveredStat(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-gray-400 text-sm">Current Price</p>
            <p className="text-xl font-bold text-white">
              {formatCurrency(coinInfo.market_data.current_price.usd)}
            </p>
          </motion.div>

          <motion.div
            className={`bg-gray-700 p-4 rounded-lg border border-transparent hover:border-blue-500 transition-colors cursor-pointer ${
              hoveredStat === "change"
                ? "border-blue-500 shadow-lg shadow-blue-900/20"
                : ""
            }`}
            whileHover={{ scale: 1.02 }}
            onMouseEnter={() => setHoveredStat("change")}
            onMouseLeave={() => setHoveredStat(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-gray-400 text-sm">24h Change</p>
            <p
              className={`text-xl font-bold flex items-center ${
                coinInfo.market_data.price_change_percentage_24h >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {coinInfo.market_data.price_change_percentage_24h >= 0 ? "+" : ""}
              {coinInfo.market_data.price_change_percentage_24h.toFixed(2)}%
              <span className="ml-1">
                {coinInfo.market_data.price_change_percentage_24h >= 0
                  ? "↑"
                  : "↓"}
              </span>
            </p>
          </motion.div>

          <motion.div
            className={`bg-gray-700 p-4 rounded-lg border border-transparent hover:border-blue-500 transition-colors cursor-pointer ${
              hoveredStat === "market"
                ? "border-blue-500 shadow-lg shadow-blue-900/20"
                : ""
            }`}
            whileHover={{ scale: 1.02 }}
            onMouseEnter={() => setHoveredStat("market")}
            onMouseLeave={() => setHoveredStat(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-gray-400 text-sm">Market Cap</p>
            <p className="text-xl font-bold text-white">
              {formatNumber(coinInfo.market_data.market_cap.usd)}
            </p>
          </motion.div>

          <motion.div
            className={`bg-gray-700 p-4 rounded-lg border border-transparent hover:border-blue-500 transition-colors cursor-pointer ${
              hoveredStat === "volume"
                ? "border-blue-500 shadow-lg shadow-blue-900/20"
                : ""
            }`}
            whileHover={{ scale: 1.02 }}
            onMouseEnter={() => setHoveredStat("volume")}
            onMouseLeave={() => setHoveredStat(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-gray-400 text-sm">24h Volume</p>
            <p className="text-xl font-bold text-white">
              {formatNumber(coinInfo.market_data.total_volume.usd)}
            </p>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-100">Price Chart</h3>
          {coinInfo && (
            <div className="text-sm text-gray-400">
              {formatCurrency(coinInfo.market_data.current_price.usd)}
              <span
                className={`ml-2 ${
                  coinInfo.market_data.price_change_percentage_24h >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {coinInfo.market_data.price_change_percentage_24h >= 0
                  ? "+"
                  : ""}
                {coinInfo.market_data.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <motion.div
          className="h-64 md:h-80 bg-gray-850 rounded-lg p-2"
          whileHover={{ boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-100">Volume Chart</h3>
          {coinInfo && (
            <div className="text-sm text-gray-400">
              {formatNumber(coinInfo.market_data.total_volume.usd)}
            </div>
          )}
        </div>
        <motion.div
          className="h-40 md:h-64 bg-gray-850 rounded-lg p-2"
          whileHover={{ boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="timestamp"
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF" }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                minTickGap={40}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF" }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar
                name="Volume"
                dataKey="volume"
                fill="url(#colorVolume)"
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default CryptoDetailPanel;
