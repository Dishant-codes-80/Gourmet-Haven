import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reservationsAPI } from '../services/api';

const Reservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', date: '', time: '', guests: '1' });
  const [tokenDisplay, setTokenDisplay] = useState(null);

  // define table ids with sizes: small | medium | big
  const mapTables = (() => {
    const ids = Array.from({ length: 18 }, (_, i) => `T-${String(i + 1).padStart(2, '0')}`);
    // simple size distribution (adjustable): make a few big, some medium, rest small
    const sizeMap = {
      big: ['T-02', 'T-07', 'T-12', 'T-17'],
      medium: ['T-03', 'T-04', 'T-08', 'T-09', 'T-13', 'T-14'],
      small: []
    };
    // remaining ids are small
    ids.forEach(id => {
      if (!sizeMap.big.includes(id) && !sizeMap.medium.includes(id)) sizeMap.small.push(id);
    });
    return ids.map(id => ({ id, size: sizeMap.big.includes(id) ? 'big' : sizeMap.medium.includes(id) ? 'medium' : 'small' }));
  })();

  useEffect(() => {
    if (user && user.role === 'admin') fetchReservations();
  }, [user]);

  const fetchReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reservationsAPI.getAll();
      setReservations(res.data || []);
    } catch (err) {
      console.error('Failed to load reservations', err);
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    else if (!/^[a-zA-Z\s]+$/.test(formData.name)) errors.name = 'Name must contain only letters and spaces';

    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Please enter a valid email address';

    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) errors.phone = 'Phone must be 10 digits (numbers only)';

    if (!formData.date) errors.date = 'Date is required';
    if (!formData.time) errors.time = 'Time is required';
    if (!formData.guests) errors.guests = 'Number of guests is required';
    if (!selectedTable) errors.table = 'Please select a table';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') setFormData(prev => ({ ...prev, name: value.replace(/[^a-zA-Z\s]/g, '') }));
    else if (name === 'phone') setFormData(prev => ({ ...prev, phone: value.replace(/\D/g, '') }));
    else setFormData(prev => ({ ...prev, [name]: value }));

    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAddReservation = async (e) => {
    e.preventDefault();
    setSuccess('');
    if (!validateForm()) return;
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone,
      date: formData.date,
      time: formData.time,
      guests: parseInt(formData.guests, 10),
      table: selectedTable,
    };

    try {
      const response = await reservationsAPI.create(payload);
      setSuccess('Reservation confirmed! A confirmation email has been sent to ' + formData.email);
      setTokenDisplay({ token: response.data.token, table: response.data.table });
      setTimeout(() => setTokenDisplay(null), 20000); // Hide after 20 seconds

      // Auto-copy token to clipboard
      if (navigator.clipboard && response.data.token) {
        navigator.clipboard.writeText(response.data.token).then(() => {
          // Show notification
          const notification = document.createElement('div');
          notification.textContent = 'Token copied to clipboard!';
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 1000;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          `;
          document.body.appendChild(notification);
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 3000);
        }).catch(err => {
          console.error('Failed to copy token: ', err);
        });
      }

      setFormData({ name: '', email: '', phone: '', date: '', time: '', guests: '1' });
      setSelectedTable('');
      setTimeout(() => setSuccess(''), 3000);
      if (user && user.role === 'admin') fetchReservations();
    } catch (err) {
      console.error('Failed to create reservation', err);
      setError('Failed to save reservation. Please try again.');
    }
  };

  const handleConfirmReservation = async (id) => {
    if (!user || user.role !== 'admin') return;
    try {
      await reservationsAPI.updateStatus(id, 'Confirmed');
      fetchReservations();
    } catch (err) {
      console.error('Failed to confirm reservation', err);
    }
  };

  const handleCancelReservation = async (id) => {
    const confirmed = window.confirm('Cancel this reservation?');
    if (!confirmed) return;
    if (user && user.role === 'admin') {
      try {
        await reservationsAPI.delete(id);
        fetchReservations();
      } catch (err) {
        console.error('Failed to delete reservation', err);
      }
    }
  };

  return (
    <main style={{ padding: '20px 10px 80px 10px', minHeight: '100%', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', display: 'block' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ marginBottom: '10px', color: '#2c3e50', fontSize: '2.5em', fontWeight: 'bold' }}>Table Reservations</h1>
          <p style={{ color: '#666', fontSize: '1.1em' }}>Book your perfect dining experience</p>
        </div>

        {success && (
          <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #c3e6cb', fontSize: '0.95em' }}>{success}</div>
        )}

        {tokenDisplay && (
          <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #ffeaa7', textAlign: 'center', fontSize: '1.2em', fontWeight: 'bold' }}>
            <p>Your Reservation Token: <span style={{ color: '#d68910' }}>{tokenDisplay.token}</span></p>
            <p>Assigned Table: <span style={{ color: '#d68910' }}>{tokenDisplay.table}</span></p>
            <p style={{ fontSize: '0.9em', marginTop: '10px' }}>Use this token to order in advance. Token copied to clipboard! This will disappear in 20 seconds.</p>
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>{error}</div>
        )}

        {(!user || user.role !== 'admin') ? (
          <div className="reservations-layout">
            <div className="table-map card" style={{ padding: 20 }}>
              <h3 style={{ marginBottom: 12, color: '#2c3e50' }}>Restaurant Map</h3>
              <p style={{ marginBottom: 12, color: '#666', fontSize: '0.95em' }}>Click a table to select it.</p>
              <div className="map-wrapper" style={{ marginTop: 10 }}>
                <div className="map-grid">
                  {mapTables.map(({ id, size }) => (
                    <div
                      key={id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedTable(id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') setSelectedTable(id); }}
                      className={"map-table table-" + size + (selectedTable === id ? ' selected' : '')}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <div className="table-frame">
                        <div className="table-shape">{id}</div>
                        {/* seats on all sides */}
                        {Array.from({ length: (size === 'big' ? 3 : size === 'medium' ? 2 : 1) }).length > 0 && (
                          <>
                            <div className="seats-top">
                              {Array.from({ length: (size === 'big' ? 3 : size === 'medium' ? 2 : 1) }).map((_, i) => <span key={`t-${i}`} className="seat" />)}
                            </div>
                            <div className="seats-bottom">
                              {Array.from({ length: (size === 'big' ? 3 : size === 'medium' ? 2 : 1) }).map((_, i) => <span key={`b-${i}`} className="seat" />)}
                            </div>
                            <div className="seats-left">
                              {Array.from({ length: (size === 'big' ? 3 : size === 'medium' ? 2 : 1) }).map((_, i) => <span key={`l-${i}`} className="seat" />)}
                            </div>
                            <div className="seats-right">
                              {Array.from({ length: (size === 'big' ? 3 : size === 'medium' ? 2 : 1) }).map((_, i) => <span key={`r-${i}`} className="seat" />)}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 14, fontSize: '0.95em', color: '#444' }}><strong>Selected:</strong> {selectedTable || 'None'}</div>
            </div>

            <div className="card reservations-form" style={{ padding: 20 }}>
              <h3 style={{ color: '#2c3e50', marginBottom: '14px', fontSize: '1.25em' }}>Reservation Details</h3>
              <form onSubmit={handleAddReservation}>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600' }}>Full Name *</label>
                    <input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} placeholder="" style={{ width: '100%', padding: '10px 12px', border: validationErrors.name ? '2px solid #e74c3c' : '2px solid #ddd', borderRadius: '6px', fontSize: '0.95em', boxSizing: 'border-box' }} required />
                    {validationErrors.name && <span style={{ color: '#e74c3c', fontSize: '0.85em', marginTop: '5px', display: 'block' }}>{validationErrors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600' }}>Email *</label>
                    <input type="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" style={{ width: '100%', padding: '10px 12px', border: validationErrors.email ? '2px solid #e74c3c' : '2px solid #ddd', borderRadius: '6px', fontSize: '0.95em', boxSizing: 'border-box' }} required />
                    {validationErrors.email && <span style={{ color: '#e74c3c', fontSize: '0.85em', marginTop: '5px', display: 'block' }}>{validationErrors.email}</span>}
                  </div>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600' }}>Phone Number * (10 digits)</label>
                    <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleInputChange} placeholder="" maxLength="10" style={{ width: '100%', padding: '10px 12px', border: validationErrors.phone ? '2px solid #e74c3c' : '2px solid #ddd', borderRadius: '6px', fontSize: '0.95em', boxSizing: 'border-box' }} required />
                    {validationErrors.phone && <span style={{ color: '#e74c3c', fontSize: '0.85em', marginTop: '5px', display: 'block' }}>{validationErrors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600' }}>Number of Guests *</label>
                    <select name="guests" className="form-control" value={formData.guests} onChange={handleInputChange} style={{ width: '100%', padding: '10px 12px', border: validationErrors.guests ? '2px solid #e74c3c' : '2px solid #ddd', borderRadius: '6px', fontSize: '0.95em', boxSizing: 'border-box', backgroundColor: '#fff' }} required>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (<option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>))}
                    </select>
                    {validationErrors.guests && <span style={{ color: '#e74c3c', fontSize: '0.85em', marginTop: '5px', display: 'block' }}>{validationErrors.guests}</span>}
                  </div>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600' }}>Date *</label>
                    <input type="date" name="date" className="form-control" value={formData.date} onChange={handleInputChange} style={{ width: '100%', padding: '10px 12px', border: validationErrors.date ? '2px solid #e74c3c' : '2px solid #ddd', borderRadius: '6px', fontSize: '0.95em', boxSizing: 'border-box' }} required />
                    {validationErrors.date && <span style={{ color: '#e74c3c', fontSize: '0.85em', marginTop: '5px', display: 'block' }}>{validationErrors.date}</span>}
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600' }}>Time *</label>
                    <input type="time" name="time" className="form-control" value={formData.time} onChange={handleInputChange} style={{ width: '100%', padding: '10px 12px', border: validationErrors.time ? '2px solid #e74c3c' : '2px solid #ddd', borderRadius: '6px', fontSize: '0.95em', boxSizing: 'border-box' }} required />
                    {validationErrors.time && <span style={{ color: '#e74c3c', fontSize: '0.85em', marginTop: '5px', display: 'block' }}>{validationErrors.time}</span>}
                  </div>
                </div>

                <div style={{ marginBottom: '18px', color: '#666', fontSize: '0.95em' }}>
                  <strong>Table:</strong> {selectedTable || 'Select a table from the map'}
                  {validationErrors.table && <div style={{ color: '#e74c3c', fontSize: '0.85em', marginTop: 6 }}>{validationErrors.table}</div>}
                </div>

                <button type="submit" className="btn" style={{ width: '100%', padding: '12px', backgroundColor: '#27ae60', color: '#fff', fontSize: '1.05em', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#229954'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#27ae60'}>
                  Reserve Table
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '1.6em' }}>Admin: Manage Reservations ({reservations.length})</h2>
            {loading ? (
              <p style={{ color: '#666' }}>Loading reservations...</p>
            ) : (
              <div style={{ marginTop: 15 }}>
                {reservations.length === 0 ? (
                  <p style={{ color: '#999', textAlign: 'center', padding: '30px' }}>No reservations yet</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#f0f0f0' }}>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Date</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Time</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Guests</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Table</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.map(r => (
                          <tr key={r._id || r.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px' }}><strong>{r.name}</strong></td>
                            <td style={{ padding: '12px' }}>{r.date}</td>
                            <td style={{ padding: '12px' }}>{r.time}</td>
                            <td style={{ padding: '12px' }}>{r.guests}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{r.table || 'TBD'}</span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ backgroundColor: r.status === 'Confirmed' ? '#d4edda' : '#fff3cd', color: r.status === 'Confirmed' ? '#155724' : '#856404', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{r.status}</span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              {r.status === 'Pending' && (
                                <button className="btn btn-edit" onClick={() => handleConfirmReservation(r._id || r.id)} style={{ marginRight: 8, padding: '6px 12px', fontSize: '0.85em', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Confirm</button>
                              )}
                              <button className="btn btn-delete" onClick={() => handleCancelReservation(r._id || r.id)} style={{ padding: '6px 12px', fontSize: '0.85em', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`
        .reservations-layout {
          display: flex;
          gap: 30px;
          align-items: flex-start;
          margin-top: 20px;
        }

        .table-map {
          flex: 1;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          padding: 24px;
          min-width: 0;
        }

        .reservations-form {
          flex: 0 0 450px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          padding: 30px;
          position: sticky;
          top: 100px;
        }

        .map-wrapper {
          overflow-x: auto;
          padding: 10px;
          margin: 0 -10px;
          -webkit-overflow-scrolling: touch;
        }

        .map-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          min-width: 600px;
        }

        @media (max-width: 1100px) {
          .reservations-layout {
            flex-direction: column;
            align-items: stretch;
          }
          
          .reservations-form {
            flex: none;
            position: static;
          }

          .map-grid {
             grid-template-columns: repeat(3, 1fr);
             min-width: 500px;
          }
        }

        @media (max-width: 768px) {
          .map-grid {
            grid-template-columns: repeat(3, 1fr);
            min-width: 450px;
            gap: 15px;
          }
          
          .form-row {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
          
          .container {
            padding: 0 10px;
          }

          h1 {
            font-size: 2em !important;
          }
        }

        @media (max-width: 480px) {
           .map-grid {
             min-width: unset;
             grid-template-columns: repeat(2, 1fr);
             gap: 10px;
           }
           
           .table-map {
             padding: 10px;
             margin-bottom: 20px;
           }
           
           .table-frame {
             transform: scale(0.85);
           }
           
           .reservations-form {
             padding: 15px;
             position: static !important;
           }

           .form-group {
             margin-bottom: 15px !important;
           }

           h1 {
             font-size: 1.8em !important;
             margin-bottom: 10px !important;
           }

           main {
             padding: 20px 10px 100px 10px !important;
             overflow: visible !important;
             height: auto !important;
             display: block !important;
           }
           
           .reservations-layout {
             display: block !important;
             margin-bottom: 60px;
           }
        }

        .map-table {
          transition: all 0.2s;
        }

        .map-table:hover {
          background-color: #f0f2f5;
        }

        .map-table.selected {
          border: 2px solid #e74c3c;
          background-color: #fffafa;
        }
      `}</style>
    </main>
  );
};

export default Reservations;
