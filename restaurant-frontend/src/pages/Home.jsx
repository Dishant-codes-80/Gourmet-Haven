import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <h2>Welcome to Gourmet Haven</h2>
          <p>Experience culinary excellence with our exquisite cuisine and impeccable service</p>
          <button onClick={() => navigate('/reservations')} className="btn" style={{ cursor: 'pointer' }}>Make a Reservation</button>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>⭐</div>
          <h3>Award-Winning Cuisine</h3>
          <p>Our chefs craft memorable dishes using only the finest ingredients.</p>
        </div>
        <div className="feature-card">
          <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🍷</div>
          <h3>Perfect Ambiance</h3>
          <p>Enjoy elegant surroundings with the perfect atmosphere for any occasion.</p>
        </div>
        <div className="feature-card">
          <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🔔</div>
          <h3>Exceptional Service</h3>
          <p>Our dedicated staff ensures your dining experience is nothing short of extraordinary.</p>
        </div>
      </section>

      <section className="about-us">
        <div className="about-content">
          <h2>Our Restaurant</h2>
          <p>Gourmet Haven has been serving exquisite cuisine for over 15 years. Our commitment to quality ingredients, innovative recipes, and exceptional service has made us a favorite destination for food enthusiasts.</p>
          <p>Our team of talented chefs brings together flavors from around the world, creating a unique dining experience that delights all the senses.</p>
        </div>
        <div className="about-image">
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" alt="Restaurant Interior" />
        </div>
      </section>
    </main>
  );
};

export default Home;
