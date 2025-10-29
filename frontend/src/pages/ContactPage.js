import React from 'react';

const ContactPage = () => {
    return (
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <div className="section-title">
                        <h2>Contact Us</h2>
                        <p>Get in touch with us for any questions or support</p>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-lg-8 col-12">
                    <div className="contact-form">
                        <h3>Send us a Message</h3>
                        <form>
                            <div className="row">
                                <div className="col-lg-6 col-12">
                                    <div className="form-group">
                                        <label>Your Name</label>
                                        <input type="text" name="name" placeholder="Your Name" required />
                                    </div>
                                </div>
                                <div className="col-lg-6 col-12">
                                    <div className="form-group">
                                        <label>Your Email</label>
                                        <input type="email" name="email" placeholder="Your Email" required />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="form-group">
                                        <label>Subject</label>
                                        <input type="text" name="subject" placeholder="Subject" required />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="form-group">
                                        <label>Your Message</label>
                                        <textarea name="message" placeholder="Your Message" rows="6" required></textarea>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="form-group button">
                                        <button type="submit" className="btn">Send Message</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="col-lg-4 col-12">
                    <div className="contact-info">
                        <h3>Contact Information</h3>
                        <ul>
                            <li>
                                <i className="lni lni-map-marker"></i>
                                <span>123 Main Street, New York, NY 10001</span>
                            </li>
                            <li>
                                <i className="lni lni-phone"></i>
                                <span>+1 (900) 33 169 7720</span>
                            </li>
                            <li>
                                <i className="lni lni-envelope"></i>
                                <span>support@shopgrids.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;