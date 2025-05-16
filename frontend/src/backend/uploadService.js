export const fileToBase64 = (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(imageFile);
  });
};

export const uploadAvatar = async (imageFile, username, onSuccess, onErrors) => {
  try {
    // Validar tamaño (máximo 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      onErrors('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    // Validar formato (solo imágenes)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      onErrors('Formato no admitido. Use JPG, PNG, GIF o WEBP.');
      return;
    }

    // Convertir el archivo a base64
    const base64Image = await fileToBase64(imageFile);
    
    // En una implementación futura, aquí podríamos comprimir la imagen
    // antes de enviarla para reducir el tamaño
    
    // Devolver directamente la cadena base64 al callback de éxito
    onSuccess(base64Image);
  } catch (error) {
    console.error("Error procesando imagen:", error);
    onErrors("Error al procesar la imagen.");
  }
};

export const isImageUrlValid = async (url) => {
  // Si es una cadena base64, considerarla válida
  if (url && url.startsWith('data:image/')) {
    return true;
  }
  
  // Si es una URL, comprobar si existe
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (e) {
      return false;
    }
  }
  
  return false;
};