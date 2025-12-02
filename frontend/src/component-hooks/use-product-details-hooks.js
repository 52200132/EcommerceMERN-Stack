import { useCreateRatingMutation, useUpdateRatingMutation } from "#services";
import { axiosBaseQueryUtil } from "#services/axios-config";
import { useEffect, useMemo, useRef, useState } from "react";
import { tns } from "tiny-slider";

export const productDetailsHooks = {
  useInitTinySlider: (selectorProductImagesSlider, selectorThumbnails, product) => {
    const imagesSlider = useMemo(() => ([
      product?.Images?.map(img => img.url),
      product?.Variants?.flatMap(variant => variant.Images.map(img => img.url))].flat())
      , [product]);
    const mainSliderRef = useRef(null);
    const thumbnailsSliderRef = useRef(null);
    // const [imgsTinySliderComponent] = useState(null);
    useEffect(() => {
      if (!imagesSlider || imagesSlider.length === 0) return;
      console.log('Initializing Tiny Slider for product images', imagesSlider);

      const mainSlider = tns({
        mode: 'gallery',
        nav: true,
        container: selectorProductImagesSlider,
        controls: false,
        mouseDrag: true,
        navContainer: selectorThumbnails,
        navAsThumbnails: true,
        // fixedWidth: 400,
        items: 1,
        swipeAngle: 15,
      });
      const thumbnailsSlider = tns({
        container: selectorThumbnails,
        items: 3,
        slideBy: 3,
        gutter: 8,
        nav: false,
        controls: true,
        controlsContainer: '#controls-thumbnails',
        mouseDrag: true,
        swipeAngle: 15,
        loop: false,
        rewind: false,
        fixedWidth: false,
        responsive: {
          767: {
            items: 5,
            slideBy: 5,
          }
        },
      });

      mainSliderRef.current = mainSlider;
      thumbnailsSliderRef.current = thumbnailsSlider;
      return () => {
        if (typeof mainSlider !== 'undefined' && mainSlider !== null) {
          mainSlider.destroy();
        }
        if (typeof thumbnailsSlider !== 'undefined' && thumbnailsSlider !== null) {
          thumbnailsSlider.destroy();
        }
      };
    }, [imagesSlider, selectorProductImagesSlider, selectorThumbnails]);

    return { imagesSlider, mainSliderRef }
  },
  useProductVariants: (product) => {
    const productVariants = useMemo(() => {
      return product?.Variants?.filter(v => v.is_active).map((variant, idx) => ({
        sku: variant.sku,
        price: variant.price,
        imageUrl: variant?.Images.find(img => img.is_primary)?.url || '',
        attributes: variant?.Attributes.filter(attr => attr.type === 'appearance'),
        index: idx,
        getOrigin: () => variant,
      })) || [];
    }, [product]);

    const [selectedVariant, setSelectedVariant] = useState(() => productVariants?.[0] ?? null);

    useEffect(() => {
      if (!productVariants.length) {
        return;
      }

      setSelectedVariant(prev => {
        if (prev && productVariants.some(v => v.sku === prev.sku)) {
          return prev;
        }
        return productVariants[0];
      });
    }, [productVariants]);

    return { productVariants, selectedVariant, setSelectedVariant };
  },
};

const filterRatings = (filter, list) => {
  if (filter === 'all') return list;
  if (filter === 'hasImage') return list.filter(rating => rating.hasImage);
  if (filter === 'hasBought') return list.filter(rating => rating.hasBought);
  if (filter.includes('-star')) {
    const starRating = parseInt(filter, 10);
    if (!Number.isNaN(starRating)) {
      return list.filter(rating => rating.rating === starRating);
    }
  }
  return list;
};

export const useFilterRatings = (normalizedRatings) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredRatings, setFilteredRatings] = useState(normalizedRatings);
  useEffect(() => {
    setFilteredRatings(filterRatings(activeFilter, normalizedRatings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, normalizedRatings]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  return {
    activeFilter,
    filteredRatings,
    handleFilterChange
  };
}

/**
 * Hooks quản lý trạng thái của Rating Modal
 */
export const ratingModalHooks = {
  // State cho sao trên modal đánh giá
  useRatingStars: (initialRating = 5) => {
    const [rating, setRating] = useState(initialRating);
    const [hoveredStar, setHoveredStar] = useState(null);
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

    return { rating, hoveredStar, ratingLabels, handleStarClick, handleMouseEnter, handleMouseLeave };
  },
  useRatingCreateComment: ({ productId, ratingId, rating, initialComment = '', setHide, hasRated }) => {
    const [createRating] = useCreateRatingMutation();
    const [updateRating] = useUpdateRatingMutation();
    const [comment, setComment] = useState(initialComment);

    const handleSubmit = (e) => {
      e.preventDefault();
      axiosBaseQueryUtil.configBehaviors = { showOverlay: true, showSuccessToast: true, showErrorToast: true };
      axiosBaseQueryUtil.message = {
        success: 'Đã gửi đánh giá',
        error: 'Không thể gửi đánh giá. Vui lòng thử lại sau!'
      };
      axiosBaseQueryUtil.callbackfn = () => {
        setHide(false);
      }
      if (hasRated) {
        updateRating({ productId, ratingId, rating, comment });
      } else {
        createRating({ productId, rating, comment });
      }
    };
    return { comment, setComment, handleSubmit };
  }
};