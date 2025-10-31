db = db.getSiblingDB('DockerDB');

// Tạo collections mẫu
db.createCollection('brands');
db.createCollection('comments');
db.createCollection('discountcodes');
db.createCollection('invoices');
db.createCollection('orders');
db.createCollection('products');
db.createCollection('ratings');
db.createCollection('users');

console.log("Database and collections created successfully.");