import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Staff = () => {
  const [staff, setStaff] = useState([
    {
      id: 1,
      name: 'Arun Kumar',
      position: 'Head Waiter',
      department: 'Service',
      image: '👔',
      experience: '15 years'
    },
    {
      id: 2,
      name: 'Deepika Singh',
      position: 'Restaurant Manager',
      department: 'Management',
      image: '👩‍💼',
      experience: '12 years'
    },
    {
      id: 3,
      name: 'Rajiv Patel',
      position: 'Senior Waiter',
      department: 'Service',
      image: '👔',
      experience: '10 years'
    },
    {
      id: 4,
      name: 'Neha Gupta',
      position: 'Sommelier',
      department: 'Beverage',
      image: '🍷',
      experience: '8 years'
    },
    {
      id: 5,
      name: 'Vikram Singh',
      position: 'Kitchen Manager',
      department: 'Kitchen',
      image: '👨‍🍳',
      experience: '16 years'
    },
    {
      id: 6,
      name: 'Priya Sharma',
      position: 'Cashier',
      department: 'Operations',
      image: '💳',
      experience: '7 years'
    }
  ]);

  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    experience: ''
  });

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (formData.name && formData.position) {
      setStaff([...staff, {
        id: Date.now(),
        ...formData,
        image: '👔'
      }]);
      setFormData({ name: '', position: '', department: '', experience: '' });
      setShowForm(false);
    }
  };

  const handleDeleteStaff = (id) => {
    if (window.confirm('Remove this staff member?')) {
      setStaff(staff.filter(s => s.id !== id));
    }
  };

  const departments = ['Service', 'Management', 'Kitchen', 'Beverage', 'Operations'];

  return (
    <main style={{ padding: '40px 20px', minHeight: '70vh' }}>
      <div className="container">
        <h1 style={{ marginBottom: '20px', color: '#2c3e50' }}>Staff Directory</h1>

        {user && (
          <button className="btn" onClick={() => setShowForm(!showForm)} style={{ marginBottom: '30px' }}>
            {showForm ? 'Cancel' : 'Add Staff Member'}
          </button>
        )}

        {showForm && user && (
          <div className="form-container" style={{ marginBottom: '30px' }}>
            <h3>Add New Staff Member</h3>
            <form onSubmit={handleAddStaff}>
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
                  <label>Position</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    className="form-control"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
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
              <button type="submit" className="btn">Add Staff Member</button>
            </form>
          </div>
        )}

        {departments.map(dept => (
          <div key={dept} style={{ marginBottom: '40px' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px', borderBottom: '2px solid #e74c3c', paddingBottom: '10px' }}>
              {dept}
            </h2>
            <div className="staff-grid">
              {staff.filter(s => s.department === dept).map(member => (
                <div key={member.id} className="staff-card card">
                  <div style={{ fontSize: '3rem', textAlign: 'center', padding: '15px 0' }}>
                    {member.image}
                  </div>
                  <div className="card-content">
                    <h4>{member.name}</h4>
                    <p style={{ color: '#e74c3c', fontWeight: 'bold', marginBottom: '8px' }}>
                      {member.position}
                    </p>
                    <p style={{ color: '#666', marginBottom: '10px', fontSize: '0.9rem' }}>
                      <strong>Experience:</strong> {member.experience}
                    </p>
                    {user && (
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDeleteStaff(member.id)}
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .staff-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 25px;
        }
        .staff-card {
          transition: transform 0.2s;
        }
        .staff-card:hover {
          transform: translateY(-5px);
        }
        @media (max-width: 600px) {
          .staff-grid {
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

export default Staff;
