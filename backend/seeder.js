
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from './models/User.js';
import Product from './models/Product.js';
import Brand from './models/Brand.js';
import Order from './models/Order.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const adminUser = await User.create({
      username: 'Admin User',
      email: 'admin@example'+Date.now().toString()+'.com',
      password: hashedPassword,
      isManager: true,
    });

    // Create sample users
    const sampleUsers = await User.insertMany([
      {
        "username": "Võ Văn Sáng",
        "email": "sangvo2004app@gmail.com",
        "password": hashedPassword,
        "isManager": false,
        "Addresses": [
          {
            "receiver": "Vo Van Sang",
            "phone": "0000000000",
            "country": "Vietnam",
            "province": "Ho Chi Minh",
            "district": "Quan 7",
            "ward": "Tan Phong",
            "street": "Nguyen Huu Tho",
            "postalCode": "700000",
            "isDefault": true
          }
        ],
        "Carts": []
      },
      {
        "username": "Nguyễn Bảo Phúc",
        "email": "52200173@student.tdtu.edu.vn",
        "password": hashedPassword,
        "isManager": false,
        "Addresses": [
          {
            "receiver": "Nguyen Bao Phuc",
            "phone": "0000000001",
            "country": "Vietnam",
            "province": "Ho Chi Minh",
            "district": "Nha Be",
            "ward": "Phuoc Kien",
            "street": "Le Van Luong",
            "postalCode": "900000",
            "isDefault": true
          }
        ],
        "Carts": []
      },
      {
        "username": "Phùng Tấn Phước",
        "email": "phuocphung5890@gmail.com",
        "password": hashedPassword,
        "isManager": false,
        "Addresses": [
          {
            "receiver": "Phung Tan Phuoc",
            "phone": "0000000009",
            "country": "Vietnam",
            "province": "Ho Chi Minh",
            "district": "Quan 10",
            "ward": "Phuong 12",
            "street": "Ba Thang Hai",
            "postalCode": "800000",
            "isDefault": true
          }
        ],
        "Carts": []
      },
    ]);

    const brands = await Brand.insertMany([
      {
        "brand_name": "ASUS"
      },
      {
        "brand_name": "Lenovo"
      },
      {
        "brand_name": "Dell"
      },
      {
        "brand_name": "Acer"
      },
      {
        "brand_name": "HP"
      },
      {
        "brand_name": "E-dra"
      },
      {
        "brand_name": "Aula"
      },
      {
        "brand_name": "Apple"
      },
      {
        "brand_name": "Sony"
      },
      {
        "brand_name": "JBL"
      },
      {
        "brand_name": "Kioxia"
      },
      {
        "brand_name": "Kingston"
      },
      {
        "brand_name": "Sandisk"
      },
      {
        "brand_name": "Ugreen"
      },
    ]);

    const products = await Product.insertMany([
      {
        "product_name": "Laptop ASUS TUF Gaming F16",
        "brand_id": brands[0]._id,
        "hashtag": "laptop",
        "quantity_sold": 0,
        "price_min": 20990000,
        "price_max": 37990000,
        "short_description": "High-performance gaming laptop with military-grade design, Intel or AMD CPUs, NVIDIA GeForce RTX GPU, 16-inch display, and optimized cooling system.",
        "detail_description": "ASUS TUF Gaming F16 is a 16-inch gaming laptop built for gamers who demand power and durability. It features the latest Intel Core or AMD Ryzen processors paired with NVIDIA GeForce RTX graphics for smooth AAA gaming and content creation. The display supports high refresh rates up to 165Hz with vivid color reproduction. The chassis meets military-grade MIL-STD-810H standards for toughness. With exclusive Arc Flow Fans cooling technology and RGB keyboard, it's ideal for gamers, streamers, and creators.",
        "Images": [
          {
            "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/a/laptop_asus_tuf_gaming_f16_fx607vj-rl034w_-_1.png",
            "is_primary": true
          }
        ],
        "Warehouses": [
          {
            "name": "WH01_tpHCM",
            "location": "Hẻm 458/20, đường 3/2, phường 12, quận 10, tp HCM",
            "warehouse_variants": [
              {
                "sku": "FX607VJ-RL034W",
                "quantity": 120,
                "waiting_for_delivery": 5
              }
            ]
          },
          {
            "name": "WH02_tpHCM",
            "location": "Hẻm 365, đường Nguyễn Thị Thập, phường 3, quận 7, tp HCM",
            "warehouse_variants": [
              {
                "sku": "FX607VU-RL045W",
                "quantity": 302,
                "waiting_for_delivery": 3
              }
            ]
          },
          {
            "name": "WH03_tpHCM",
            "location": "Hẻm 223, đường Dương Quảng Hàm, phường 6, quận Gò Vấp, tp HCM",
            "warehouse_variants": [
              {
                "sku": "FX608JMR-RV048W",
                "quantity": 230,
                "waiting_for_delivery": 8
              }
            ]
          }
        ],
        "Variants": [
          {
            "sku": "FX607VJ-RL034W",
            "price": 20990000,
            "stock": 0,
            "Images": [
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/a/laptop_asus_tuf_gaming_f16_fx607vj-rl034w_-_1.png",
                "is_primary": true
              },
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/a/laptop_asus_tuf_gaming_f16_fx607vj-rl034w_-_3.png",
                "is_primary": false
              },
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_7__4_146.png",
                "is_primary": false
              }
            ],
            "Attributes": [
              {
                "attribute": "Graphics Card",
                "value": "NVIDIA GeForce RTX 3050 6GB GDDR6",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "RAM Capacity",
                "value": "16GB",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "RAM Type",
                "value": "DDR4-3200 SO-DIMM",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "SSD Storage",
                "value": "512GB PCIe 4.0 NVMe M.2 SSD",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Screen Size",
                "value": "16 inches",
                "type": "appearance",
                "is_show_in_table": true
              },
              {
                "attribute": "Battery",
                "value": "56WHrs, 4-cell Li-ion",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Operating System",
                "value": "Windows 11 Home",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Color",
                "value": "Gray",
                "type": "appearance",
                "is_show_in_table": true
              }
            ],
            "is_active": true
          },
          {
            "sku": "FX607VU-RL045W",
            "price": 25490000,
            "stock": 0,
            "Images": [
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/a/laptop_asus_tuf_gaming_f16_fx607vu-rl045w_-_1.png",
                "is_primary": true
              },
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/a/laptop_asus_tuf_gaming_f16_fx607vu-rl045w_-_3.png",
                "is_primary": false
              },
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_10__5_117.png",
                "is_primary": false
              }
            ],
            "Attributes": [
              {
                "attribute": "Graphics Card",
                "value": "NVIDIA GeForce RTX 4050 6GB GDDR6",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "RAM Capacity",
                "value": "16GB",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "RAM Type",
                "value": "DDR5-5600 SO-DIMM",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "SSD Storage",
                "value": "512GB PCIe 4.0 NVMe M.2 SSD",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Screen Size",
                "value": "16 inches",
                "type": "appearance",
                "is_show_in_table": true
              },
              {
                "attribute": "Battery",
                "value": "56WHrs, 4-cell Li-ion",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Operating System",
                "value": "Windows 11 Home",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Color",
                "value": "Gray",
                "type": "appearance",
                "is_show_in_table": true
              }
            ],
            "is_active": true
          },
          {
            "sku": "FX608JMR-RV048W",
            "price": 37990000,
            "stock": 0,
            "Images": [
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/a/laptop_asus_tuf_gaming_f16_fx608jmr-rv048w_-_1.png",
                "is_primary": true
              },
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_15_21.png",
                "is_primary": false
              },
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_4__7_161.png",
                "is_primary": false
              }
            ],
            "Attributes": [
              {
                "attribute": "Graphics Card",
                "value": "NVIDIA GeForce RTX 5060 8GB GDDR7",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "RAM Capacity",
                "value": "32GB",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "RAM Type",
                "value": "DDR5-5600 SO-DIMM",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "SSD Storage",
                "value": "1TB PCIe 4.0 NVMe M.2 SSD",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Screen Size",
                "value": "16 inches",
                "type": "appearance",
                "is_show_in_table": true
              },
              {
                "attribute": "Battery",
                "value": "90WHrs, 4-cell Li-ion",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Operating System",
                "value": "Windows 11 Home",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Color",
                "value": "Gray",
                "type": "appearance",
                "is_show_in_table": true
              }
            ],
            "is_active": true
          }
        ],
        "is_active": true
      },
      {
        "product_name": "Laptop Lenovo IdeaPad Slim 3",
        "brand_id": brands[1]._id,
        "hashtag": "laptop",
        "quantity_sold": 0,
        "price_min": 12490000,
        "price_max": 15190000,
        "short_description": "Slim and lightweight laptop for study and office work, featuring efficient Intel or AMD CPUs, anti-glare Full HD display, and long battery life.",
        "detail_description": "Lenovo IdeaPad Slim 3 is an affordable laptop for students, office workers, and families needing a reliable device for daily tasks. It features a compact, lightweight design (around 1.6 kg), Full HD anti-glare display, and Intel Core or AMD Ryzen processors for stable performance. The long battery life and Rapid Charge technology make it suitable for all-day use.",
        "Images": [
          {
            "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/a/laptop_lenovo_ideapad_slim_3_14irh10_83k00008vn_-_1.png",
            "is_primary": true
          }
        ],
        "Warehouses": [
          {
            "name": "WH01_tpHCM",
            "location": "Hẻm 458/20, đường 3/2, phường 12, quận 10, tp HCM",
            "warehouse_variants": [
              {
                "sku": "14IRH10 83K00008VN",
                "quantity": 120,
                "waiting_for_delivery": 5
              }
            ]
          },
          {
            "name": "WH02_tpHCM",
            "location": "Hẻm 365, đường Nguyễn Thị Thập, phường 3, quận 7, tp HCM",
            "warehouse_variants": [
              {
                "sku": "15ABR8 82XM00MDVN",
                "quantity": 302,
                "waiting_for_delivery": 3
              }
            ]
          },
          {
            "name": "WH03_tpHCM",
            "location": "Hẻm 223, đường Dương Quảng Hàm, phường 6, quận Gò Vấp, tp HCM",
            "warehouse_variants": [
              {
                "sku": "14ARP10 83K6000AVN",
                "quantity": 230,
                "waiting_for_delivery": 8
              }
            ]
          }
        ],
        "Variants": [
          {
            "sku": "14IRH10 83K00008VN",
            "price": 15190000,
            "stock": 0,
            "Images": [
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/a/laptop_lenovo_ideapad_slim_3_14irh10_83k00008vn_-_1.png",
                "is_primary": true
              },
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/a/laptop_lenovo_ideapad_slim_3_14irh10_83k00008vn_-_2.png",
                "is_primary": false
              },
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_6__2_225.png",
                "is_primary": false
              }
            ],
            "Attributes": [
              {
                "attribute": "Graphics Card",
                "value": "Intel UHD Graphics",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "RAM Capacity",
                "value": "16GB",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "RAM Type",
                "value": "DDR5-4800",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "SSD Storage",
                "value": "512GB PCIe 4.0 NVMe SSD",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Screen Size",
                "value": "14 inches",
                "type": "appearance",
                "is_show_in_table": true
              },
              {
                "attribute": "Battery",
                "value": "60Wh Li-ion",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Operating System",
                "value": "Windows 11 Home",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Color",
                "value": "Gray",
                "type": "appearance",
                "is_show_in_table": true
              }
            ],
            "is_active": true
          },
          {
            "sku": "15ABR8 82XM00MDVN",
            "price": 12490000,
            "stock": 0,
            "Images": [
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/a/laptop_lenovo_ideapad_slim_3_15abr8_82xm00mdvn_-_1.png",
                "is_primary": true
              },
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/a/laptop_lenovo_ideapad_slim_3_15abr8_82xm00mdvn_-_2.png",
                "is_primary": false
              },
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_12__5_169.png",
                "is_primary": false
              }
            ],
            "Attributes": [
              {
                "attribute": "Graphics Card",
                "value": "AMD Radeon Graphics",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "RAM Capacity",
                "value": "16GB",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "RAM Type",
                "value": "DDR4-3200",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "SSD Storage",
                "value": "512GB PCIe 4.0 NVMe SSD",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Screen Size",
                "value": "15.6 inches",
                "type": "appearance",
                "is_show_in_table": true
              },
              {
                "attribute": "Battery",
                "value": "47Wh Li-ion",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Operating System",
                "value": "Windows 11 Home",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Color",
                "value": "Gray",
                "type": "appearance",
                "is_show_in_table": true
              }
            ],
            "is_active": true
          },
          {
            "sku": "14ARP10 83K6000AVN",
            "price": 14990000,
            "stock": 0,
            "Images": [
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/a/laptop_lenovo_ideapad_slim_3_14arp10_83k6000avn_-_1.png",
                "is_primary": true
              },
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/a/laptop_lenovo_ideapad_slim_3_14arp10_83k6000avn_-_2.png",
                "is_primary": false
              },
              {
                "url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_3__8_91.png",
                "is_primary": false
              }
            ],
            "Attributes": [
              {
                "attribute": "Graphics Card",
                "value": "AMD Radeon 660M Graphics",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "RAM Capacity",
                "value": "16GB",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "RAM Type",
                "value": "DDR5-4800",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "SSD Storage",
                "value": "512GB PCIe 4.0 NVMe SSD",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Screen Size",
                "value": "14 inches",
                "type": "appearance",
                "is_show_in_table": true
              },
              {
                "attribute": "Battery",
                "value": "60Wh Li-ion",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Operating System",
                "value": "Windows 11 Home",
                "type": "technology",
                "is_show_in_table": true
              },
              {
                "attribute": "Color",
                "value": "Gray",
                "type": "appearance",
                "is_show_in_table": true
              }
            ],
            "is_active": true
          }
        ],
        "is_active": true
      }
    ]);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Brand.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

connectDB().then(() => {
  if (process.argv[2] === '-d') {
    // destroyData();
    console.log("Destroy data")
  } else {
    // importData();
    console.log("Import data")
  }
});