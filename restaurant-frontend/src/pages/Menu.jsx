import { useEffect, useState } from 'react';
import { menuAPI, ingredientsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Menu.css';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'main',
    ingredients: [],
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchMenu();
    if (user) {
      fetchIngredients();
    }
  }, [user]);

  const fetchIngredients = async () => {
    try {
      const response = await ingredientsAPI.getAll();
      setIngredients(response.data || []);
    } catch (err) {
      console.error('Failed to load ingredients:', err);
    }
  };

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await menuAPI.getAll();
      setMenuItems(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load menu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      ingredients: item.ingredients.map(ing => ing._id || ing),
    });
    setImagePreview(item.image ? `/${item.image}` : null);
    setShowModal(true);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to add items');
      return;
    }

    try {
      // Create FormData for file upload
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('available', formData.available || true);
      if (formData.ingredients && formData.ingredients.length > 0) {
        data.append('ingredients', JSON.stringify(formData.ingredients));
      }
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (isEditMode && editingItem) {
        // Update existing item
        await menuAPI.update(editingItem._id, data);
      } else {
        // Create new item
        await menuAPI.create(data);
      }

      setFormData({ name: '', description: '', price: '', category: 'main', ingredients: [] });
      setImageFile(null);
      setImagePreview(null);
      setIsEditMode(false);
      setEditingItem(null);
      setShowModal(false);
      fetchMenu();
    } catch (err) {
      setError(isEditMode ? 'Failed to update menu item' : 'Failed to add menu item');
      console.error(err);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await menuAPI.delete(id);
      fetchMenu();
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  if (loading) return <main className="menu-container loading">Loading menu...</main>;

  const categories = {
    appetizers: menuItems.filter(item => item.category === 'appetizers'),
    main: menuItems.filter(item => item.category === 'main'),
    desserts: menuItems.filter(item => item.category === 'desserts'),
    beverages: menuItems.filter(item => item.category === 'beverages'),
  };

  return (
    <main className="menu-container">
      <div className="menu-header">
        <h1>Our Menu</h1>
        {user && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Add Menu Item
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => { setShowModal(false); setIsEditMode(false); setEditingItem(null); }}>&times;</span>
            <h2>{isEditMode ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }} />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="main">Main Course</option>
                  <option value="appetizers">Appetizer</option>
                  <option value="desserts">Dessert</option>
                  <option value="beverages">Beverage</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ingredients</label>
                <select multiple value={formData.ingredients} onChange={(e) => setFormData({ ...formData, ingredients: [...e.target.options].filter(o => o.selected).map(o => o.value) })}>
                  {ingredients.map(ing => (
                    <option key={ing._id} value={ing._id}>{ing.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Add Item</button>
            </form>
          </div>
        </div>
      )}

      {Object.entries(categories).map(([category, items]) => (
        <section key={category} className="menu-category">
          <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
          <div className="menu-grid">
            {items.map(item => (
              <div key={item._id} className="menu-card">
                <img
                  src={item.image ? `/${item.image}` : `/${item.name.toLowerCase().replace(/\s/g, '')}.jpg`}
                  onError={(e) => { e.target.src = `/${item.name.toLowerCase().replace(/\s/g, '')}.jpeg`; }}
                  alt={item.name}
                  className="menu-card-img"
                />
                <div className="menu-card-body">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="menu-card-footer">
                    <span className="price">₹{item.price}</span>
                    {user && (
                      <>
                        <button className="btn btn-edit btn-sm" onClick={() => handleEdit(item)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteItem(item._id)}>Delete</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
};

export default Menu;

