import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faXTwitter } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-section">
          <h3>Gourmet Haven</h3>
          <p>42 Connaught Place<br />New Delhi, Delhi 110001</p>
          <p>Phone: +91 98765 43210<br />Email: info@gourmethaven.com</p>
        </div>
        <div className="footer-section">
          <h3>Hours</h3>
          <p>Monday - Friday: 11:00 AM - 10:00 PM<br />
            Saturday - Sunday: 10:00 AM - 11:00 PM</p>
        </div>
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="https://www.facebook.com/gourmethaven" target="_blank" rel="noopener noreferrer" title="Follow us on Facebook">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a href="https://www.instagram.com/gourmethaven" target="_blank" rel="noopener noreferrer" title="Follow us on Instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://www.twitter.com/gourmethaven" target="_blank" rel="noopener noreferrer" title="Follow us on X">
              <FontAwesomeIcon icon={faXTwitter} />
            </a>
          </div>
        </div>
      </div>
      <div className="copyright">
        <p>&copy; 2025 Gourmet Haven. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
