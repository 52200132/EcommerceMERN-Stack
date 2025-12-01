import { useMemo, useState } from 'react';
import { FaStar, FaClock } from 'react-icons/fa';
import { Container } from 'react-bootstrap';

import { useTpsSelector } from '#custom-hooks';
import { useFilterRatings } from '#component-hooks/use-product-details-hooks';
import { formatDateTime } from '#utils';

import unknownAvatar from "assets/images/cat-avatar.jpg";
import RatingModal from './rating-modal';

const Ratings = () => {
  const ratingState = useTpsSelector(
    state => state.productDetails.ratings || {},
    { includeProps: ['rating_counts', 'ratings', 'rating_of_me'] }
  );
  const product = useTpsSelector(
    state => state.productDetails.product,
    {
      includeProps: ['product_name', 'primary_image_url', 'rating', 'num_reviews', '_id']
    });

  const ratingCounts = ratingState?.rating_counts || {};

  const normalizedRatings = useMemo(() => {
    const rawRatings = ratingState?.ratings || [];
    const RatingOfMe = ratingState?.rating_of_me ? [ratingState.rating_of_me] : [];
    return [...RatingOfMe, ...rawRatings].map(item => ({
      id: item?._id?.$oid || item?._id || item?.id,
      username: item?.user_id?.username || 'Ẩn danh',
      avatar: item?.user_id?.image,
      rating: item?.rating || 0,
      comment: item?.comment || '',
      date: formatDateTime(item?.createdAt),
      // hasImage: Array.isArray(item?.images) && item.images.length > 0,
      hasBought: Boolean(item?.hasBought || item?.isPurchased)
    }));
  }, [ratingState]);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const { handleFilterChange, activeFilter, filteredRatings } = useFilterRatings(normalizedRatings);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(<FaStar key={i} className={i < rating ? "active" : ""} />);
    }
    return stars;
  };

  const totalReviews = product.num_reviews || normalizedRatings.length || 0;
  // const safeAverage = product.rating || 0;
  const safeAverage = (Object.entries(ratingCounts).reduce((acc, [star, count]) => acc + (parseInt(star, 10) * count), 0) / (totalReviews || 1));

  return (
    <div className="tps-ratings-section">
      <Container>
        {/* Tổng quan đánh giá */}
        <div className='tps-top-half-section'>
          <div className="tps-ratings-header">
            <h3>Đánh giá {product.product_name}</h3>
          </div>

          <div className="tps-ratings-summary">
            <div className="tps-ratings-score">
              <div className="tps-ratings-average">
                <span className="tps-average-number">{safeAverage.toFixed(1)}</span>
                <span className="tps-average-total">/{5}</span>
              </div>
              <div className="tps-ratings-stars">
                {renderStars(safeAverage)}
              </div>
              <div className="tps-ratings-count">
                <span>{totalReviews} lượt đánh giá</span>
              </div>
              <div className="tps-ratings-write">
                <button className="tps-write-review-btn" onClick={() => setShowRatingModal(true)}>
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
                      style={{ width: `${totalReviews ? ((ratingCounts[star] || 0) / totalReviews) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="tps-rating-count">{ratingCounts[star] || 0} đánh giá</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Kết thúc tổng quan đánh gi */}

        {/* Đánh giá chi tiết */}
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
              {/* <button
                className={activeFilter === 'hasBought' ? 'active' : ''}
                onClick={() => handleFilterChange('hasBought')}
              >
                Đã mua hàng
              </button> */}
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
                  <img src={rating.avatar || unknownAvatar} alt={rating.username.charAt(0)} />
                </div>
                <div className="tps-rating-content">
                  <div className="tps-rating-info">
                    <h4 className="tps-rating-username">{rating.username}</h4>
                    <div className="tps-rating-stars">
                      <span className="tps-rating-text">
                        {rating.rating === 5 ? 'Tuyệt vời' : ''}
                        {rating.rating === 4 ? 'Tốt' : ''}
                        {rating.rating === 3 ? 'Bình thường' : ''}
                        {rating.rating === 2 ? 'Tệ' : ''}
                        {rating.rating === 1 ? 'Rất tệ' : ''}
                      </span>
                      {renderStars(rating.rating)}
                    </div>
                  </div>
                  <p className="tps-rating-comment">{rating.comment}</p>
                  {rating.hasBought && (
                    <div className="tps-rating-purchase">
                      <span>Đã mua tại TpsShop</span>
                    </div>
                  )}
                  <div className="tps-rating-date">
                    <FaClock /> Đánh giá đã đăng vào {rating.date || 'Không rõ'}
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
        {/* Kết thúc đánh giá chi tiết */}

        {/* Rating Modal */}
        <RatingModal
          productId={product._id}
          ratingId={ratingState?.rating_of_me?._id || null}
          initialRating={ratingState?.rating_of_me?.rating || 5}
          initialComment={ratingState?.rating_of_me?.comment || ''}
          hasRated={Boolean(ratingState?.rating_of_me)}
          productName={product.product_name}
          productImgUrl={product.primary_image_url}
          show={showRatingModal}
          setHide={setShowRatingModal}
        />
      </Container>
    </div>
  );
};

export default Ratings;
