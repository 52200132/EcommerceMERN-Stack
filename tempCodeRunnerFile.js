// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('Ecommerce');

// Create a new document in the collection.
db.getCollection('ratings').insertMany([
    {
      "product_id": { "$oid": "68fa1abf5ce927f31937c719" },
      "user_id": { "$oid": "68dcb90ff9b820a3efd8a36a" },
      "rating": 5,
      "comment": "Sản phẩm tuyệt vời, đúng như mô tả. Giao hàng rất nhanh!"
    },
    {
      "product_id": { "$oid": "68fa1abf5ce927f31937c719" },
      "user_id": { "$oid": "68dcb90ff9b820a3efd8a36b" },
      "rating": 4,
      "comment": "Chất lượng tốt nhưng đóng gói hơi sơ sài một chút."
    },
    {
      "product_id": { "$oid": "68fa1abf5ce927f31937c719" },
      "user_id": { "$oid": "68f9eaddecb5d0ce7fc5fa12" },
      "rating": 5,
      "comment": "Rất đáng tiền, sẽ ủng hộ shop lần sau."
    },
    {
      "product_id": { "$oid": "68fa1abf5ce927f31937c719" },
      "user_id": { "$oid": "690b6bce25a60c8231611c5f" },
      "rating": 3,
      "comment": "Tạm ổn, màu sắc hơi khác so với ảnh một xíu."
    },
    {
      "product_id": { "$oid": "68fa1abf5ce927f31937c719" },
      "user_id": { "$oid": "690bbb86e51e05d6e4a2c61f" },
      "rating": 5,
      "comment": "I love this very much hehe. Best purchase ever."
    },
    {
      "product_id": { "$oid": "68fa1abf5ce927f31937c719" },
      "user_id": { "$oid": "690f43e91ee55cc6e2da6e0" },
      "rating": 1,
      "comment": "Hàng bị lỗi khi nhận, shop hỗ trợ đổi trả hơi chậm."
    },
    {
      "product_id": { "$oid": "68fa1abf5ce927f31937c719" },
      "user_id": { "$oid": "68dcb90ff9b820a3efd8a36a" },
      "rating": 4,
      "comment": "Dùng ổn, mọi người nên mua nhé."
    },
    {
      "product_id": { "$oid": "68fa1abf5ce927f31937c719" },
      "user_id": { "$oid": "690b6bce25a60c8231611c5f" },
      "rating": 5,
      "comment": "Không có gì để chê. 10 điểm."
    },
    {
      "product_id": { "$oid": "68fa1abf5ce927f31937c719" },
      "user_id": { "$oid": "68f9eaddecb5d0ce7fc5fa12" },
      "rating": 2,
      "comment": "Không giống mô tả lắm, hơi thất vọng."
    },
    {
      "product_id": { "$oid": "68fa1abf5ce927f31937c719" },
      "user_id": { "$oid": "690f43e91ee55cc6e2da6e0" },
      "rating": 4,
      "comment": "Good product, fast delivery."
    }
  ]
);