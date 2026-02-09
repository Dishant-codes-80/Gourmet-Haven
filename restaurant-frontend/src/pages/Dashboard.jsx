import React, { useState, useEffect } from 'react';
import { reservationsAPI, ordersAPI } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalReservations: 0,
    totalSales: 0,
    completedOrders: 0,
    pendingReservations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [ordersRes, reservationsRes] = await Promise.all([
        ordersAPI.getAll().catch(() => ({ data: [] })),
        reservationsAPI.getAll().catch(() => ({ data: [] }))
      ]);

      const orders = ordersRes.data || [];
      const reservations = reservationsRes.data || [];

      setStats({
        totalOrders: orders.length,
        totalReservations: reservations.length,
        totalSales: orders.reduce((sum, o) => sum + (o.total || 0), 0),
        completedOrders: orders.filter(o => o.status === 'Completed').length,
        pendingReservations: reservations.filter(r => r.status === 'Pending').length
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main style={{ padding: '40px', textAlign: 'center', minHeight: '100vh' }}>
        <h2>Loading...</h2>
      </main>
    );
  }

  return (
    <main style={{ padding: '40px 20px', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#2c3e50' }}>📊 Admin Dashboard</h1>

        <div className="dashboard-grid">
          <StatCard title="Total Orders" value={stats.totalOrders} color="#e74c3c" />
          <StatCard title="Total Reservations" value={stats.totalReservations} color="#27ae60" />
          <StatCard title="Total Sales" value={`₹${stats.totalSales.toFixed(0)}`} color="#f39c12" />
          <StatCard title="Completed Orders" value={stats.completedOrders} color="#9b59b6" />
          <StatCard title="Pending Reservations" value={stats.pendingReservations} color="#e67e22" />
        </div>
      </div>
      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          
          h1 {
            font-size: 1.8em !important;
            margin-bottom: 25px !important;
          }
        }

        @media (max-width: 480px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          main {
            padding: 20px 10px !important;
          }
        }
      `}</style>
    </main>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      textAlign: 'center',
      transition: 'transform 0.2s',
      cursor: 'default'
    }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <h3 style={{ color: '#2c3e50', marginBottom: '10px', fontSize: '1.1em' }}>{title}</h3>
      <p style={{ fontSize: '2.2em', fontWeight: 'bold', color: color, margin: 0 }}>{value}</p>
    </div>
  );
}

export default Dashboard;
