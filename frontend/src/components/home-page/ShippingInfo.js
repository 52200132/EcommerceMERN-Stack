import React from 'react';

const ShippingInfo = () => {
    return (
        <section className="shipping-info">
            <div className="container">
                <ul>
                    {/* Free Shipping */}
                    <li>
                        <div className="media-icon">
                            <i className="lni lni-delivery"></i>
                        </div>
                        <div className="media-body">
                            <h5>Free Shipping</h5>
                            <span>On order over $99</span>
                        </div>
                    </li>
                    {/* Money Return */}
                    <li>
                        <div className="media-icon">
                            <i className="lni lni-support"></i>
                        </div>
                        <div className="media-body">
                            <h5>24/7 Support.</h5>
                            <span>Live Chat Or Call.</span>
                        </div>
                    </li>
                    {/* Support 24/7 */}
                    <li>
                        <div className="media-icon">
                            <i className="lni lni-credit-cards"></i>
                        </div>
                        <div className="media-body">
                            <h5>Online Payment.</h5>
                            <span>Secure Payment Services.</span>
                        </div>
                    </li>
                    {/* Safe Payment */}
                    <li>
                        <div className="media-icon">
                            <i className="lni lni-reload"></i>
                        </div>
                        <div className="media-body">
                            <h5>Easy Return.</h5>
                            <span>Hassle Free Shopping.</span>
                        </div>
                    </li>
                </ul>
            </div>
        </section>
    );
};

export default ShippingInfo;