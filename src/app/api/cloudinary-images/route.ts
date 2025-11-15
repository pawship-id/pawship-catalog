import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "products";
    const maxResults = parseInt(searchParams.get("maxResults") || "100");

    console.log("Fetching images from Cloudinary...");
    console.log("Requested folder:", folder);

    let result;

    // Strategy 1: Try with wildcard search for any images
    try {
      const expression = `resource_type:image`;
      console.log("Trying general search:", expression);

      result = await cloudinary.search
        .expression(expression)
        .max_results(maxResults)
        .execute();

      console.log("Search successful!");
      console.log("Total images found:", result.total_count);
      console.log("Resources returned:", result.resources?.length);

      if (result.resources?.length > 0) {
        console.log("Sample image:", result.resources[0].public_id);
      }
    } catch (searchError: any) {
      console.error("Cloudinary search failed:", searchError.message);
      throw searchError;
    }

    // Filter by folder if specified and results found
    let filteredResources = result.resources;
    if (folder && folder !== "all") {
      filteredResources = result.resources.filter((resource: any) => {
        const publicId = resource.public_id;
        return (
          publicId.includes(folder) ||
          publicId.startsWith(`${folder}/`) ||
          publicId.includes(`/${folder}/`)
        );
      });
      console.log(
        `Filtered to ${filteredResources.length} images containing "${folder}"`
      );
    }

    // Format the response
    const images = filteredResources.map((resource: any) => ({
      publicId: resource.public_id,
      secureUrl: resource.secure_url,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      createdAt: resource.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: images,
      total: filteredResources.length,
      totalInCloudinary: result.total_count,
    });
  } catch (error: any) {
    console.error("Error fetching Cloudinary images:", error);
    console.error("Error details:", {
      message: error.message,
      http_code: error.http_code,
    });

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch images from Cloudinary",
        error: error.toString(),
        details: "Check server logs for more information",
      },
      { status: 500 }
    );
  }
}
