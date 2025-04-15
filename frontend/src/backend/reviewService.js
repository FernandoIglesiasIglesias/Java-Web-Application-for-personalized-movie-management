import { appFetch, fetchConfig } from "./appFetch";

export const getMovieReviews = (imdbId, userId, onSuccess, onErrors) => {
  // Si no hay ID de película, devolver lista vacía
  if (!imdbId) {
    setTimeout(() => onSuccess([]), 0);
    return;
  }

  const url = userId ? `/reviews/movie/${imdbId}?userId=${userId}` : `/reviews/movie/${imdbId}`;
  
  // En lugar de usar appFetch, usaremos fetch directamente para evitar problemas de autenticación
  // cuando se obtienen reseñas públicas
  fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/tfg${url}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      // Para cualquier error, incluyendo 403, devolvemos una lista vacía
      return [];
    }
  })
  .then(data => onSuccess(data || []))
  .catch(() => {
    // En caso de cualquier error, simplemente devolvemos una lista vacía
    onSuccess([]);
  });
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