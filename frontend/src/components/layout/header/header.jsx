import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import HeaderBottom from './header-bottom';
import UserActions from './user-actions';
import Hotline from '../../common/Hotline';
import FollowUs from '../../common/FollowUs';

import './header.scss';
import CategoriesBtn from './categories-btn';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetCartQuery } from '#services';
import SearchBox from './search-box';

const Header = () => {
  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = !!user?.token;
  const [guestCartCount, setGuestCartCount] = useState(0);
  // const { data: cartData } = useGetCartQuery(undefined, { skip: !isLoggedIn });
  const itemsCartCount = useSelector((state) => state.userProfile.cart_list.length);
  const headerMiddleRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) {
      const loadCount = () => {
        try {
          const cart = JSON.parse(localStorage.getItem('guest_cart')) || [];
          const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
          setGuestCartCount(count);
        } catch (error) {
          setGuestCartCount(0);
        }
      };
      loadCount();
      const handleUpdate = () => loadCount();
      window.addEventListener('storage', handleUpdate);
      window.addEventListener('guest-cart-updated', handleUpdate);
      return () => {
        window.removeEventListener('storage', handleUpdate);
        window.removeEventListener('guest-cart-updated', handleUpdate);
      };
    }
  }, [isLoggedIn]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const navbar = headerMiddleRef.current;
    const navbarSekeleton = document.createElement("div");
    const HIDE_THRESHOLD = 200;

    const onScroll = () => {
      navbarSekeleton.style.width = `${navbar?.clientWidth}px`;
      navbarSekeleton.style.height = `${navbar?.clientHeight}px`;
      const currentScroll = window.scrollY;

      if (currentScroll > 100) {
        navbar.classList.add("navbar--scrolled", 'position-fixed');
        if (!navbar.parentNode.contains(navbarSekeleton)) {
          navbar.parentNode.insertBefore(navbarSekeleton, navbar);
        }
      } else {
        navbar.classList.remove("navbar--scrolled", "navbar--fixed", 'position-fixed');
        navbar.parentNode.contains(navbarSekeleton) && navbar.parentNode.removeChild(navbarSekeleton);
        return;
      }

      if (currentScroll > lastScrollY && currentScroll > HIDE_THRESHOLD) {
        navbar.classList.add("navbar--hidden");
        navbar.classList.remove("navbar--fixed");
      } else {
        navbar.classList.remove("navbar--hidden");
        navbar.classList.add("navbar--fixed");
      }

      lastScrollY = currentScroll;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cartCount = isLoggedIn ? itemsCartCount : guestCartCount;

  return (
    <header className="header navbar-area header-container">
      {/* Start Topbar */}
      <div className="topbar">
        <Container>
          <Row className="align-items-center">
            <Col lg={4} md={4} xs={12}>
              <div className="top-left">
                <ul className="menu-top-link">
                  <li>
                    <div className="select-position">
                      <select id="select4">
                        <option value="0" defaultValue>$ USD</option>
                        <option value="1">€ EURO</option>
                        <option value="2">$ CAD</option>
                        <option value="3">₹ INR</option>
                        <option value="4">¥ CNY</option>
                        <option value="5">৳ BDT</option>
                      </select>
                    </div>
                  </li>
                  <li>
                    <div className="select-position">
                      <select id="select5">
                        <option value="0" defaultValue>English</option>
                        <option value="1">Español</option>
                        <option value="2">Filipino</option>
                        <option value="3">Français</option>
                        <option value="4">العربية</option>
                        <option value="5">हिन्दी</option>
                        <option value="6">বাংলা</option>
                      </select>
                    </div>
                  </li>
                </ul>
              </div>
            </Col>
            <Col lg={4} md={4} xs={12}>
              <div className="top-middle">
                <FollowUs />
              </div>
            </Col>
            <Col lg={4} md={4} xs={12}>
              <div className="top-end">
                <Hotline />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      {/* End Topbar */}

      {/* Start Header Middle */}
      <div ref={headerMiddleRef} className="navbar header-middle">
        <Container>
          <Row className="align-items-center w-100">
            <Col lg={3} md={3} xs={7}>
              {/* Start Header Logo */}
              <Link className="navbar-brand" to="/">
                <img src="/assets/images/logo/logo.svg" alt="Logo" />
              </Link>
              {/* End Header Logo */}
            </Col>
            <Col lg={5} md={6} className="d-xs-none">
              {/* Start Main Menu Search */}
              <div className="main-menu-search">
                {/* navbar search start */}
                <div className="navbar-search search-style-5">
                  {/* <CategoriesBtn /> */}
                  <SearchBox />
                </div>
                {/* navbar search Ends */}
              </div>
              {/* End Main Menu Search */}
            </Col>
            <Col lg={4} md={3} xs={5}>
              <div className="middle-right-area">

                <UserActions />

                <div className="navbar-cart">
                  <div className="wishlist">
                    <Link to="/wishlist">
                      <i className="lni lni-heart"></i>
                      <span className="total-items">0</span>
                    </Link>
                  </div>
                  <div className="cart-items">
                    <Link to="/cart" className="main-btn">
                      <i className="lni lni-cart"></i>
                      <span className="total-items">{cartCount}</span>
                    </Link>
                    {/* Shopping Item */}
                    {/* <div className="shopping-item">
                      <div className="dropdown-cart-header">
                        <span>2 Items</span>
                        <Link to="/cart">View Cart</Link>
                      </div>
                      <ul className="shopping-list">
                        <li>
                          <button className="remove" title="Remove this item">
                            <i className="lni lni-close"></i>
                          </button>
                          <div className="cart-img-head">
                            <Link className="cart-img" to="/product/1">
                              <img src="/assets/images/header/cart-items/item1.jpg" alt="#" />
                            </Link>
                          </div>
                          <div className="content">
                            <h4><Link to="/product/1">Apple Watch Series 6</Link></h4>
                            <p className="quantity">1x - <span className="amount">$99.00</span></p>
                          </div>
                        </li>
                        <li>
                          <button className="remove" title="Remove this item">
                            <i className="lni lni-close"></i>
                          </button>
                          <div className="cart-img-head">
                            <Link className="cart-img" to="/product/2">
                              <img src="/assets/images/header/cart-items/item2.jpg" alt="#" />
                            </Link>
                          </div>
                          <div className="content">
                            <h4><Link to="/product/2">Wi-Fi Smart Camera</Link></h4>
                            <p className="quantity">1x - <span className="amount">$35.00</span></p>
                          </div>
                        </li>
                      </ul>
                      <div className="bottom">
                        <div className="total">
                          <span>Total</span>
                          <span className="total-amount">$134.00</span>
                        </div>
                        <div className="button">
                          <Link to="/checkout" className="btn animate">Checkout</Link>
                        </div>
                      </div>
                    </div> */}
                    {/*/ End Shopping Item */}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      {/* End Header Middle */}

      {/* Start Header Bottom */}
      <HeaderBottom />
      {/* End Header Bottom */}
    </header>
  );
};

export default Header;