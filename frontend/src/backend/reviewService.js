import { appFetch, fetchConfig } from "./appFetch";

export const getMovieReviews = (imdbId, onSuccess, onErrors) => {
  appFetch(
    `/reviews/movie/${imdbId}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

export const getUserReviews = (userId, onSuccess, onErrors) => {
  appFetch(
    `/reviews/user/${userId}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

export const createReview = (reviewData, onSuccess, onErrors) => {
  appFetch(
    "/reviews",
    fetchConfig("POST", reviewData),
    onSuccess,
    onErrors
  );
};

export const updateReview = (reviewId, reviewData, onSuccess, onErrors) => {
  appFetch(
    `/reviews/${reviewId}`,
    fetchConfig("PUT", reviewData),
    onSuccess,
    onErrors
  );
};

export const deleteReview = (reviewId, onSuccess, onErrors) => {
  appFetch(
    `/reviews/${reviewId}`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
  );
};

export const voteReview = (reviewId, isHelpful, onSuccess, onErrors) => {
  appFetch(
    `/reviews/${reviewId}/vote`,
    fetchConfig("POST", { helpful: isHelpful }),
    onSuccess,
    onErrors
  );
};

export const removeVote = (reviewId, onSuccess, onErrors) => {
  appFetch(
    `/reviews/${reviewId}/vote`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
  );
};