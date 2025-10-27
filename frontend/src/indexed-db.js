import Dexie from 'dexie'
import { axiosInstance as axios } from 'services/axios-config';

export const db = new Dexie('TpsEcommerceDB');
db.version(1).stores({
  brands: 'brand_name, timestamp',
  hashtags: 'tag_name'
})
const mockBrands = [
  { brand_name: "Samsung" },
  { brand_name: "Sony" },
  { brand_name: "LG" },
  { brand_name: "Panasonic" },
  { brand_name: "Philips" },
  { brand_name: "Toshiba" },
  { brand_name: "Sharp" },
  { brand_name: "Hisense" },
  { brand_name: "Xiaomi" },
  { brand_name: "Huawei" },
  { brand_name: "Dell" },
  { brand_name: "HP" },
  { brand_name: "Asus" },
  { brand_name: "Acer" },
  { brand_name: "Lenovo" },
  { brand_name: "Apple" },
  { brand_name: "MSI" },
  { brand_name: "Canon" },
  { brand_name: "Nikon" },
  { brand_name: "Logitech" }
]
db.brands.bulkPut(mockBrands)

const mockHashtags = [
  {tag_name: 'may-tinh'},
  {tag_name: 'lap-top'},
  {tag_name: 'phu-kien'},
]
db.hashtags.bulkPut(mockHashtags)

db.brands.toArray().then(brands => {
  console.log('INDEXED DB: brands no api');
  if (brands.length !== 0) return
  console.log('INDEXED DB: brands api');
  
  axios.get('/brands')
    .then(data => {
      db.brands.bulkPut(data?.dt || [{}])
    })
})
