export const MAX_FILE_SIZE = 100 * 1024 * 1024;

const allowedExtensions = ["jpg", "jpeg", "png", "heic", "mp4", "mov"];

export function validateUploadFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!allowedExtensions.includes(extension)) {
    return "Formato no permitido. Usa JPG, PNG, HEIC, MP4 o MOV.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Cada archivo debe pesar máximo 100 MB.";
  }

  return null;
}

export function getFileKind(fileType: string) {
  return fileType.startsWith("video") ? "video" : "image";
}
