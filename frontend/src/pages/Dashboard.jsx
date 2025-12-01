import { useEffect, useState } from "react";
import API from "../api/api";
import Header from "../components/Header";
import SummaryCard from "../components/SummaryCard";
import RevenueChart from "../components/RevenueChart";
import TopCustomersTable from "../components/TopCustomersTable";
import LoadingSpinner from "../components/LoadingSpinner";
import Toast from "../components/Toast";
import "./Dashboard.css";

export default function Dashboard() {
  const tenantId = localStorage.getItem("tenantId") || 1;

  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [aov, setAov] = useState(null);
  const [repeatStats, setRepeatStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [s, chart, top, aovRes, repeat] = await Promise.all([
        API.get(`/analytics/summary?tenantId=${tenantId}`),
        API.get(`/analytics/orders-by-date?tenantId=${tenantId}`),
        API.get(`/analytics/top-customers?tenantId=${tenantId}`),
        API.get(`/analytics/average-order-value?tenantId=${tenantId}`),
        API.get(`/analytics/repeat-customers?tenantId=${tenantId}`)
      ]);

      setSummary(s.data);
      setChartData(chart.data);
      setTopCustomers(top.data);
      setAov(aovRes.data);
      setRepeatStats(repeat.data);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="dashboard-page">
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
          <button className="refresh-btn" onClick={loadData} disabled={loading}>
            🔄 Refresh
          </button>
        </div>

        {loading && <LoadingSpinner />}
        {error && <Toast message={error} type="error" />}

        {!loading && summary && (
          <>
            <div className="summary-area">
              <SummaryCard title="Total Customers" value={summary.totalCustomers} icon="👥" />
              <SummaryCard title="Total Orders" value={summary.totalOrders} icon="📦" />
              <SummaryCard title="Revenue (₹)" value={`₹${Number(summary.totalRevenue).toLocaleString()}`} icon="💰" />
              <SummaryCard title="Avg Order Value" value={`₹${aov ? aov.averageOrderValue.toFixed(2) : "-"}`} icon="📈" />
              <SummaryCard
                title="Repeat Rate"
                value={repeatStats ? (repeatStats.repeatRate * 100).toFixed(1) + "%" : "-"}
                icon="🔄"
              />
            </div>

            <div className="chart-section">
              <RevenueChart data={chartData} />
            </div>

            <div className="table-section">
              <h3>Top Customers</h3>
              {topCustomers.length > 0 ? (
                <TopCustomersTable customers={topCustomers} />
              ) : (
                <p className="no-data">No customer data available</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
