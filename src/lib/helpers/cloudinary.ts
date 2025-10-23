import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import os from "os";
import { writeFile } from "fs/promises";

export interface UploadResult {
  secureUrl: string;
  publicId: string;
  type?: "video" | "image";
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Helper function to upload files from temporary local path to Cloudinary.
 * @param file File from uploaded file or string with file path
 * @param folder Target folder in Cloudinary (e.g., 'categories').
 * @returns Promise with secure URL and public ID.
 */
export const uploadFileToCloudinary = async (
  file: File | string,
  folder: string = "products",
  resource_type: "image" | "video" | "raw" | "auto" = "image"
): Promise<UploadResult> => {
  let filePath: string;

  if (file instanceof File) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
    let tempFilePath = path.join(os.tmpdir(), filename);

    await writeFile(tempFilePath, buffer);

    filePath = tempFilePath;
  } else {
    filePath = file;
  }

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
 * Helper function to upload files to Cloudinary.
 * @param filePath Array of File uploaded.
 * @param folder Target folder in Cloudinary (e.g., 'categories').
 * @returns Promise with secure URL and public ID.
 */
export const bulkUploadFileToCloudinary = async (
  filePath: File[],
  folder: string = "products"
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = filePath.map(async (file) => {
      console.log(file, "ini fileee");

      const arrayBuffer = await file.arrayBuffer();
      let buffer = Buffer.from(arrayBuffer);

      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `pawship catalog/${folder}`,
            resource_type: file.type.split("/")[0] as "video" | "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
    });

    const result = await Promise.all(uploadPromises);

    return result.map((item: any) => ({
      secureUrl: item.secure_url,
      publicId: item.public_id,
      type: item.resource_type,
    }));
  } catch (error) {
    console.error("Bulk Cloudinary Upload Error:", error);

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

export const cloudinaryClient = cloudinary;
