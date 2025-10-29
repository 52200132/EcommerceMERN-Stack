import { useState } from 'react';
import { Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HeaderBottom = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="container">
      <div className="row align-items-center">
        <div className="col-lg-8 col-md-6 col-12">
          <div className="nav-inner">
            {/* Start Mega Category Menu */}
            <div className="mega-category-menu">
              <span className="cat-button">
                <i className="lni lni-menu"></i>All Categories
              </span>
              <ul className="sub-category">
                <li>
                  <Link to="/category/electronics">
                    Electronics <i className="lni lni-chevron-right"></i>
                  </Link>
                  <ul className="inner-sub-category">
                    <li><Link to="/category/cameras">Digital Cameras</Link></li>
                    <li><Link to="/category/camcorders">Camcorders</Link></li>
                    <li><Link to="/category/drones">Camera Drones</Link></li>
                    <li><Link to="/category/smartwatches">Smart Watches</Link></li>
                    <li><Link to="/category/headphones">Headphones</Link></li>
                    <li><Link to="/category/mp3players">MP3 Players</Link></li>
                    <li><Link to="/category/microphones">Microphones</Link></li>
                    <li><Link to="/category/chargers">Chargers</Link></li>
                    <li><Link to="/category/batteries">Batteries</Link></li>
                    <li><Link to="/category/cables">Cables & Adapters</Link></li>
                  </ul>
                </li>
                <li><Link to="/category/accessories">Accessories</Link></li>
                <li><Link to="/category/televisions">Televisions</Link></li>
                <li><Link to="/category/bestselling">Best Selling</Link></li>
                <li><Link to="/category/offers">Top 100 Offer</Link></li>
                <li><Link to="/category/sunglasses">Sunglasses</Link></li>
                <li><Link to="/category/watches">Watches</Link></li>
                <li><Link to="/category/mens">Men's Product</Link></li>
                <li><Link to="/category/audio">Home Audio & Theater</Link></li>
                <li><Link to="/category/computers">Computers & Tablets</Link></li>
                <li><Link to="/category/games">Video Games</Link></li>
                <li><Link to="/category/appliances">Home Appliances</Link></li>
              </ul>
            </div>
            {/* End Mega Category Menu */}

            {/* Start Navbar */}
            <Navbar expand="lg">
              <Navbar.Toggle
                className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="toggler-icon"></span>
                <span className="toggler-icon"></span>
                <span className="toggler-icon"></span>
              </Navbar.Toggle>
              <Navbar.Collapse className='sub-menu-bar'>
                <ul id="nav" className="navbar-nav ms-auto">
                  <li className="nav-item">
                    <Link to="/" className="nav-link">Home</Link>
                  </li>
                  <li className="nav-item dropdown">
                    <Link to="#" className="nav-link dropdown-toggle" role="button">Pages</Link>
                    <ul className="dropdown-menu">
                      <li><Link className="dropdown-item" to="/about">About Us</Link></li>
                      <li><Link className="dropdown-item" to="/faq">FAQ</Link></li>
                      <li><Link className="dropdown-item" to="/login">Login</Link></li>
                      <li><Link className="dropdown-item" to="/register">Register</Link></li>
                      <li><Link className="dropdown-item" to="/404">404 Error</Link></li>
                    </ul>
                  </li>
                  <li className="nav-item dropdown">
                    <Link to="#" className="nav-link dropdown-toggle" role="button">Shop</Link>
                    <ul className="dropdown-menu">
                      <li><Link className="dropdown-item" to="/products">Shop Grid</Link></li>
                      <li><Link className="dropdown-item" to="/products-list">Shop List</Link></li>
                      <li><Link className="dropdown-item" to="/product/1">Shop Single</Link></li>
                      <li><Link className="dropdown-item" to="/cart">Cart</Link></li>
                      <li><Link className="dropdown-item" to="/checkout">Checkout</Link></li>
                    </ul>
                  </li>
                  <li className="nav-item dropdown">
                    <Link to="#" className="nav-link dropdown-toggle" role="button">Blog</Link>
                    <ul className="dropdown-menu">
                      <li><Link className="dropdown-item" to="/blog">Blog Grid</Link></li>
                      <li><Link className="dropdown-item" to="/blog/1">Blog Single</Link></li>
                    </ul>
                  </li>
                  <li className="nav-item">
                    <Link to="/contact" className="nav-link">Contact Us</Link>
                  </li>
                </ul>
              </Navbar.Collapse>
            </Navbar>
            {/* End Navbar */}
          </div>
        </div>
        <div className="col-lg-4 col-md-6 col-12">
        </div>
      </div>
    </div>
  )
}

export default HeaderBottom;