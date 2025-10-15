import React from 'react';
import Product from './Product';

const TrendingProducts = () => {
    // Sample product data - trong thực tế sẽ lấy từ API
    const trendingProducts = [
        {
            id: 1,
            name: "Xiaomi Mi Band 5",
            image: "/assets/images/products/product-1.jpg",
            category: "Watches",
            price: 199.00,
            rating: 4.0,
            reviewCount: 4
        },
        {
            id: 2,
            name: "Big Power Sound Speaker",
            image: "/assets/images/products/product-2.jpg",
            category: "Speaker",
            price: 275.00,
            originalPrice: 300.00,
            rating: 5.0,
            reviewCount: 5,
            salePercentage: 25
        },
        {
            id: 3,
            name: "WiFi Security Camera",
            image: "/assets/images/products/product-3.jpg",
            category: "Camera",
            price: 399.00,
            rating: 5.0,
            reviewCount: 5
        },
        {
            id: 4,
            name: "iPhone 6x Plus",
            image: "/assets/images/products/product-4.jpg",
            category: "Phones",
            price: 400.00,
            rating: 5.0,
            reviewCount: 5,
            isNew: true
        },
        {
            id: 5,
            name: "Wireless Headphones",
            image: "/assets/images/products/product-5.jpg",
            category: "Headphones",
            price: 350.00,
            rating: 5.0,
            reviewCount: 5
        },
        {
            id: 6,
            name: "Mini Bluetooth Speaker",
            image: "/assets/images/products/product-6.jpg",
            category: "Speaker",
            price: 70.00,
            rating: 4.0,
            reviewCount: 4
        },
        {
            id: 7,
            name: "PX7 Wireless Headphones",
            image: "/assets/images/products/product-7.jpg",
            category: "Headphones",
            price: 100.00,
            originalPrice: 200.00,
            rating: 4.0,
            reviewCount: 4,
            salePercentage: 50
        },
        {
            id: 8,
            name: "Apple MacBook Air",
            image: "/assets/images/products/product-8.jpg",
            category: "Laptop",
            price: 899.00,
            rating: 5.0,
            reviewCount: 5
        }
    ];

    return (
        <section className="trending-product section" style={{marginTop: "12px"}}>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="section-title">
                            <h2>Trending Product</h2>
                            <p>There are many variations of passages of Lorem Ipsum available, but the majority have
                                suffered alteration in some form.</p>
                        </div>
                    </div>
                </div>
                <div className="row">
                    {trendingProducts.map(product => (
                        <Product key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrendingProducts;