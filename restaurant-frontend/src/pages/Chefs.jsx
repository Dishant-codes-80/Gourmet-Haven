import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Chefs = () => {
  const [chefs, setChefs] = useState([
    {
      id: 1,
      name: 'Chef Vikram Singh',
      specialty: 'North Indian Cuisine',
      experience: '20 years',
      image: '👨‍🍳',
      description: 'Expert in traditional North Indian recipes with 20 years of culinary excellence.'
    },
    {
      id: 2,
      name: 'Chef Priya Sharma',
      specialty: 'Modern Fusion',
      experience: '15 years',
      image: '👩‍🍳',
      description: 'Specializes in creating innovative fusion dishes blending traditional and modern flavors.'
    },
    {
      id: 3,
      name: 'Chef Rajesh Kumar',
      specialty: 'Tandoori & Grills',
      experience: '18 years',
      image: '👨‍🍳',
      description: 'Master of tandoor cooking, creating perfectly charred and flavored dishes.'
    },
    {
      id: 4,
      name: 'Chef Anjali Verma',
      specialty: 'Desserts & Pastry',
      experience: '12 years',
      image: '👩‍🍳',
      description: 'Creates delightful desserts and pastries that are both visually stunning and delicious.'
    }
  ]);

  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    experience: '',
    description: ''
  });

  const handleAddChef = (e) => {
    e.preventDefault();
    if (formData.name && formData.specialty) {
      setChefs([...chefs, {
        id: Date.now(),
        ...formData,
        image: formData.image || '👨‍🍳'
      }]);
      setFormData({ name: '', specialty: '', experience: '', description: '' });
      setShowForm(false);
    }
  };

  const handleDeleteChef = (id) => {
    if (window.confirm('Remove this chef?')) {
      setChefs(chefs.filter(chef => chef.id !== id));
    }
  };

  return (
    <main style={{ padding: '40px 20px', minHeight: '70vh' }}>
      <div className="container">
        <h1 style={{ marginBottom: '20px', color: '#2c3e50' }}>Our Chefs</h1>

        {user && (
          <button className="btn" onClick={() => setShowForm(!showForm)} style={{ marginBottom: '30px' }}>
            {showForm ? 'Cancel' : 'Add Chef'}
          </button>
        )}

        {showForm && user && (
          <div className="form-container" style={{ marginBottom: '30px' }}>
            <h3>Add New Chef</h3>
            <form onSubmit={handleAddChef}>
              <div className="form-group">
                <label>Name</label>
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
                  <label>Specialty</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Experience</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g., 10 years"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  required
                />
              </div>
              <button type="submit" className="btn">Add Chef</button>
            </form>
          </div>
        )}

        <div className="chef-grid">
          {chefs.map(chef => (
            <div key={chef.id} className="chef-card card">
              <div style={{ fontSize: '4rem', textAlign: 'center', padding: '20px 0' }}>
                {chef.image}
              </div>
              <div className="card-content">
                <h3>{chef.name}</h3>
                <p style={{ color: '#e74c3c', fontWeight: 'bold', marginBottom: '10px' }}>
                  {chef.specialty}
                </p>
                <p style={{ color: '#666', marginBottom: '10px', fontSize: '0.9rem' }}>
                  <strong>Experience:</strong> {chef.experience}
                </p>
                <p style={{ color: '#555', marginBottom: '15px', lineHeight: '1.5' }}>
                  {chef.description}
                </p>
                {user && (
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDeleteChef(chef.id)}
                    style={{ width: '100%' }}
                  >
                    Remove Chef
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .chef-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 25px;
        }
        .chef-card {
          transition: transform 0.2s;
        }
        .chef-card:hover {
          transform: translateY(-5px);
        }
        @media (max-width: 600px) {
          .chef-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          h1 { font-size: 2rem; }
          h2 { font-size: 1.5rem; }
        }
      `}</style>
    </main>
  );
};

export default Chefs;
