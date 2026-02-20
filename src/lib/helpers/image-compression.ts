/**
 * Image Compression Helper
 * Compresses images if they exceed 1MB before upload
 */

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

/**
 * Compress image using Canvas API
 * @param file - The image file to compress
 * @param quality - Compression quality (0.1 to 1, default 0.7)
 * @returns Compressed image as File
 */
async function compressImageUsingCanvas(
  file: File,
  quality: number = 0.7,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Set canvas dimensions to image dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            // Create new File from blob
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          "image/jpeg",
          quality,
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress image if it exceeds 1MB
 * @param file - The image file to check and compress
 * @returns Original file if under 1MB, compressed file if over 1MB
 */
export async function compressImageIfNeeded(file: File): Promise<File> {
  // If file is already under 1MB, return as is
  if (file.size <= MAX_FILE_SIZE) {
    return file;
  }

  // Try to compress with different quality levels
  let quality = 0.7;
  let compressedFile = await compressImageUsingCanvas(file, quality);

  // If still too large, try lower quality
  while (compressedFile.size > MAX_FILE_SIZE && quality > 0.1) {
    quality -= 0.1;
    compressedFile = await compressImageUsingCanvas(file, quality);
  }

  // If still too large after compression, throw error
  if (compressedFile.size > MAX_FILE_SIZE) {
    throw new Error(
      `Unable to compress image below 1MB. Final size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
    );
  }

  return compressedFile;
}

/**
 * Compress multiple images if they exceed 1MB
 * @param files - Array of image files to check and compress
 * @returns Array of original/compressed files
 */
export async function compressImagesIfNeeded(files: File[]): Promise<File[]> {
  return Promise.all(files.map((file) => compressImageIfNeeded(file)));
}
