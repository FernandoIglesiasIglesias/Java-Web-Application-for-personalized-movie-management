import {
    fetchConfig,
    appFetch,
} from "./appFetch";

export const uploadAvatar = (imageFile, username, onSuccess, onErrors) => {
    const formData = new FormData();
    formData.append("profileImage", imageFile); 
    formData.append("username", username);

    appFetch(
        "/uploads/uploadAvatar",
        fetchConfig("POST", formData),
        (response) => {
            const imageUrl = response.imageUrl;
            onSuccess(imageUrl);
        },
        onErrors
    );
};