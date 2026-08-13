import api from "./api";

export const uploadService = {
  // Uploads 1–6 image files and returns their Cloudinary URLs.
  // `files` is a FileList or array of File objects.
  uploadCafeImages: async (files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    const { data } = await api.post("/uploads/cafe-images", formData, {
      // Let the browser set its own multipart boundary — overriding the
      // instance's default "application/json" header is required here,
      // otherwise the request goes out as JSON with a FormData body attached.
      headers: { "Content-Type": undefined },
    });
    return data; // { success, message, urls: [...] }
  },
};
