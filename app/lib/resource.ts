export const DEFAULT_TICKERS = ["VOO", "QQQ", "VTI", "BND", "VXUS"];

export const BENCHMARK_TICKERS = ["VTI", "QQQ"];

  export const twColor = (color: string) => {
    const colors = {
      "blue-600": "#2563eb",
      "green-500": "#10b981",
      "red-500": "#ef4444",
      "purple-500": "#8b5cf6",
      "yellow-500": "#f59e0b",
      "gray-500": "#6b7280",
    };
    return colors[color as keyof typeof colors] || "#000000";
  };