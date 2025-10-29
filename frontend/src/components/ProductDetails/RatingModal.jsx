import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FaStar, FaImage } from 'react-icons/fa';

const RatingModal = ({ product, ...props }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(null);
  const { setHide, show } = props;

  const ratingLabels = ['Rất Tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'];

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleMouseEnter = (value) => {
    setHoveredStar(value);
  };

  const handleMouseLeave = () => {
    setHoveredStar(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would handle the submission logic
    console.log({ rating, comment });
  };

  return (
    <>
      {/* Rating Modal */}
      <Modal className='tps-rating-modal' show={show} onHide={() => setHide(false)} centered>
        <Modal.Header className="tps-rating-modal-header" closeButton>
          <Modal.Title>Đánh giá & nhận xét</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="tps-rating-product-info">
            <div className="tps-rating-product-image">
              <img src={product?.image || "/assets/images/default-product.png"} alt="Product" />
            </div>
            <h4>{product?.name || "Camera IP 360 độ 2MP TP-Link Tapo C202"}</h4>
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
            GỬI ĐÁNH GIÁ
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RatingModal;