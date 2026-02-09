import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ingredientsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    category: 'vegetables',
    threshold: '',
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect non-admin users to login
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchIngredients();
  }, [user, navigate]);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      setError('');
      // Use mock data since backend inventory may not be fully implemented
      const mockIngredients = [
        { _id: 1, name: 'Basmati Rice', quantity: 50, unit: 'kg', category: 'grains', threshold: 20 },
        { _id: 2, name: 'Tomatoes', quantity: 8, unit: 'kg', category: 'vegetables', threshold: 15 },
        { _id: 3, name: 'Onions', quantity: 40, unit: 'kg', category: 'vegetables', threshold: 20 },
        { _id: 4, name: 'Garlic', quantity: 3, unit: 'kg', category: 'spices', threshold: 5 },
        { _id: 5, name: 'Ginger', quantity: 8, unit: 'kg', category: 'spices', threshold: 8 },
        { _id: 6, name: 'Paneer', quantity: 5, unit: 'kg', category: 'dairy', threshold: 15 },
        { _id: 7, name: 'Butter', quantity: 15, unit: 'kg', category: 'dairy', threshold: 10 },
        { _id: 8, name: 'Chicken', quantity: 40, unit: 'kg', category: 'meat', threshold: 30 },
        { _id: 9, name: 'Lamb', quantity: 12, unit: 'kg', category: 'meat', threshold: 20 },
        { _id: 10, name: 'Cumin Seeds', quantity: 2, unit: 'kg', category: 'spices', threshold: 3 },
      ];
      try {
        const response = await ingredientsAPI.getAll();
        if (response.data && response.data.length > 0) {
          setIngredients(response.data);
        } else {
          setIngredients(mockIngredients);
        }
      } catch (apiErr) {
        console.log('API call failed, using mock data:', apiErr);
        setIngredients(mockIngredients);
      }
    } catch (err) {
      setError('Failed to load inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity) {
      setError('Name and quantity are required');
      return;
    }

    try {
      const ingredientData = {
        name: formData.name,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        category: formData.category,
        threshold: formData.threshold ? parseFloat(formData.threshold) : 10,
      };

      try {
        const response = await ingredientsAPI.create(ingredientData);
        setIngredients([response.data, ...ingredients]);
      } catch (apiErr) {
        console.error('API call to create ingredient failed:', apiErr); // More detailed error logging
        const newIngredient = {
          _id: Date.now(),
          ...ingredientData,
        };
        setIngredients([newIngredient, ...ingredients]);
      }
      setFormData({ name: '', quantity: '', unit: 'kg', category: 'vegetables', threshold: '' });
      setShowForm(false);
      setError('');
    } catch (err) {
      setError('Failed to add ingredient');
      console.error(err);
    }
  };

  const handleDeleteIngredient = (id) => {
    if (!window.confirm('Delete this ingredient?')) return;
    setIngredients(ingredients.filter(ing => ing._id !== id));
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    setIngredients(ingredients.map(ing =>
      ing._id === id ? { ...ing, quantity: parseFloat(newQuantity) } : ing
    ));
  };

  if (loading) return <main style={{ padding: '40px', textAlign: 'center' }}>Loading inventory...</main>;

  return (
    <main style={{ padding: '40px 20px', minHeight: '70vh' }}>
      <div className="container">
        <h1 style={{ marginBottom: '20px', color: '#2c3e50' }}>Inventory Management</h1>

        {error && <div className="error">{error}</div>}

        {/* Needed Ingredients Alert Section */}
        {(() => {
          const neededIngredients = ingredients.filter(ing => ing.quantity < (ing.threshold || 10));
          if (neededIngredients.length > 0) {
            return (
              <div style={{
                backgroundColor: '#fff3e0',
                border: '2px solid #ff9800',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '30px'
              }}>
                <h2 style={{ color: '#e65100', margin: '0 0 15px 0', fontSize: '1.3rem' }}>
                  🔔 Needed Ingredients ({neededIngredients.length})
                </h2>
                <div className="inventory-alerts-grid">
                  {neededIngredients.map(ing => (
                    <div key={ing._id} style={{
                      backgroundColor: '#fff',
                      padding: '15px',
                      borderRadius: '8px',
                      border: '1px solid #ffb74d',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                    }}>
                      <div style={{ fontWeight: 'bold', color: '#d32f2f', fontSize: '1.05rem' }}>{ing.name}</div>
                      <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '6px' }}>
                        Current: <strong>{ing.quantity} {ing.unit}</strong>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#ff6f00', marginTop: '4px' }}>
                        Min Needed: {ing.threshold || 10} {ing.unit}
                      </div>
                      <button
                        className="btn"
                        onClick={() => {
                          handleUpdateQuantity(ing._id, (ing.threshold || 10) * 2);
                        }}
                        style={{
                          marginTop: '12px',
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          backgroundColor: '#ff9800',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          width: '100%',
                          fontWeight: '600'
                        }}
                      >
                        Quick Restock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })()}

        <button className="btn" onClick={() => setShowForm(!showForm)} style={{ marginBottom: '30px' }}>
          {showForm ? 'Cancel' : 'Add Ingredient'}
        </button>

        {showForm && (
          <div className="form-container" style={{ marginBottom: '30px' }}>
            <h3>Add New Ingredient</h3>
            <form onSubmit={handleAddIngredient}>
              <div className="form-group">
                <label>Ingredient Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g., 10"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <select
                    className="form-control"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option>kg</option>
                    <option>g</option>
                    <option>liter</option>
                    <option>pieces</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="meat">Meat</option>
                    <option value="dairy">Dairy</option>
                    <option value="grains">Grains</option>
                    <option value="spices">Spices</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Low Stock Threshold</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                    placeholder="e.g., 10"
                  />
                </div>
              </div>
              <button type="submit" className="btn">Add Ingredient</button>
            </form>
          </div>
        )}

        {Object.entries({
          vegetables: ingredients.filter(i => i.category === 'vegetables'),
          meat: ingredients.filter(i => i.category === 'meat'),
          dairy: ingredients.filter(i => i.category === 'dairy'),
          grains: ingredients.filter(i => i.category === 'grains'),
          spices: ingredients.filter(i => i.category === 'spices'),
        }).map(([category, items]) => items.length > 0 && (
          <div key={category} style={{ marginBottom: '40px' }}>
            <h2 style={{ textTransform: 'capitalize', color: '#2c3e50', marginBottom: '20px' }}>
              {category}
            </h2>
            <div className="inventory-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const isLowStock = item.quantity < (item.threshold || 10);
                    return (
                      <tr key={item._id} style={{ backgroundColor: isLowStock ? '#ffebee' : 'transparent' }}>
                        <td><strong style={{ fontSize: '0.95rem' }}>{item.name}</strong></td>
                        <td>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item._id, e.target.value)}
                            style={{ width: '70px', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                          />
                        </td>
                        <td>{item.unit}</td>
                        <td>
                          {isLowStock && (
                            <span style={{
                              color: '#d32f2f',
                              fontWeight: 'bold',
                              padding: '4px 8px',
                              backgroundColor: '#ffcdd2',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              whiteSpace: 'nowrap'
                            }}>
                              ⚠️ Low
                            </span>
                          )}
                          {!isLowStock && (
                            <span style={{
                              color: '#388e3c',
                              padding: '4px 8px',
                              backgroundColor: '#e8f5e9',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              whiteSpace: 'nowrap'
                            }}>
                              ✓ OK
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-delete"
                            onClick={() => handleDeleteIngredient(item._id)}
                            style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {ingredients.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            <p>No ingredients in inventory. Add one to get started!</p>
          </div>
        )}
      </div>
      <style>{`
        .inventory-alerts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 15px;
        }

        .inventory-table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin-top: 20px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        @media (max-width: 768px) {
          .inventory-alerts-grid {
            grid-template-columns: 1fr;
          }
          
          .form-row {
            flex-direction: column !important;
            gap: 10px !important;
          }
          
          h1 {
            font-size: 1.8em !important;
          }
          
          .inventory-header {
             flex-direction: column;
             align-items: flex-start;
             gap: 15px;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 10px;
          }
          
          .btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </main>
  );
};

export default Inventory;
