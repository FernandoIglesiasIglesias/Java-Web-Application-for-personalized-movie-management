import { appFetch, fetchConfig } from "./appFetch";

// Asegurar que la función getMovieReviews en reviewService.js es correcta
export const getMovieReviews = (movieId, userId, page = 0, size = 10, sort = 'date', onSuccess, onErrors) => {
  let url = `/reviews/movie/${movieId}`;
  
  // Construir los parámetros de la consulta
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  params.append('page', page);
  params.append('size', size);
  params.append('sort', sort);
  
  // Añadir parámetros a la URL
  url = `${url}?${params.toString()}`;
  
  console.log(`Llamando a API con URL: ${url}`);
  
  appFetch(
    url,
    fetchConfig("GET"),
    (data) => {
      console.log("Respuesta exitosa de la API de reseñas:", data);
      onSuccess(data);
    },
    (error) => {
      console.error("Error en la API de reseñas:", error);
      onErrors(error);
    }
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