import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Users, ShoppingBag, IndianRupee, BarChart2 } from 'lucide-react';
import db from '../db/db';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    orderStatuses: {},
    ordersOverTime: {},
    revenueOverTime: {},
  });
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch total users
      const totalUsers = await db.users.count();

      // Fetch all orders
      const allOrders = await db.orders.toArray();

      // Total orders
      const totalOrders = allOrders.length;

      // Total revenue (sum of totals where status !== 'cancelled')
      const totalRevenue = allOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      // Order statuses count
      const orderStatuses = allOrders.reduce((acc, o) => {
        const status = o.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Orders over time (group by date)
      const ordersOverTime = allOrders.reduce((acc, o) => {
        if (o.createdAt) {
          const date = new Date(o.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
          acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
      }, {});

      // Revenue over time (group by date)
      const revenueOverTime = allOrders.reduce((acc, o) => {
        if (o.createdAt && o.status !== 'cancelled') {
          const date = new Date(o.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
          acc[date] = (acc[date] || 0) + (o.total || 0);
        }
        return acc;
      }, {});

      setStats({
        totalUsers,
        totalOrders,
        totalRevenue,
        orderStatuses,
        ordersOverTime,
        revenueOverTime,
      });
    } catch (err) {
      console.error('Error loading analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#555', fontSize: '18px' }}>
        Loading analytics...
      </div>
    );
  }

  // Prepare chart data
  const statusLabels = Object.keys(stats.orderStatuses);
  const statusData = {
    labels: statusLabels,
    datasets: [{
      data: statusLabels.map(s => stats.orderStatuses[s]),
      backgroundColor: ['#ffa41c', '#007600', '#0ea5a4', '#0066c0', '#c40000', '#c45500'],
    }],
  };

  const timeLabels = Object.keys(stats.ordersOverTime).sort((a, b) => new Date(a) - new Date(b));
  const ordersTimeData = {
    labels: timeLabels,
    datasets: [{
      label: 'Orders',
      data: timeLabels.map(d => stats.ordersOverTime[d]),
      borderColor: '#0066c0',
      backgroundColor: 'rgba(0, 102, 192, 0.2)',
      fill: true,
    }],
  };

  const revenueTimeData = {
    labels: timeLabels,
    datasets: [{
      label: 'Revenue (₹)',
      data: timeLabels.map(d => stats.revenueOverTime[d] || 0),
      backgroundColor: '#ffa41c',
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div style={{
      background: '#f3f3f3',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '24px 16px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #ddd',
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 500,
            color: '#111',
          }}>
            Analytics & Insights
          </h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '8px 16px',
                border: '1px solid #d5d9d9',
                borderRadius: '3px',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <button
              onClick={loadAnalytics}
              style={{
                padding: '8px 16px',
                border: '1px solid #d5d9d9',
                borderRadius: '3px',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <div style={{
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <Users size={32} color="#0066c0" />
            <div>
              <div style={{ fontSize: '14px', color: '#555' }}>Total Users</div>
              <div style={{ fontSize: '24px', fontWeight: 500 }}>{stats.totalUsers}</div>
            </div>
          </div>
          <div style={{
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <ShoppingBag size={32} color="#ffa41c" />
            <div>
              <div style={{ fontSize: '14px', color: '#555' }}>Total Orders</div>
              <div style={{ fontSize: '24px', fontWeight: 500 }}>{stats.totalOrders}</div>
            </div>
          </div>
          <div style={{
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <IndianRupee size={32} color="#007600" />
            <div>
              <div style={{ fontSize: '14px', color: '#555' }}>Total Revenue</div>
              <div style={{ fontSize: '24px', fontWeight: 500 }}>₹{stats.totalRevenue.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
        }}>
          {/* Order Statuses Pie */}
          <div style={{
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>Order Status Distribution</h2>
            <Pie data={statusData} options={chartOptions} />
          </div>

          {/* Orders Over Time Line */}
          <div style={{
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>Orders Over Time</h2>
            <Line data={ordersTimeData} options={chartOptions} />
          </div>

          {/* Revenue Over Time Bar */}
          <div style={{
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>Revenue Over Time</h2>
            <Bar data={revenueTimeData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}