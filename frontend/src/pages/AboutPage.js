import React from 'react';

const AboutPage = () => {
    return (
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <div className="section-title">
                        <h2>About ShopGrids</h2>
                        <p>Learn more about our company and mission</p>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-lg-6 col-12">
                    <div className="about-content">
                        <h3>Our Story</h3>
                        <p>
                            ShopGrids is a modern eCommerce platform built with the latest technologies. 
                            We are committed to providing the best online shopping experience with a wide 
                            range of quality products at competitive prices.
                        </p>
                        <p>
                            Our team consists of experienced developers and designers who are passionate 
                            about creating innovative solutions for online retail. We believe in the power 
                            of technology to transform the way people shop and connect with brands.
                        </p>
                        <h3>Our Mission</h3>
                        <p>
                            To provide customers with an exceptional online shopping experience through 
                            innovative technology, quality products, and outstanding customer service.
                        </p>
                    </div>
                </div>
                <div className="col-lg-6 col-12">
                    <div className="about-image">
                        <img src="/assets/images/hero/slider-bg1.jpg" alt="About Us" className="img-fluid rounded" />
                    </div>
                </div>
            </div>
            <div className="row mt-5">
                <div className="col-lg-3 col-md-6 col-12">
                    <div className="feature-box text-center">
                        <div className="icon">
                            <i className="lni lni-delivery" style={{fontSize: '3rem', color: '#007bff'}}></i>
                        </div>
                        <h4>Fast Delivery</h4>
                        <p>Quick and reliable delivery to your doorstep</p>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6 col-12">
                    <div className="feature-box text-center">
                        <div className="icon">
                            <i className="lni lni-support" style={{fontSize: '3rem', color: '#007bff'}}></i>
                        </div>
                        <h4>24/7 Support</h4>
                        <p>Round-the-clock customer support</p>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6 col-12">
                    <div className="feature-box text-center">
                        <div className="icon">
                            <i className="lni lni-credit-cards" style={{fontSize: '3rem', color: '#007bff'}}></i>
                        </div>
                        <h4>Secure Payment</h4>
                        <p>Safe and secure payment processing</p>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6 col-12">
                    <div className="feature-box text-center">
                        <div className="icon">
                            <i className="lni lni-reload" style={{fontSize: '3rem', color: '#007bff'}}></i>
                        </div>
                        <h4>Easy Returns</h4>
                        <p>Hassle-free return and exchange policy</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;