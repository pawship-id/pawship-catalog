import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export interface UploadResult {
  secureUrl: string;
  publicId: string;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Helper function to upload files from temporary local path to Cloudinary.
 * @param filePath Temporary file path created by Formidable.
 * @param folder Target folder in Cloudinary (e.g., 'categories').
 * @returns Promise with secure URL and public ID.
 */
export const uploadFileToCloudinary = async (
  filePath: string,
  folder: string = "products",
  resource_type: "image" | "video" | "raw" | "auto" = "image"
): Promise<UploadResult> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `pawship catalog/${folder}`,
      resource_type: resource_type,
    });

    // after upload completes, delete temporary file for cleanup
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      secureUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    // ensure file is deleted even if upload error occurs
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.error("Cloudinary Upload Error:", error);

    throw new Error("Failed to upload file to storage service.");
  }
};

/**
 * Helper function to delete a file from Cloudinary using its public ID.
 * @param publicId The public ID of the image stored in Cloudinary.
 * @returns Promise<void>
 */
export const deleteFileFromCloudinary = async (
  publicId: string
): Promise<void> => {
  if (!publicId) {
    throw new Error(
      "Cloudinary delete called without a public ID. Skipping delete operation."
    );
  }

  try {
    // Use cloudinary.uploader.destroy() to delete the asset
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok" && result.result !== "not found") {
      // Log error if Cloudinary returns status other than 'ok' or 'not found'
      console.error(
        `Cloudinary Deletion Failed for ID ${publicId}:`,
        result.result
      );
      throw new Error(
        `Failed to delete asset from Cloudinary. Status: ${result.result}`
      );
    }

    console.log(`Cloudinary asset deleted successfully. ID: ${publicId}`);
  } catch (error) {
    console.error("Cloudinary Deletion Error:", error);
    // Throw error so API Route can handle it
    throw new Error("An error occurred during Cloudinary deletion.");
  }
};
