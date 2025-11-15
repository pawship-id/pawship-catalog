import Product from "@/lib/models/Product";
import dbConnect from "@/lib/mongodb";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import {
  bulkUploadFileToCloudinary,
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
  UploadResult,
} from "@/lib/helpers/cloudinary";
import { generateSlug } from "@/lib/helpers";
import ProductVariant from "@/lib/models/ProductVariant";
import Tag from "@/lib/models/Tag";
import { TagForm } from "@/lib/types/tag";
import { VariantRowForm } from "@/lib/types/product";

interface Context {
  params: Promise<{ id: string }>;
}

// GET: read category by ID
export async function GET(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const identifier = (await params).id;

    let product;

    if (isValidObjectId(identifier)) {
      product = await Product.findById(identifier); // by ID
    } else {
      product = await Product.findOne({ slug: identifier }); // by Slug
    }

    if (product) {
      product = await product.populate([
        {
          path: "productVariantsData",
        },
        {
          path: "tags",
          select: "_id tagName",
        },
        {
          path: "categoryDetail",
          select: "name",
        },
      ]);
    }

    // const categoryObject = product.categoryId;

    // delete product.categoryId;

    // product.category = categoryObject;

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: "Data product has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/admin/products/[id]/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to fetch product by ID" },
      { status: 400 }
    );
  }
}

// PUT: Update product
export async function PUT(req: NextRequest, { params }: Context) {
  await dbConnect();
  try {
    const { id } = await params;
    const formData = await req.formData();

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    let productName = formData.get("productName") as string;
    let tagData = JSON.parse(formData.get("tags") as string);

    // Handle tags
    const tags = await Promise.all(
      tagData.map(async (item: TagForm) => {
        let tag;
        if (item.isNew) {
          tag = await Tag.create({ tagName: item.tagName });
        } else {
          tag = await Tag.findOne({ tagName: item.tagName });
        }

        return tag._id;
      })
    );

    let data: any = {
      productName: productName,
      categoryId: formData.get("categoryId") as string,
      moq: Number(formData.get("moq")),
      productDescription: formData.get("productDescription") as string,
      tags: tags,
      variantTypes: JSON.parse(formData.get("variantTypes") as string),
      exclusive: JSON.parse(formData.get("exclusive") as string),
      preOrder: JSON.parse(formData.get("preOrder") as string),
      marketingLinks: JSON.parse(formData.get("marketingLinks") as string),
      slug: generateSlug(productName),
    };

    // Handle size product image update
    const sizeProduct = formData.get("sizeProduct") as File | null;
    if (sizeProduct && sizeProduct.size > 0) {
      // Delete old size product image if exists
      if (existingProduct.sizeProduct?.imagePublicId) {
        await deleteFileFromCloudinary(
          existingProduct.sizeProduct.imagePublicId
        );
      }

      // Upload new size product image
      let uploadResult: UploadResult = await uploadFileToCloudinary(
        sizeProduct,
        "products/size"
      );

      data.sizeProduct = {
        imageUrl: uploadResult.secureUrl,
        imagePublicId: uploadResult.publicId,
      };
    }

    // Handle product media update
    const productMedia = formData.getAll("productMedia") as File[];
    const deleteMediaIds = JSON.parse(
      (formData.get("deleteMediaIds") as string) || "[]"
    );

    // Delete marked media from Cloudinary
    if (deleteMediaIds.length > 0) {
      await Promise.all(
        deleteMediaIds.map((publicId: string) =>
          deleteFileFromCloudinary(publicId)
        )
      );

      // Remove deleted media from existing product media
      data.productMedia = existingProduct.productMedia.filter(
        (media: any) => !deleteMediaIds.includes(media.imagePublicId)
      );
    } else {
      data.productMedia = existingProduct.productMedia;
    }

    // Upload new product media if any
    if (productMedia && productMedia.length > 0 && productMedia[0].size > 0) {
      let uploadResult: UploadResult[] = await bulkUploadFileToCloudinary(
        productMedia,
        "products"
      );

      const newMedia = uploadResult.map((el) => ({
        imageUrl: el.secureUrl,
        imagePublicId: el.publicId,
        type: el.type,
      }));

      data.productMedia = [...(data.productMedia || []), ...newMedia];
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    // Handle variant updates
    const variantRows = JSON.parse(
      (formData.get("variantRows") as string) || "[]"
    );
    const deleteVariantIds = JSON.parse(
      (formData.get("deleteVariantIds") as string) || "[]"
    );
    const updateVariantImages = formData.get("updateVariantImages") as string;

    // Delete marked variants
    if (deleteVariantIds.length > 0) {
      await ProductVariant.deleteMany({ _id: { $in: deleteVariantIds } });
    }

    // Update or create variants
    for (const variant of variantRows) {
      if (variant._id) {
        // Update existing variant
        const updateData: any = {
          name: variant.name,
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock,
          discountedPrice: variant.discountedPrice,
          attrs: variant.attrs,
        };

        // Include image if it exists in the variant data
        if (variant.image) {
          updateData.image = variant.image;
        }

        await ProductVariant.findByIdAndUpdate(variant._id, updateData, {
          runValidators: true,
        });
      } else {
        // Create new variant
        await ProductVariant.create({
          ...variant,
          productId: id,
        });
      }
    }

    // Handle variant image uploads if updateVariantImages flag is true
    if (updateVariantImages === "true") {
      const variantImageUpdates = JSON.parse(
        (formData.get("variantImageUpdates") as string) || "[]"
      );

      for (const update of variantImageUpdates) {
        const variantId = update.variantId;
        const deleteImageIds = update.deleteImageIds || [];
        const newImages = update.newImages || [];

        const variant = await ProductVariant.findById(variantId);
        if (!variant) continue;

        // Delete old images from Cloudinary
        if (deleteImageIds.length > 0) {
          await Promise.all(
            deleteImageIds.map((publicId: string) =>
              deleteFileFromCloudinary(publicId)
            )
          );

          // Remove deleted images from variant
          variant.images = variant.images.filter(
            (img: any) => !deleteImageIds.includes(img.imagePublicId)
          );
        }

        // Add new images (already uploaded, just update references)
        if (newImages.length > 0) {
          variant.images = [...variant.images, ...newImages];
        }

        await variant.save();
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedProduct,
        message: `Product ${updatedProduct.productName} successfully updated`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error, "function PUT /api/admin/products/[id]/route.ts");

    let errorMsg: string | string[];

    if (error.name === "ValidationError") {
      errorMsg = Object.values(error.errors).map((err: any) => err.message);
    } else if (error.name === "MongooseError") {
      errorMsg = error.message;
    } else {
      errorMsg = "Failed to update product";
    }

    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 400 }
    );
  }
}

// DELETE: Soft delete product
export async function DELETE(req: NextRequest, { params }: Context) {
  await dbConnect();

  try {
    const { id } = await params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Soft delete using mongoose-delete plugin
    // @ts-ignore
    await product.delete();

    // Note: We don't delete images from Cloudinary on soft delete
    // Images remain in Cloudinary for potential restore

    return NextResponse.json(
      {
        success: true,
        message: `Product ${product.productName} successfully deleted`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function DELETE /api/admin/products/[id]/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
