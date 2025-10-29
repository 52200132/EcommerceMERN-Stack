import { useState } from 'react';
import { FaStar, FaClock } from 'react-icons/fa';
import { Container } from 'react-bootstrap';
import RatingModal from './RatingModal';

// Fake data for product and ratings
const fakeProduct = {
  name: "Camera IP 360 độ 2MP TP-Link Tapo C202",
  image: "/assets/images/product-1.jpg",
  rating: 5.0,
  numReviews: 8
};

const fakeRatings = [
  {
    id: 1,
    username: "Huongvu",
    rating: 5,
    comment: "Nv tư vấn tận tâm, giá tốt",
    date: "2 tháng trước",
    avatar: "H",
    hasImage: false,
    hasBought: false
  },
  {
    id: 2,
    username: "Phan van kha",
    rating: 5,
    comment: "tuyệt vời",
    date: "8 tháng trước",
    avatar: "P",
    hasImage: false,
    hasBought: false
  },
  {
    id: 3,
    username: "Phan van kha",
    rating: 5,
    comment: "tuyệt vời",
    date: "8 tháng trước",
    avatar: "P",
    hasImage: false,
    hasBought: false
  },
  {
    id: 4,
    username: "LE THI AI VAN",
    rating: 5,
    comment: "Sẽ ủng hộ lần nữa",
    date: "9 tháng trước",
    avatar: "L",
    hasImage: false,
    hasBought: true
  },
  {
    id: 5,
    username: "Mr Thanh",
    rating: 5,
    comment: "giá rẻ, vận tốt",
    date: "9 tháng trước",
    avatar: "M",
    hasImage: false,
    hasBought: true
  }
];

const ratingCounts = {
  5: 8,
  4: 0,
  3: 0,
  2: 0,
  1: 0
};

const Ratings = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredRatings, setFilteredRatings] = useState(fakeRatings);
  const [showRatingModal, setShowRatingModals] = useState(false);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);

    // Apply filtering logic
    if (filter === 'all') {
      setFilteredRatings(fakeRatings);
    } else if (filter === 'hasImage') {
      setFilteredRatings(fakeRatings.filter(rating => rating.hasImage));
    } else if (filter === 'hasBought') {
      setFilteredRatings(fakeRatings.filter(rating => rating.hasBought));
    } else if (filter.includes('star')) {
      const starRating = parseInt(filter.split('-')[0]);
      setFilteredRatings(fakeRatings.filter(rating => rating.rating === starRating));
    }
  };

  // Function to render stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(<FaStar key={i} className={i < rating ? "active" : ""} />);
    }
    return stars;
  };

  return (
    <div className="tps-ratings-section">
      <Container>
        {/* Bắt đầu nửa trên */}
        <div className='tps-top-half-section'>
          <div className="tps-ratings-header">
            <h3>Đánh giá Camera IP 360 độ 2MP TP-Link Tapo C202</h3>
          </div>

          <div className="tps-ratings-summary">
            <div className="tps-ratings-score">
              <div className="tps-ratings-average">
                <span className="tps-average-number">{fakeProduct.rating.toFixed(1)}</span>
                <span className="tps-average-total">/{5}</span>
              </div>
              <div className="tps-ratings-stars">
                {renderStars(fakeProduct.rating)}
              </div>
              <div className="tps-ratings-count">
                <span>{fakeProduct.numReviews} lượt đánh giá</span>
              </div>
              <div className="tps-ratings-write">
                <button className="tps-write-review-btn" onClick={() => setShowRatingModals(true)}>
                  Viết đánh giá
                </button>
              </div>
            </div>
            <div className="tps-ratings-breakdown">
              {[5, 4, 3, 2, 1].map(star => (
                <div className="tps-rating-bar" key={star}>
                  <span className="tps-rating-label">{star} ★</span>
                  <div className="tps-rating-progress">
                    <div
                      className="tps-rating-progress-bar"
                      style={{ width: `${(ratingCounts[star] / fakeProduct.numReviews) * 100}%` }}
                    ></div>
                  </div>
                  <span className="tps-rating-count">{ratingCounts[star]} đánh giá</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Kết thúc nửa trên */}

        {/* Bắt đầu nửa dưới */}
        <div className="tps-bottom-half-section">
          <div className="tps-ratings-filter">
            <span>Lọc đánh giá theo </span>
            <div className="tps-filter-options">
              <button
                className={activeFilter === 'all' ? 'active' : ''}
                onClick={() => handleFilterChange('all')}
              >
                Tất cả
              </button>
              <button
                className={activeFilter === 'hasImage' ? 'active' : ''}
                onClick={() => handleFilterChange('hasImage')}
              >
                Có hình ảnh
              </button>
              <button
                className={activeFilter === 'hasBought' ? 'active' : ''}
                onClick={() => handleFilterChange('hasBought')}
              >
                Đã mua hàng
              </button>
              <button
                className={activeFilter === '5-star' ? 'active' : ''}
                onClick={() => handleFilterChange('5-star')}
              >
                5 sao
              </button>
              <button
                className={activeFilter === '4-star' ? 'active' : ''}
                onClick={() => handleFilterChange('4-star')}
              >
                4 sao
              </button>
              <button
                className={activeFilter === '3-star' ? 'active' : ''}
                onClick={() => handleFilterChange('3-star')}
              >
                3 sao
              </button>
              <button
                className={activeFilter === '2-star' ? 'active' : ''}
                onClick={() => handleFilterChange('2-star')}
              >
                2 sao
              </button>
              <button
                className={activeFilter === '1-star' ? 'active' : ''}
                onClick={() => handleFilterChange('1-star')}
              >
                1 sao
              </button>
            </div>
          </div>

          <div className="tps-ratings-list">
            {filteredRatings.map(rating => (
              <div key={rating.id} className="tps-rating-item">
                <div className="tps-rating-avatar">
                  <span>{rating.avatar}</span>
                </div>
                <div className="tps-rating-content">
                  <div className="tps-rating-info">
                    <h4 className="tps-rating-username">{rating.username}</h4>
                    <div className="tps-rating-stars">
                      {renderStars(rating.rating)}
                      <span className="tps-rating-text">
                        {rating.rating === 5 ? 'tuyệt vời' : ''}
                        {rating.rating === 4 ? 'tốt' : ''}
                        {rating.rating === 3 ? 'bình thường' : ''}
                        {rating.rating === 2 ? 'tệ' : ''}
                        {rating.rating === 1 ? 'rất tệ' : ''}
                      </span>
                    </div>
                  </div>
                  <p className="tps-rating-comment">{rating.comment}</p>
                  {rating.hasBought && (
                    <div className="tps-rating-purchase">
                      <span>Đã mua tại CellphoneS</span>
                    </div>
                  )}
                  <div className="tps-rating-date">
                    <FaClock /> Đánh giá đã đăng vào {rating.date}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="tps-ratings-more">
            <button className="tps-view-more-btn">
              Xem tất cả đánh giá
            </button>
          </div>
        </div>
        {/* Kết thúc nửa dưới */}

        {/* Rating Modal */}
        <RatingModal
          product={fakeProduct}
          show={showRatingModal}
          setShow={setShowRatingModals}
          setHide={setShowRatingModals}
        />
      </Container>
    </div>
  );
};

export default Ratings;
