import { useState, useEffect } from 'react';
import { getAnalytics } from '../api/client';

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function BarChart({ data, valueKey = 'revenue', label }) {
  const max = Math.max(...data.map((d) => d[valueKey] || d.orders || 0), 1);

  return (
    <div className="chart-block">
      <h4>{label}</h4>
      <div className="bar-chart">
        {data.map((item) => {
          const value = item[valueKey] ?? item.orders ?? 0;
          const height = Math.max((value / max) * 100, value > 0 ? 8 : 0);
          return (
            <div key={item.date} className="bar-col" title={`${item.date}: ${valueKey === 'revenue' ? formatCurrency(value) : value}`}>
              <div className="bar-fill" style={{ height: `${height}%` }} />
              <span className="bar-label">{item.date.slice(-2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Analytics({ pin }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getAnalytics(pin)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [pin]);

  if (loading) return <p className="analytics-loading">Loading analytics...</p>;
  if (error) return <div className="error-msg">{error}</div>;
  if (!data) return null;

  const recentDays = data.dailySales.slice(-14);

  return (
    <div className="analytics-panel">
      <div className="analytics-grid">
        <div className="analytics-card highlight">
          <span className="analytics-label">Today&apos;s Sales</span>
          <strong>{formatCurrency(data.todayRevenue)}</strong>
          <small>{data.todayOrders} orders placed</small>
        </div>
        <div className="analytics-card">
          <span className="analytics-label">This Month</span>
          <strong>{formatCurrency(data.monthRevenue)}</strong>
          <small>Delivered orders revenue</small>
        </div>
        <div className="analytics-card">
          <span className="analytics-label">Total Revenue</span>
          <strong>{formatCurrency(data.totalRevenue)}</strong>
          <small>All time delivered</small>
        </div>
        <div className="analytics-card">
          <span className="analytics-label">Avg Order Value</span>
          <strong>{formatCurrency(data.averageOrderValue)}</strong>
          <small>Per delivered order</small>
        </div>
        <div className="analytics-card">
          <span className="analytics-label">Total Orders</span>
          <strong>{data.totalOrders}</strong>
          <small>{data.pendingOrders} packing · {data.deliveredOrders} done</small>
        </div>
        <div className="analytics-card">
          <span className="analytics-label">Order Mix</span>
          <strong>{data.deliveryPercentage}%</strong>
          <small>Delivery · {data.pickupOrders} pickup · {data.deliveryOrders} delivery</small>
        </div>
      </div>

      <BarChart data={recentDays} valueKey="revenue" label="Daily Sales (Last 14 Days) — ₹" />
      <BarChart data={recentDays} valueKey="orders" label="Daily Orders (Last 14 Days)" />

      <div className="analytics-table-wrap">
        <h3>📅 Daily Breakdown (Last 30 Days)</h3>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Orders</th>
              <th>Delivered</th>
              <th>Packing</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {[...data.dailySales].reverse().map((day) => (
              <tr key={day.date}>
                <td>{day.date}</td>
                <td>{day.orders}</td>
                <td>{day.delivered}</td>
                <td>{day.pending}</td>
                <td>{formatCurrency(day.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="analytics-table-wrap">
        <h3>📊 Monthly Summary</h3>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Orders</th>
              <th>Delivered</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {[...data.monthlySales].reverse().map((month) => (
              <tr key={month.date}>
                <td>{month.date}</td>
                <td>{month.orders}</td>
                <td>{month.delivered}</td>
                <td>{formatCurrency(month.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
