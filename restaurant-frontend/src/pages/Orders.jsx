import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, menuAPI } from '../services/api';

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  // States for Advance Ordering
  const [advanceOrder, setAdvanceOrder] = useState({ token: '', table: '', items: [], notes: '' });

  // States for Online Ordering
  const [activeTab, setActiveTab] = useState('online'); // Default to online
  const [onlineOrder, setOnlineOrder] = useState({
    customerName: '',
    email: user?.email || '',
    phone: '',
    houseNo: '',
    area: '',
    landmark: '',
    instructions: '',
    items: []
  });


  const [menuItems, setMenuItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState('Processing...');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showSecureCheckout, setShowSecureCheckout] = useState(false);
  const [secureOrderData, setSecureOrderData] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchMenuItems();
    if (user && user.role === 'admin') {
      fetchOrders();
    } else {
      setLoading(false);
    }

    // Check for Stripe redirect success
    const params = new URLSearchParams(window.location.search);
    if (params.get('stripe_success') === 'true') {
      setOrderSuccess(true);
      setIsProcessing(true);
      setProcessingText('Verifying Payment...');
      setTimeout(() => {
        setOrderSuccess(false);
        setIsProcessing(false);
        // Clean URL
        window.history.replaceState({}, document.title, "/orders");
      }, 3000);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      // Use mock data for non-admin users, call API for admin
      if (user && user.role === 'admin') {
        const response = await ordersAPI.getAll();
        setOrders(response.data || []);
      } else {
        // Mock orders data for non-admin view
        const mockOrders = [
          {
            _id: 1,
            customer: 'Rajesh Sharma',
            items: 'Butter Chicken, Garlic Naan, Mango Lassi',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'Completed',
            total: 850,
            table: 5,
            phone: '9999999999',
            paymentStatus: 'Paid',
            paymentMethod: 'Card',
            notes: 'No onions',
          },
          {
            _id: 2,
            customer: 'Priya Patel',
            items: 'Paneer Tikka, Biryani, Gulab Jamun',
            createdAt: new Date(Date.now() - 2700000).toISOString(),
            status: 'Completed',
            total: 920,
            table: 2,
            phone: '9888888888',
            paymentStatus: 'Paid',
            paymentMethod: 'Cash',
            notes: '',
          },
          {
            _id: 3,
            customer: 'Vikram Malhotra',
            items: 'Dal Makhani, Butter Naan, Masala Chai',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            status: 'Ready',
            total: 520,
            table: 8,
            phone: '9777777777',
            paymentStatus: 'Pending',
            paymentMethod: 'UPI',
            notes: 'Extra butter naan',
          },
          {
            _id: 4,
            customer: 'Anjali Desai',
            items: 'Chicken Biryani, Raita, Kheer',
            createdAt: new Date(Date.now() - 900000).toISOString(),
            status: 'Preparing',
            total: 680,
            table: 3,
            phone: '9666666666',
            paymentStatus: 'Pending',
            paymentMethod: 'Card',
            notes: '',
          },
          {
            _id: 5,
            customer: 'Amit Verma',
            items: 'Chole Bhature, Lassi, Rasmalai',
            createdAt: new Date().toISOString(),
            status: 'Pending',
            total: 450,
            table: 6,
            phone: '9555555555',
            paymentStatus: 'Pending',
            paymentMethod: 'Cash',
            notes: '',
          },
          {
            _id: 6,
            customer: 'Suresh Kumar',
            items: 'Rogan Josh, Basmati Rice, Masala Chai',
            createdAt: new Date(Date.now() - 600000).toISOString(),
            status: 'Pending',
            total: 750,
            table: 7,
            phone: '9444444444',
            paymentStatus: 'Pending',
            paymentMethod: 'UPI',
            notes: 'Less spicy',
          },
          {
            _id: 7,
            customer: 'Meera Singh',
            items: 'Palak Paneer, Naan, Dessert',
            createdAt: new Date(Date.now() - 300000).toISOString(),
            status: 'Preparing',
            total: 620,
            table: 1,
            phone: '9333333333',
            paymentStatus: 'Paid',
            paymentMethod: 'Card',
            notes: '',
          },
          {
            _id: 8,
            customer: 'Rohit Patel',
            items: 'Chicken Tikka Masala, Rice, Lassi',
            createdAt: new Date(Date.now() - 150000).toISOString(),
            status: 'Ready',
            total: 890,
            table: 4,
            phone: '9222222222',
            paymentStatus: 'Pending',
            paymentMethod: 'Cash',
            notes: 'Extra sauce',
          },
          {
            _id: 9,
            customer: 'Neha Kapoor',
            items: 'Tandoori Chicken, Naan, Raita',
            createdAt: new Date(Date.now() - 480000).toISOString(),
            status: 'Preparing',
            total: 780,
            table: 9,
            phone: '9111111111',
            paymentStatus: 'Paid',
            paymentMethod: 'Card',
            notes: 'Light spice',
          },
          {
            _id: 10,
            customer: 'Deepak Singh',
            items: 'Samosas, Chaat, Lassi',
            createdAt: new Date(Date.now() - 420000).toISOString(),
            status: 'Pending',
            total: 380,
            table: 10,
            phone: '9000000000',
            paymentStatus: 'Pending',
            paymentMethod: 'UPI',
            notes: '',
          },
          {
            _id: 11,
            customer: 'Isha Sharma',
            items: 'Biryani, Raita, Kheer',
            createdAt: new Date(Date.now() - 360000).toISOString(),
            status: 'Completed',
            total: 695,
            table: 11,
            phone: '9222233333',
            paymentStatus: 'Paid',
            paymentMethod: 'Card',
            notes: 'No salt',
          },
          {
            _id: 12,
            customer: 'Arjun Nair',
            items: 'Kebabs, Rice, Dessert',
            createdAt: new Date(Date.now() - 240000).toISOString(),
            status: 'Preparing',
            total: 650,
            table: 5,
            phone: '9333344444',
            paymentStatus: 'Pending',
            paymentMethod: 'Card',
            notes: '',
          },
          {
            _id: 13,
            customer: 'Pooja Gupta',
            items: 'Vegetable Biryani, Raita',
            createdAt: new Date(Date.now() - 120000).toISOString(),
            status: 'Pending',
            total: 520,
            table: 2,
            phone: '9444455555',
            paymentStatus: 'Pending',
            paymentMethod: 'Cash',
            notes: 'Vegan',
          },
        ];
        setOrders(mockOrders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      const fallbackOrders = [
        {
          _id: 1,
          customer: 'Rajesh Sharma',
          items: 'Butter Chicken, Garlic Naan',
          createdAt: new Date().toISOString(),
          status: 'Pending',
          total: 850,
          table: 5,
          phone: '9999999999',
          paymentStatus: 'Pending',
          paymentMethod: 'Cash',
          notes: '',
        },
      ];
      setOrders(fallbackOrders);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await menuAPI.getAll();
      setMenuItems(response.data || []);
    } catch (err) {
      console.error('Failed to load menu:', err);
      // Fallback mock menu
      setMenuItems([
        { _id: '1', name: 'Butter Chicken', price: 350, category: 'Main Course' },
        { _id: '2', name: 'Paneer Tikka', price: 280, category: 'Appetizers' },
        { _id: '3', name: 'Garlic Naan', price: 60, category: 'Breads' },
        { _id: '4', name: 'Mango Lassi', price: 120, category: 'Beverages' },
      ]);
    }
  };

  // Shared order handlers
  const handleAddItem = (item) => {
    const currentOrder = activeTab === 'advance' ? advanceOrder : onlineOrder;
    const setOrder = activeTab === 'advance' ? setAdvanceOrder : setOnlineOrder;

    const existingItemIndex = currentOrder.items.findIndex(cartItem => cartItem._id === item._id);
    if (existingItemIndex >= 0) {
      const updatedItems = [...currentOrder.items];
      updatedItems[existingItemIndex].quantity += 1;
      setOrder({ ...currentOrder, items: updatedItems });
    } else {
      setOrder({ ...currentOrder, items: [...currentOrder.items, { ...item, quantity: 1 }] });
    }
  };

  const handleRemoveItem = (index) => {
    const currentOrder = activeTab === 'advance' ? advanceOrder : onlineOrder;
    const setOrder = activeTab === 'advance' ? setAdvanceOrder : setOnlineOrder;
    setOrder({
      ...currentOrder,
      items: currentOrder.items.filter((_, i) => i !== index)
    });
  };

  const handleQuantityChange = (index, quantity) => {
    const currentOrder = activeTab === 'advance' ? advanceOrder : onlineOrder;
    const setOrder = activeTab === 'advance' ? setAdvanceOrder : setOnlineOrder;
    setOrder({
      ...currentOrder,
      items: currentOrder.items.map((item, i) => i === index ? { ...item, quantity: parseInt(quantity) || 1 } : item)
    });
  };

  const calculateSubtotal = () => {
    const currentOrder = activeTab === 'advance' ? advanceOrder : onlineOrder;
    return currentOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() * 1.05; // 5% GST
  };

  const downloadBill = async (orderId) => {
    try {
      const billRes = await ordersAPI.getBill(orderId);
      const url = window.URL.createObjectURL(new Blob([billRes.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill-${orderId.slice(-8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (pdfErr) {
      console.error('Failed to download bill PDF:', pdfErr);
    }
  };

  const handleSubmitAdvanceOrder = async (e) => {
    if (e) e.preventDefault();
    if (!advanceOrder.token || !advanceOrder.table || advanceOrder.items.length === 0) {
      setError('Please fill all required fields and select items');
      return;
    }

    const payload = {
      customer: 'Advance Order Customer',
      email: user?.email || '',
      items: advanceOrder.items.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      table: advanceOrder.table,
      total: calculateTotal(),
      token: advanceOrder.token,
      orderType: 'Advance',
      notes: advanceOrder.notes,
    };

    try {
      setIsProcessing(true);
      setProcessingText('Confirming Order...');

      const response = await ordersAPI.create(payload);

      // Artificial delay for "Confirming Order" UX
      await new Promise(resolve => setTimeout(resolve, 2000));

      setOrderSuccess(true);
      await downloadBill(response.data._id);

      setTimeout(() => {
        setOrderSuccess(false);
        setIsProcessing(false);
        setShowForm(false);
        setAdvanceOrder({ token: '', table: '', items: [], notes: '' });
      }, 3000);

    } catch (err) {
      setError('Failed to place advance order');
      console.error(err);
      setIsProcessing(false);
    }
  };

  // Online Order Handlers
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse Geocoding using Nominatim
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();

          if (data.address) {
            const addr = data.address;
            const house = addr.house_number || addr.building || '';
            const road = addr.road || addr.suburb || '';
            const areaName = addr.neighbourhood || addr.city_district || addr.city || '';

            setOnlineOrder(prev => ({
              ...prev,
              houseNo: house,
              area: `${road}${road && areaName ? ', ' : ''}${areaName}`,
              landmark: addr.amenity || addr.landmark || ''
            }));
          } else {
            setOnlineOrder(prev => ({ ...prev, area: `${latitude}, ${longitude}` }));
          }
        } catch (err) {
          setOnlineOrder(prev => ({ ...prev, area: `${latitude}, ${longitude}` }));
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error(err);
        alert("Unable to retrieve your location");
        setIsLocating(false);
      }
    );
  };

  const finalizeOnlineOrder = async (paymentData = {}) => {
    const fullAddress = [
      onlineOrder.houseNo,
      onlineOrder.area,
      onlineOrder.landmark ? `(Landmark: ${onlineOrder.landmark})` : ''
    ].filter(Boolean).join(', ');

    const payload = {
      customer: onlineOrder.customerName,
      email: onlineOrder.email,
      customerPhone: onlineOrder.phone,
      deliveryAddress: fullAddress,
      instructions: onlineOrder.instructions,
      items: onlineOrder.items.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: calculateTotal(),
      orderType: 'Online',
      paymentMethod: paymentData.method || 'Razorpay',
      razorpayOrderId: paymentData.orderId,
      razorpayPaymentId: paymentData.paymentId,
    };

    try {
      setIsProcessing(true);
      setProcessingText('Confirming Order...');

      const res = await ordersAPI.create(payload);

      // Delay for UX
      await new Promise(resolve => setTimeout(resolve, 2500));

      setOrderSuccess(true);
      await downloadBill(res.data._id);

      setTimeout(() => {
        setOrderSuccess(false);
        setIsProcessing(false);
        setShowForm(false);
        setOnlineOrder({
          customerName: '',
          email: user?.email || '',
          phone: '',
          houseNo: '',
          area: '',
          landmark: '',
          instructions: '',
          items: []
        });
      }, 3000);
    } catch (err) {
      console.error('Order Finalization Error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to save order');
      setIsProcessing(false);
    }
  };

  const validateForm = () => {
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!onlineOrder.customerName || !onlineOrder.phone || !onlineOrder.houseNo || !onlineOrder.area || onlineOrder.items.length === 0) {
      setError('Please fill all required fields and select items');
      return false;
    }

    if (!phoneRegex.test(onlineOrder.phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }

    if (onlineOrder.email && !emailRegex.test(onlineOrder.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleRazorpayCheckout = async () => {
    if (!validateForm()) return;

    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingText('Initiating Payment...');

      const { data: razorpayOrder } = await ordersAPI.createRazorpayOrder(calculateTotal());

      // If backend is in Simulation Mode, show the Secure Checkout instead of failing
      if (razorpayOrder.mock) {
        setSecureOrderData(razorpayOrder);
        setShowSecureCheckout(true);
        setIsProcessing(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Gourmet Haven',
        description: 'Online Food Order',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          await finalizeOnlineOrder({
            method: 'Razorpay',
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id
          });
        },
        prefill: {
          name: onlineOrder.customerName,
          email: onlineOrder.email,
          contact: onlineOrder.phone,
        },
        theme: {
          color: '#e74c3c',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      setError('Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  const handleSecurePayment = async (cardData) => {
    setShowSecureCheckout(false);
    setIsProcessing(true);
    setProcessingText('Verifying Payment...');

    // Simulate Razorpay processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    await finalizeOnlineOrder({
      method: 'Razorpay',
      orderId: secureOrderData.id,
      paymentId: `pay_${Date.now()}`
    });
    setIsProcessing(false);
  };

  const handlePODCheckout = async () => {
    if (!validateForm()) return;
    await finalizeOnlineOrder({ method: 'POD' });
  };

  // Admin actions
  const handleStatusChange = async (id, newStatus) => {
    try {
      await ordersAPI.updateStatus(id, newStatus);
      fetchOrders();
    } catch (err) {
      setError('Failed to update status');
      console.error(err);
    }
  };

  const handlePaymentToggle = async (id, order) => {
    const newStatus = order.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
    try {
      await ordersAPI.updatePayment(id, newStatus, order.paymentMethod);
      fetchOrders();
    } catch (err) {
      setError('Failed to update payment');
      console.error(err);
    }
  };

  const handleChangePaymentMethod = async (id, method, order) => {
    try {
      await ordersAPI.updatePayment(id, order.paymentStatus, method);
      fetchOrders();
    } catch (err) {
      setError('Failed to update payment method');
      console.error(err);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await ordersAPI.delete(id);
      fetchOrders();
    } catch (err) {
      setError('Failed to delete order');
      console.error(err);
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status.toLowerCase() === filterStatus.toLowerCase());

  const menuCategories = menuItems.reduce((acc, item) => {
    const category = item.category || 'main'; // Default for uncategorized items
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const categoryDisplayNames = {
    appetizers: 'Appetizers',
    main: 'Main Courses',
    breads: 'Breads',
    desserts: 'Desserts',
    beverages: 'Beverages',
  };

  return (
    <main className="orders-page">
      <div className="container">
        <h1 className="page-title">Order Food Online</h1>

        {error && <div className="error-message">{error}</div>}

        {(!user || user.role !== 'admin') && (
          <div className="order-section">
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'online' ? 'active' : ''}`}
                onClick={() => { setActiveTab('online'); setShowForm(false); }}
              >
                🚚 Online Delivery
              </button>
              <button
                className={`tab-btn ${activeTab === 'advance' ? 'active' : ''}`}
                onClick={() => { setActiveTab('advance'); setShowForm(false); }}
              >
                📅 Advance Booking
              </button>
            </div>

            <div className={`tab-content ${activeTab}`}>
              {activeTab === 'online' ? (
                <div className="info-box">
                  <h3>Fast & Secure Delivery</h3>
                  <p>Get your favorite dishes delivered to your doorstep in minutes!</p>
                  {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                      Order Online Now
                    </button>
                  )}
                </div>
              ) : (
                <div className="info-box">
                  <h3>Dine-in Excellence</h3>
                  <p>Use your reservation token to order ahead and skip the wait.</p>
                  {!showForm && (
                    <button className="btn btn-secondary" onClick={() => setShowForm(true)}>
                      Book Advance Order
                    </button>
                  )}
                </div>
              )}

              {showForm && (
                <div className="order-form-container">
                  <div className="order-layout">
                    {/* Menu Selection Left */}
                    <div className="menu-selection">
                      <h3 className="sub-title">Select Items</h3>
                      {Object.entries(menuCategories).map(([category, items]) => (
                        items.length > 0 && (
                          <div key={category} className="menu-cat">
                            <h4>{categoryDisplayNames[category.toLowerCase()] || category}</h4>
                            <div className="items-grid">
                              {items.map(item => (
                                <div key={item._id} className="item-card">
                                  <span className="name">{item.name}</span>
                                  <span className="price">₹{item.price}</span>
                                  <button onClick={() => handleAddItem(item)} className="add-btn">Add</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>

                    {/* Form & Cart Right */}
                    <div className="order-details">
                      <div className="cart-summary">
                        <h3>Your Order</h3>
                        {activeTab === 'advance' ? (
                          advanceOrder.items.length === 0 ? (
                            <p className="empty-cart">Cart is empty</p>
                          ) : (
                            <CartList items={advanceOrder.items} onQtyChange={handleQuantityChange} onRemove={handleRemoveItem} />
                          )
                        ) : (
                          onlineOrder.items.length === 0 ? (
                            <p className="empty-cart">Cart is empty</p>
                          ) : (
                            <CartList items={onlineOrder.items} onQtyChange={handleQuantityChange} onRemove={handleRemoveItem} />
                          )
                        )}

                        <div className="totals">
                          <div className="row"><span>Subtotal</span><span>₹{calculateSubtotal().toFixed(0)}</span></div>
                          <div className="row"><span>GST (5%)</span><span>₹{(calculateSubtotal() * 0.05).toFixed(0)}</span></div>
                          <div className="row grand-total"><span>Total</span><span>₹{calculateTotal().toFixed(0)}</span></div>
                        </div>
                      </div>

                      <div className="checkout-form">
                        <h3>{activeTab === 'online' ? 'Delivery Details' : 'Reservation Details'}</h3>
                        {activeTab === 'online' ? (
                          <div className="form-fields">
                            <div className="basic-info-grid">
                              <div className="input-group">
                                <label>Full Name</label>
                                <input
                                  type="text"
                                  placeholder="Enter your name"
                                  className="large-input"
                                  value={onlineOrder.customerName}
                                  onChange={(e) => setOnlineOrder({ ...onlineOrder, customerName: e.target.value })}
                                />
                              </div>
                              <div className="input-group">
                                <label>Mobile Number</label>
                                <input
                                  type="tel"
                                  placeholder="10-digit number"
                                  className="large-input"
                                  value={onlineOrder.phone}
                                  maxLength="10"
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 10) setOnlineOrder({ ...onlineOrder, phone: val });
                                  }}
                                />
                              </div>
                            </div>
                            <div className="input-group full-width">
                              <label>Email ID (for e-bill)</label>
                              <input
                                type="email"
                                placeholder="example@mail.com"
                                className="large-input"
                                value={onlineOrder.email}
                                onChange={(e) => setOnlineOrder({ ...onlineOrder, email: e.target.value })}
                              />
                            </div>

                            <div className="address-container">
                              <div className="address-grid">
                                <div className="addr-box">
                                  <label>House / Flat / Floor No</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Flat 101, 1st Floor"
                                    value={onlineOrder.houseNo}
                                    onChange={(e) => setOnlineOrder({ ...onlineOrder, houseNo: e.target.value })}
                                  />
                                </div>
                                <div className="addr-box highlight">
                                  <label>Area / Street / Sector</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Park Avenue, Sector 5"
                                    value={onlineOrder.area}
                                    onChange={(e) => setOnlineOrder({ ...onlineOrder, area: e.target.value })}
                                  />
                                </div>
                                <div className="addr-box">
                                  <label>Landmark</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Near ICICI Bank"
                                    value={onlineOrder.landmark}
                                    onChange={(e) => setOnlineOrder({ ...onlineOrder, landmark: e.target.value })}
                                  />
                                </div>
                                <div className="addr-box">
                                  <label>Instructions (Optional)</label>
                                  <textarea
                                    placeholder="e.g. Ring the bell on red gate"
                                    value={onlineOrder.instructions}
                                    onChange={(e) => setOnlineOrder({ ...onlineOrder, instructions: e.target.value })}
                                  ></textarea>
                                </div>
                              </div>

                              <div className="location-sidebar">
                                <button
                                  className="loc-btn-large"
                                  onClick={handleUseCurrentLocation}
                                  disabled={isLocating}
                                >
                                  {isLocating ? (
                                    <>
                                      <div className="small-spinner"></div>
                                      <span>Finding...</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="icon">📍</span>
                                      <span className="text">USE CURRENT LOCATION</span>
                                    </>
                                  )}
                                </button>
                                <p className="loc-hint">Auto-fills address from your GPS</p>
                              </div>
                            </div>

                            <div className="payment-options">
                              <button
                                className="btn pay-online-btn"
                                onClick={handleRazorpayCheckout}
                                disabled={isProcessing}
                              >
                                {isProcessing ? 'Please wait...' : `Pay ₹${calculateTotal().toFixed(0)} Online`}
                              </button>
                              <div className="or-divider">OR</div>
                              <button
                                className="btn pod-btn"
                                onClick={handlePODCheckout}
                                disabled={isProcessing}
                              >
                                Pay on Delivery
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="reservation-form">
                            <div className="reservation-grid">
                              <input
                                type="text"
                                placeholder="Reservation Token"
                                value={advanceOrder.token}
                                onChange={(e) => setAdvanceOrder({ ...advanceOrder, token: e.target.value })}
                              />
                              <input
                                type="text"
                                placeholder="Table Number (e.g. T-01)"
                                value={advanceOrder.table}
                                onChange={(e) => setAdvanceOrder({ ...advanceOrder, table: e.target.value })}
                              />
                              <textarea
                                placeholder="Special Notes"
                                value={advanceOrder.notes}
                                onChange={(e) => setAdvanceOrder({ ...advanceOrder, notes: e.target.value })}
                              ></textarea>
                            </div>

                            <div className="reservation-actions">
                              <button
                                className="btn btn-success place-btn"
                                disabled={isProcessing || advanceOrder.items.length === 0}
                                onClick={handleSubmitAdvanceOrder}
                              >
                                {isProcessing ? 'Processing...' : 'Place Advance Order'}
                              </button>
                              <button className="btn back-btn" onClick={() => setShowForm(false)}>
                                Back
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading & Success Overlays */}
        {isProcessing && (
          <div className="processing-overlay">
            <div className="loader-content">
              {!orderSuccess ? (
                <>
                  <div className="spin-loader"></div>
                  <p>{processingText}</p>
                </>
              ) : (
                <>
                  <div className="success-tick">
                    <svg viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="25" fill="none" />
                      <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                    </svg>
                  </div>
                  <p>Order Placed Successfully!</p>
                  <span className="sub-p">Bill is being downloaded...</span>
                </>
              )}
            </div>
          </div>
        )}

        {showSecureCheckout && secureOrderData && (
          <SecureCheckoutOverlay
            order={secureOrderData}
            onPay={handleSecurePayment}
            onClose={() => setShowSecureCheckout(false)}
          />
        )}


        {user && user.role === 'admin' && (
          <div className="admin-section">
            <h2 className="section-title">Order Management (Admin)</h2>
            <div className="admin-filters">
              <button
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All Orders
              </button>
              <button
                className={`filter-btn ${filterStatus === 'Pending' ? 'active' : ''}`}
                onClick={() => setFilterStatus('Pending')}
              >
                Pending
              </button>
              <button
                className={`filter-btn ${filterStatus === 'Preparing' ? 'active' : ''}`}
                onClick={() => setFilterStatus('Preparing')}
              >
                Preparing
              </button>
              <button
                className={`filter-btn ${filterStatus === 'Ready' ? 'active' : ''}`}
                onClick={() => setFilterStatus('Ready')}
              >
                Ready
              </button>
              <button
                className={`filter-btn ${filterStatus === 'Completed' ? 'active' : ''}`}
                onClick={() => setFilterStatus('Completed')}
              >
                Completed
              </button>
            </div>

            <div className="order-grid">
              {filteredOrders.length === 0 ? (
                <p>No orders found.</p>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order._id} className={`order-card ${order.status.toLowerCase()}`}>
                    <div className="card-header">
                      <span className="order-id">#{order._id.toString().slice(-6)}</span>
                      <span className="order-type-badge">{order.orderType}</span>
                      <span className="order-time">{new Date(order.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="card-body">
                      <h4 className="customer-name">{order.customer}</h4>
                      <p className="contact">📞 {order.customerPhone || order.phone}</p>
                      {order.email && <p className="contact">📧 {order.email}</p>}
                      {order.deliveryAddress && <p className="address">📍 {order.deliveryAddress}</p>}
                      {order.instructions && <p className="notes">📝 {order.instructions}</p>}
                      {order.table && <p className="table">🪑 Table: {order.table}</p>}
                      <div className="items-list">
                        {order.items && order.items.map((item, i) => (
                          <div key={i} className="item-row">
                            <span>{item.name} x {item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-total">Total: ₹{order.total.toFixed(0)}</div>
                      {order.notes && <p className="notes">📝 {order.notes}</p>}
                    </div>
                    <div className="card-footer">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="status-select"
                      >
                        <option>Pending</option>
                        <option>Preparing</option>
                        <option>Ready</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                      </select>
                      <button className="del-btn" onClick={() => handleDeleteOrder(order._id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .orders-page { padding: 40px 0; background-color: #f4f7f6; min-height: 100vh; }
        .page-title { text-align: center; margin-bottom: 40px; color: #2c3e50; font-size: 2.5rem; }
        .error-message { background: #fdeaea; color: #e74c3c; padding: 12px; border-radius: 6px; margin-bottom: 20px; text-align: center; }
        
        /* Tabs */
        .tabs { display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; }
        .tab-btn { padding: 12px 24px; border: none; border-radius: 30px; background: #fff; cursor: pointer; font-weight: 600; font-size: 1rem; color: #7f8c8d; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: all 0.3s; }
        .tab-btn.active { background: #e74c3c; color: #fff; transform: translateY(-2px); box-shadow: 0 6px 12px rgba(231, 76, 60, 0.2); }
        
        .info-box { text-align: center; background: #fff; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-bottom: 30px; }
        .info-box h3 { margin-bottom: 15px; color: #2c3e50; }
        .info-box p { color: #7f8c8d; margin-bottom: 25px; }

        /* Order Form Layout */
        .order-layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; }
        
        .menu-selection { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .sub-title { margin-bottom: 20px; border-bottom: 2px solid #f1f1f1; padding-bottom: 10px; }
        .menu-cat { margin-bottom: 25px; }
        .menu-cat h4 { color: #e74c3c; margin-bottom: 15px; font-size: 1.1rem; }
        .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
        .item-card { border: 1px solid #f1f1f1; padding: 12px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .item-card .name { font-weight: 600; font-size: 0.9rem; margin-bottom: 5px; }
        .item-card .price { color: #27ae60; font-weight: 700; font-size: 0.85rem; margin-bottom: 10px; }
        .add-btn { background: #3498db; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }

        .order-details { position: sticky; top: 100px; display: flex; flex-direction: column; gap: 20px; }
        .cart-summary, .checkout-form { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .empty-cart { text-align: center; color: #bdc3c7; padding: 20px; }
        
        .cart-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f9f9f9; }
        .cart-row .item-n { font-weight: 600; font-size: 0.9rem; }
        .cart-info { display: flex; flex-direction: column; }
        .cart-row .item-p { font-size: 0.8rem; color: #7f8c8d; }
        .cart-controls { display: flex; align-items: center; gap: 8px; }
        .qty-in { width: 45px; padding: 4px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.85rem; }
        .rem-btn { background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 1.2rem; }

        .totals { margin-top: 20px; border-top: 2px solid #f1f1f1; padding-top: 15px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 8px; color: #7f8c8d; font-size: 0.9rem; }
        .grand-total { border-top: 1px dashed #ddd; padding-top: 8px; font-weight: 800; font-size: 1.2rem; color: #2c3e50; }

        .input-group { display: flex; flex-direction: column; gap: 6px; }
        .input-group label { font-size: 0.75rem; font-weight: 700; color: #7f8c8d; text-transform: uppercase; letter-spacing: 0.5px; }
        .large-input { padding: 15px !important; font-size: 1.1rem !important; font-weight: 500; border: 2px solid #eee !important; transition: all 0.3s !important; }
        .large-input:focus { border-color: #e74c3c !important; box-shadow: 0 0 0 4px rgba(231, 76, 60, 0.1); }
        .full-width { grid-column: 1 / -1; }

        .basic-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        
        .address-container { display: flex; gap: 15px; margin-top: 10px; align-items: stretch; }
        .address-grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        
        .addr-box { display: flex; flex-direction: column; gap: 6px; }
        .addr-box label { font-size: 0.7rem; font-weight: 700; color: #95a5a6; text-transform: uppercase; }
        .addr-box input, .addr-box textarea { padding: 12px !important; font-size: 0.9rem !important; border: 1.5px solid #eee !important; border-radius: 8px !important; }
        .addr-box.highlight label { color: #e74c3c; }
        .addr-box textarea { min-height: 70px !important; height: 70px; resize: none; }
        
        /* Reservation Form */
        .reservation-form { display: flex; flex-direction: column; gap: 20px; }
        .reservation-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .reservation-grid input, .reservation-grid textarea { padding: 12px !important; font-size: 0.95rem !important; border: 1.5px solid #eee !important; border-radius: 8px !important; }
        .reservation-grid textarea { grid-column: 1 / -1; min-height: 90px !important; resize: none; }
        .reservation-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
        .place-btn { width: 100%; padding: 16px !important; font-size: 1.1rem !important; font-weight: 700 !important; border-radius: 8px !important; background: #27ae60 !important; border: none !important; color: white !important; cursor: pointer; transition: all 0.3s; }
        .place-btn:hover { background: #219150 !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3); }
        .place-btn:disabled { background: #bdc3c7 !important; cursor: not-allowed; transform: none; }
        .back-btn { width: 100%; padding: 12px !important; background: transparent !important; color: #7f8c8d !important; border: 1.5px solid #ddd !important; border-radius: 8px !important; font-weight: 600 !important; cursor: pointer; transition: all 0.2s; }
        .back-btn:hover { background: #f9f9f9 !important; border-color: #bdc3c7 !important; }
        
        .location-sidebar { flex: 0 0 140px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #fff9f9; border: 1px dashed #e74c3c; border-radius: 10px; padding: 12px; text-align: center; }
        .loc-btn-large { background: #e74c3c; color: #fff; border: none; padding: 15px 10px; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all 0.2s; width: 100%; box-shadow: 0 4px 10px rgba(231, 76, 60, 0.2); }
        .loc-btn-large:hover { background: #c0392b; transform: translateY(-2px); }
        .loc-btn-large:active { transform: translateY(0); }
        .loc-btn-large:disabled { background: #bdc3c7; cursor: not-allowed; box-shadow: none; }
        .loc-btn-large .icon { font-size: 1.4rem; }
        .loc-btn-large .text { font-size: 0.75rem; font-weight: 800; line-height: 1.1; }
        .loc-hint { font-size: 0.65rem; color: #95a5a6; margin-top: 10px; line-height: 1.3; }

        .small-spinner { width: 18px; height: 18px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }

        .payment-options { display: flex; flex-direction: column; gap: 12px; margin-top: 25px; }
        .pay-online-btn { width: 100%; padding: 18px; background: #e74c3c; color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: all 0.3s; margin-bottom: 5px; box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3); }
.pay-online-btn:hover { background: #c0392b; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4); }
.pod-btn { width: 100%; padding: 15px; background: white; color: #2c3e50; border: 2px solid #bdc3c7; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .pod-btn:hover { background: #2c3e50; color: white; }

        .or-divider { text-align: center; color: #bdc3c7; font-size: 0.85rem; font-weight: 800; position: relative; padding: 15px 0; }
        .or-divider::before, .or-divider::after { content: ''; position: absolute; top: 50%; width: 42%; height: 1px; background: #eee; }
        .or-divider::before { left: 0; }
        .or-divider::after { right: 0; }

        .back-centered { text-align: center; margin-top: 25px; }

        /* Overlays */
        .processing-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.98); display: flex; justify-content: center; align-items: center; z-index: 9999; }
        .loader-content { text-align: center; }
        .spin-loader { border: 5px solid #f3f3f3; border-top: 5px solid #e74c3c; border-radius: 50%; width: 60px; height: 60px; animation: spin 1s linear infinite; margin: 0 auto 25px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        .success-tick { width: 100px; height: 100px; margin: 0 auto 25px; }
        .success-tick circle { stroke: #2ecc71; stroke-width: 2; stroke-dasharray: 157; stroke-dashoffset: 157; animation: tick-circle 0.6s ease-in-out forwards; fill: none; }
        .success-tick path { stroke: #2ecc71; stroke-width: 3; stroke-dasharray: 48; stroke-dashoffset: 48; animation: tick-path 0.3s 0.6s ease-in-out forwards; fill: none; }
        @keyframes tick-circle { 100% { stroke-dashoffset: 0; } }
        @keyframes tick-path { 100% { stroke-dashoffset: 0; } }
        
        .loader-content p { font-size: 1.8rem; color: #2c3e50; font-weight: 800; margin: 0; }
        .sub-p { display: block; color: #7f8c8d; font-size: 1rem; margin-top: 10px; }

        /* Professional Checkout */
        .razorpay-secure-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .razorpay-secure-modal { background: #fff; width: 360px; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        .rzp-header { background: #2c3e50; color: #fff; padding: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
        .rzp-merchant { font-weight: 700; font-size: 1.1rem; }
        .rzp-desc { font-size: 0.8rem; opacity: 0.8; margin-top: 4px; }
        .rzp-amount { font-weight: 700; font-size: 1.2rem; }
        .rzp-body { padding: 25px; position: relative; }
        .rzp-test-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #f1c40f; color: #000; font-size: 0.65rem; font-weight: 800; padding: 4px 12px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .rzp-input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
        .rzp-input-group label { font-size: 0.7rem; font-weight: 700; color: #95a5a6; text-transform: uppercase; }
        .rzp-input-group input { padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; color: #2c3e50; transition: border-color 0.2s; }
        .rzp-input-group input:focus { border-color: #3498db; outline: none; }
        .rzp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .rzp-pay-btn { width: 100%; background: #3498db; color: #fff; border: none; padding: 15px; border-radius: 4px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: background 0.2s; margin-top: 10px; }
        .rzp-pay-btn:hover { background: #2980b9; }
        .rzp-hint { font-size: 0.8rem; color: #bdc3c7; text-align: center; margin-top: 15px; }
        .rzp-close-btn { position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 1.5rem; color: #fff; cursor: pointer; line-height: 1; }

        /* Admin UI */
        .admin-section { margin-top: 60px; }
        .admin-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px; }
        .filter-btn { padding: 10px 22px; border: none; border-radius: 8px; background: #fff; cursor: pointer; color: #7f8c8d; font-weight: 600; transition: all 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .filter-btn.active { background: #3498db; color: #fff; box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3); }
        
        .order-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
        .order-card { background: #fff; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); padding: 25px; border-left: 6px solid #ddd; transition: transform 0.2s; }
        .order-card:hover { transform: translateY(-5px); }
        .order-card.pending { border-left-color: #f1c40f; }
        .order-card.preparing { border-left-color: #3498db; }
        .order-card.ready { border-left-color: #2ecc71; }
        .order-card.completed { border-left-color: #27ae60; opacity: 0.9; }
        
        .card-header { display: flex; justify-content: space-between; margin-bottom: 20px; align-items: center; border-bottom: 1px solid #f9f9f9; padding-bottom: 15px; }
        .order-id { font-weight: 800; color: #95a5a6; font-family: monospace; }
        .order-type-badge { font-size: 0.8rem; padding: 4px 12px; border-radius: 20px; background: #ebf5fb; color: #2980b9; font-weight: 700; }
        .order-time { font-size: 0.85rem; color: #bdc3c7; }
        
        .customer-name { margin-bottom: 8px; color: #2c3e50; font-size: 1.2rem; }
        .contact, .address, .table { font-size: 0.95rem; color: #7f8c8d; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .order-card .items-list { margin: 20px 0; padding: 15px; background: #fcfcfc; border-radius: 10px; border: 1px solid #f5f5f5; }
        .item-row { display: flex; justify-content: space-between; font-size: 0.95rem; margin-bottom: 6px; }
        .order-total { font-weight: 800; color: #e74c3c; text-align: right; margin-top: 15px; font-size: 1.2rem; }
        .notes { font-size: 0.9rem; background: #fff9e6; padding: 12px; border-radius: 8px; margin-top: 15px; font-style: italic; border-left: 3px solid #f1c40f; }
        
        .card-footer { display: flex; gap: 12px; margin-top: 25px; }
        .status-select { flex: 1; padding: 10px; border-radius: 8px; border: 1.5px solid #eee; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
        .del-btn { background: #fdeaea; color: #e74c3c; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .del-btn:hover { background: #e74c3c; color: #fff; }

        @media (max-width: 900px) {
          .order-layout { grid-template-columns: 1fr; }
          .order-details { position: static; }
          .page-title { font-size: 2.2rem; }
          .address-container { flex-direction: column-reverse; }
          .location-sidebar { flex: none; width: 100%; border-style: solid; box-sizing: border-box; }
        }
        @media (max-width: 600px) {
          .tabs { flex-direction: column; width: 100%; gap: 10px; }
          .tab-btn { width: 100%; }
          .basic-info-grid, .address-grid, .reservation-grid { grid-template-columns: 1fr; gap: 10px; }
          .order-grid { grid-template-columns: 1fr; }
          .container { padding: 0 15px; }
          .item-card { padding: 15px; }
          .pay-online-btn { font-size: 1rem; padding: 15px; }
          .razorpay-secure-modal { width: 92%; max-width: 380px; }
          .page-title { font-size: 1.8rem; margin-bottom: 25px; }
          .items-grid { grid-template-columns: 1fr; gap: 15px; }
          .item-card { flex-direction: row !important; text-align: left !important; align-items: center !important; justify-content: space-between !important; padding: 10px !important; }
          .item-card .name { font-size: 1rem !important; }
          .item-card .price { margin-bottom: 0 !important; }
        }

      `}</style>
    </main >
  );
};

// Helper Components
const CartList = ({ items, onQtyChange, onRemove }) => (
  <div className="cart-list">
    {items.map((item, index) => (
      <div key={index} className="cart-row">
        <div className="cart-info">
          <div className="item-n">{item.name}</div>
          <div className="item-p">₹{item.price}</div>
        </div>
        <div className="cart-controls">
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => onQtyChange(index, e.target.value)}
            className="qty-in"
          />
          <button onClick={() => onRemove(index)} className="rem-btn">&times;</button>
        </div>
      </div>
    ))}
  </div>
);


const SecureCheckoutOverlay = ({ order, onPay, onClose }) => {
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });

  return (
    <div className="razorpay-secure-overlay">
      <div className="razorpay-secure-modal">
        <div className="rzp-header">
          <div>
            <div className="rzp-merchant">Gourmet Haven</div>
            <div className="rzp-desc">Online Food Order</div>
          </div>
          <div className="rzp-amount">₹{(order.amount / 100).toFixed(2)}</div>
        </div>

        <div className="rzp-body">
          <div className="rzp-test-badge">SECURE CHECKOUT</div>
          <div className="rzp-input-group">
            <label>Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 1234 5678"
              value={card.number}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || '';
                if (v.length <= 19) setCard({ ...card, number: v });
              }}
            />
          </div>
          <div className="rzp-row">
            <div className="rzp-input-group">
              <label>Expiry</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={card.expiry}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, '');
                  if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                  if (v.length <= 5) setCard({ ...card, expiry: v });
                }}
              />
            </div>
            <div className="rzp-input-group">
              <label>CVV</label>
              <input
                type="password"
                placeholder="123"
                value={card.cvv}
                onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').substring(0, 3) })}
              />
            </div>
          </div>
          <button className="rzp-pay-btn" onClick={() => onPay(card)}>Pay Now</button>
          <p className="rzp-hint">Enter your card details to proceed</p>
        </div>
        <button className="rzp-close-btn" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default Orders;
