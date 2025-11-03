const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);

const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;

const computeAverageFromReviews = (reviews = []) => {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return null;
  }

  const sum = reviews.reduce((acc, review) => {
    if (isFiniteNumber(review?.rating)) {
      return acc + review.rating;
    }
    return acc;
  }, 0);

  if (sum === 0) {
    const hasRating = reviews.some((review) => isFiniteNumber(review?.rating));
    if (!hasRating) {
      return null;
    }
  }

  const ratedReviews = reviews.filter((review) => isFiniteNumber(review?.rating));
  if (ratedReviews.length === 0) {
    return null;
  }

  return parseFloat((sum / ratedReviews.length).toFixed(2));
};

export const getVendorAverageRating = (vendor, reviews = []) => {
  if (!vendor) {
    return 0;
  }

  const candidates = [
    vendor?.ratings?.average,
    vendor?.reviewStats?.averageRating,
    vendor?.stats?.averageRating,
    vendor?.salesStats?.averageRating,
    vendor?.salesStats?.ratings?.average,
    vendor?.performanceStats?.averageRating,
    vendor?.performanceStats?.rating?.average,
    vendor?.performanceMetrics?.averageRating,
    vendor?.businessStats?.supplierRating,
    vendor?.businessStats?.averageRating,
    vendor?.metrics?.averageRating,
    vendor?.averageRating,
    vendor?.rating
  ];

  const found = candidates.find(isFiniteNumber);
  if (isFiniteNumber(found)) {
    return found;
  }

  const computed = computeAverageFromReviews(reviews);
  if (isFiniteNumber(computed)) {
    return computed;
  }

  return 0;
};

export const getVendorReviewCount = (vendor, reviews = []) => {
  if (!vendor) {
    return 0;
  }

  const candidates = [
    vendor?.ratings?.count,
    vendor?.reviewStats?.totalReviews,
    vendor?.stats?.totalReviews,
    vendor?.salesStats?.totalReviews,
    vendor?.salesStats?.ratings?.count,
    vendor?.performanceStats?.totalReviews,
    vendor?.performanceStats?.reviews?.count,
    vendor?.performanceMetrics?.totalReviews,
    vendor?.businessStats?.reviewCount,
    vendor?.businessStats?.totalReviews,
    vendor?.metrics?.totalReviews,
    vendor?.totalReviews
  ];

  const found = candidates.find(isNonNegativeInteger);
  if (isNonNegativeInteger(found)) {
    return found;
  }

  if (Array.isArray(reviews)) {
    const ratedReviews = reviews.filter((review) => isFiniteNumber(review?.rating));
    if (ratedReviews.length > 0) {
      return ratedReviews.length;
    }
  }

  return 0;
};

export const formatAverageRating = (rating) => {
  if (!isFiniteNumber(rating)) {
    return '0.0';
  }

  return rating.toFixed(1);
};

export const getProductAverageRating = (product, reviews = []) => {
  if (!product) {
    return 0;
  }

  const candidates = [
    product?.reviewStats?.averageRating,
    product?.ratingStats?.averageRating,
    product?.ratings?.average,
    product?.stats?.averageRating,
    product?.averageRating,
    product?.rating
  ];

  const found = candidates.find(isFiniteNumber);
  if (isFiniteNumber(found)) {
    return found;
  }

  const productReviews = Array.isArray(product?.reviews) ? product.reviews : reviews;
  const computed = computeAverageFromReviews(productReviews);
  if (isFiniteNumber(computed)) {
    return computed;
  }

  return 0;
};

export const getProductReviewCount = (product, reviews = []) => {
  if (!product) {
    return 0;
  }

  const candidates = [
    product?.reviewStats?.totalReviews,
    product?.reviewStats?.count,
    product?.ratingStats?.totalReviews,
    product?.ratingStats?.count,
    product?.ratings?.count,
    product?.stats?.totalReviews,
    product?.totalReviews
  ];

  const found = candidates.find(isNonNegativeInteger);
  if (isNonNegativeInteger(found)) {
    return found;
  }

  const productReviews = Array.isArray(product?.reviews) ? product.reviews : reviews;
  if (Array.isArray(productReviews) && productReviews.length > 0) {
    const ratedReviews = productReviews.filter((review) => isFiniteNumber(review?.rating));
    if (ratedReviews.length > 0) {
      return ratedReviews.length;
    }
  }

  if (Array.isArray(reviews) && reviews.length > 0) {
    const ratedReviews = reviews.filter((review) => isFiniteNumber(review?.rating));
    if (ratedReviews.length > 0) {
      return ratedReviews.length;
    }
  }

  return 0;
};

