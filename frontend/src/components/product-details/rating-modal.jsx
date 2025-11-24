import { ratingModalHooks } from '#component-hooks/use-product-details-hooks';
import { Modal } from 'react-bootstrap';
import { FaStar, FaImage } from 'react-icons/fa';

const RatingModal = ({ productName, productId, ratingId, initialRating, initialComment, productImgUrl, hasRated, ...props }) => {
  const { setHide, show } = props;
  const {
    rating, hoveredStar, ratingLabels,
    handleStarClick, handleMouseEnter, handleMouseLeave
  } = ratingModalHooks.useRatingStars(initialRating);
  const { comment, setComment, handleSubmit } = ratingModalHooks.useRatingCreateComment({ productId, ratingId, rating, initialComment, setHide, hasRated });

  return (
    <>
      <Modal className='tps-rating-modal' show={show} onHide={() => setHide(false)} centered>
        <Modal.Header className="tps-rating-modal-header" closeButton>
          <Modal.Title>Đánh giá & nhận xét</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="tps-rating-product-info">
            <div className="tps-rating-product-image">
              <img src={productImgUrl || "/assets/images/default-product.png"} alt="Product" />
            </div>
            <h4>{productName}</h4>
          </div>
          <div className="tps-rating-form">
            <div className="tps-rating-stars-section">
              <h5>Đánh giá chung</h5>
              <div className="tps-rating-stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className="tps-rating-star-item"
                    onClick={() => handleStarClick(star)}
                  >
                    <div className="tps-star-icon">
                      <FaStar
                        className={star <= (hoveredStar || rating) ? "active" : ""}
                        onMouseEnter={() => handleMouseEnter(star)}
                        onMouseLeave={handleMouseLeave}
                      />
                    </div>
                    <span className="tps-star-label">
                      {ratingLabels[star - 1]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="tps-rating-comment-section">
              <textarea
                className="tps-rating-comment form-control"
                placeholder="Xin mời chia sẻ một số cảm nhận về sản phẩm (nhập tối thiểu 15 kí tự)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                minLength={15}
              ></textarea>
            </div>

            <div className="tps-rating-upload-section">
              <button type="button" className="tps-rating-upload-btn">
                <FaImage />
                <span>Thêm hình ảnh</span>
              </button>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="tps-rating-submit-section">
          <button type="button" className="btn tps-rating-submit-btn" onClick={handleSubmit}>
            {hasRated ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RatingModal;