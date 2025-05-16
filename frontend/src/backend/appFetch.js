import NetworkError from "./NetworkError";
import { config } from "../config/constants.js";

let networkErrorCallback;
let reauthenticationCallback;

const isJson = (response) => {
  const contentType = response.headers.get("content-type");
  return contentType && contentType.indexOf("application/json") !== -1;
};

const handleOkResponse = (response, onSuccess) => {
  if (!response.ok) {
    return false;
  }

  if (!onSuccess) {
    return true;
  }

  if (response.status === 204) {
    onSuccess();
    return true;
  }

  if (isJson(response)) {
    response.json().then((payload) => onSuccess(payload));
  } else {
    response.blob().then((blob) => onSuccess(blob));
  }

  return true;
};

const handle4xxResponse = (response, onErrors) => {
  if (response.status < 400 || response.status >= 500) {
    return false;
  }

  if (response.status === 401 && reauthenticationCallback) {
    reauthenticationCallback();
    return true;
  }

  if (!isJson(response)) {
    throw new NetworkError();
  }

  if (onErrors) {
    response.json().then((payload) => {
      if (payload.globalError || payload.fieldErrors) {
        onErrors(payload);
      }
    });
  }

  return true;
};

const handleResponse = (response, onSuccess, onErrors) => {
  if (handleOkResponse(response, onSuccess)) {
    return;
  }

  if (handle4xxResponse(response, onErrors)) {
    return;
  }

  throw new NetworkError();
};

export const init = (callback) => (networkErrorCallback = callback);

export const setReauthenticationCallback = (callback) =>
  (reauthenticationCallback = callback);

export const setServiceToken = (serviceToken) =>
  sessionStorage.setItem(config.SERVICE_TOKEN_NAME, serviceToken);

export const getServiceToken = () =>
  sessionStorage.getItem(config.SERVICE_TOKEN_NAME);

export const removeServiceToken = () =>
  sessionStorage.removeItem(config.SERVICE_TOKEN_NAME);

export const fetchConfig = (method, body) => {
  const fConfig = {
    method: method,
  };

  if (body) {
    if (body instanceof FormData) {
      fConfig.body = body;
    } else {
      fConfig.headers = { "Content-Type": "application/json" };
      fConfig.body = JSON.stringify(body);
    }
  }

  const serviceToken = getServiceToken();

  if (serviceToken) {
    if (fConfig.headers) {
      fConfig.headers["Authorization"] = `Bearer ${serviceToken}`;
    } else {
      fConfig.headers = { Authorization: `Bearer ${serviceToken}` };
    }
  }

  return fConfig;
};

export const appFetch = (path, options, onSuccess, onErrors) => {
  const requestUrl = `${process.env.REACT_APP_BACKEND_URL || ''}/tfg${path}`;

  fetch(requestUrl, options)
    .then(response => {
      // Añadir manejo especial para errores 404
      if (response.status === 404) {
        // Para errores 404, creamos un objeto de error con información
        return Promise.reject({
          status: 404,
          message: `Recurso no encontrado: ${path}`,
          isNotFound: true
        });
      }
      
      return handleResponse(response, onSuccess);
    })
    .catch(error => {
      // Verificar si es un error 404 que hemos creado
      if (error.isNotFound) {
        console.warn(`Recurso no encontrado (404): ${path}`);
        // Podemos manejar 404 de manera diferente, por ejemplo, no mostrando mensajes de error
        // ya que es un comportamiento esperado cuando buscamos recursos que pueden no existir
        onErrors(error);
      } else {
        console.error("Error procesando petición:", error);
        
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          // Error de red, probablemente el servidor está caído
          onErrors(new NetworkError());
        } else {
          onErrors(error);
        }
      }
    });
};