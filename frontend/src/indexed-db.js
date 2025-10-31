import Dexie from 'dexie'
import { axiosInstance as axios } from 'services/axios-config';

export const db = new Dexie('TpsEcommerceDB');
db.version(1).stores({
  brands: '_id, brand_name',
  hashtags: 'tag_name'
})

const mockHashtags = [
  {tag_name: 'may-tinh'},
  {tag_name: 'lap-top'},
  {tag_name: 'phu-kien'},
]
db.hashtags.bulkPut(mockHashtags)

db.brands.toArray().then(brands => {
  if (brands.length !== 0) return
  axios.get('/brands')
    .then(data => {
      db.brands.bulkPut(data?.dt || [{}])
    })
})
