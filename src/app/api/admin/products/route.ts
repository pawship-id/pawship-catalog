import {
  bulkUploadFileToCloudinary,
  uploadFileToCloudinary,
  UploadResult,
} from "@/lib/helpers/cloudinary";
import dbConnect from "@/lib/mongodb";
import { ProductForm, VariantRow } from "@/lib/types/product";
import mongoose, { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import os from "os";
import { writeFile } from "fs/promises";
import ProductVariant from "@/lib/models/ProductVariant";

// POST: create new user
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const formData = await req.formData();

    let tags = formData.get("tags") as string;

    let data = {
      sku: formData.get("sku") as string,
      productName: formData.get("productName") as string,
      categoryId: formData.get("categoryId") as string,
      moq: Number(formData.get("moq")),
      productDescription: formData.get("productDescription") as string,
      tags: tags.trim().split(","),
      sizeProduct: {},
      productMedia: [] as { imageUrl: string; imagePublicId: string }[],
      variantTypes: JSON.parse(formData.get("variantTypes") as string),
      variantRows: [] as Types.ObjectId[],
      exclusive: JSON.parse(formData.get("exclusive") as string),
      preOrder: JSON.parse(formData.get("preOrder") as string),
    };

    const sizeProduct = formData.get("sizeProduct") as File | null;
    if (sizeProduct) {
      const buffer = Buffer.from(await sizeProduct.arrayBuffer());
      const filename = `${Date.now()}-${sizeProduct.name.replace(/\s/g, "_")}`;
      let tempFilePath = path.join(os.tmpdir(), filename);

      await writeFile(tempFilePath, buffer);

      let uploadResult: UploadResult = await uploadFileToCloudinary(
        tempFilePath,
        "product"
      );

      data.sizeProduct = {
        imageUrl: uploadResult.secureUrl,
        imagePublicId: uploadResult.publicId,
      };
    }

    const productMedia = formData.getAll("productMedia") as File[];
    if (productMedia && productMedia.length) {
      let uploadResult: UploadResult[] = await bulkUploadFileToCloudinary(
        productMedia,
        "product"
      );

      data.productMedia = uploadResult.map((el) => ({
        imageUrl: el.secureUrl,
        imagePublicId: el.publicId,
      }));
    }

    const variantRows = JSON.parse(
      (formData.get("variantRows") as string) || "[]"
    );

    if (variantRows && variantRows.length) {
      // upload, ambil url, save database
      let variantData: any[] = [];
      for (const variant of variantRows) {
        const { image, ...bodyVariant } = variant;

        if (image && typeof image === "string") {
          const uploadResult: UploadResult = await uploadFileToCloudinary(
            image,
            "product"
          );

          bodyVariant.image = {
            imageUrl: uploadResult.secureUrl,
            imagePublicId: uploadResult.publicId,
          };
        }

        variantData.push(bodyVariant);
      }

      const resultVariantData = await ProductVariant.insertMany(variantData, {
        rawResult: false,
      });

      const variantIds = resultVariantData.map((doc) => doc._id);

      data.variantRows = variantIds;
    }

    console.log(data);

    // 1. upload dlu size dan product image jika ada
    // 2. ambil public url, simpan ke database

    // const variantRowsData = formData.get("variantRows");
    // let image = variantRowsData ? JSON.parse(variantRowsData as string) : null;
    // console.log(image[0]);

    // const base64Image = `data:image/*;base64,${Buffer.from(image[0].image).toString("base64")}`;
    // console.log("image:", base64Image);

    // let uploadResult: UploadResult = await uploadFileToCloudinary(
    //   image[0].image,
    //   "product"
    // );

    // const session = await mongoose.startSession();
    // session.startTransaction();

    // try {
    //   // 1. upload gambar size ke cloudinary
    //   let blobSizeProduct = body.sizeProduct?.imageUrl;

    //   if (blobSizeProduct) {
    //     let base64SizeProduct = `data:image/*;base64,${Buffer.from(blobSizeProduct).toString("base64")}`;
    //     let uploadResult: UploadResult = await uploadFileToCloudinary(
    //       base64SizeProduct,
    //       "product"
    //     );

    //     console.log("berhasil");
    //   }
    // } catch (error) {
    //   console.log(error);
    // }

    // const product = await User.create(body);

    return NextResponse.json(
      {
        success: true,
        // data: product,
        message: `Product with SKU  successfully created`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log(error, "function POST /api/admin/products/route.ts");

    let errorMsg: string | string[];

    if (error.name === "ValidationError") {
      errorMsg = Object.values(error.errors).map((err: any) => err.message);
    } else if (error.name === "MongooseError") {
      errorMsg = error.message;
    } else {
      errorMsg = "Failed to create product";
    }

    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 400 }
    );
  }
}
