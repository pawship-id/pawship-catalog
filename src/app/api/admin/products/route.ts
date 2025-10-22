import {
  bulkUploadFileToCloudinary,
  uploadFileToCloudinary,
  UploadResult,
} from "@/lib/helpers/cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { generateSlug } from "@/lib/helpers";
import { Types } from "mongoose";
import dbConnect from "@/lib/mongodb";
import ProductVariant from "@/lib/models/ProductVariant";
import Product from "@/lib/models/Product";

// GET: read all product
export async function GET() {
  await dbConnect();

  try {
    const rawProducts = await Product.find({})
      .select("productName slug categoryId productDescription productMedia")
      .populate({
        path: "categoryId",
        select: "name",
      })
      .sort({ createdAt: -1 })
      .lean();

    const products = rawProducts.map((product) => {
      const categoryObject = product.categoryId;

      delete product.categoryId;

      return {
        ...product,
        category: categoryObject,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: products,
        message: "Data products has been fetch",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, "function GET /api/admin/products/route.ts");

    return NextResponse.json(
      { success: false, message: "Failed to retrieve products data" },
      { status: 500 }
    );
  }
}

// POST: create new user
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const formData = await req.formData();

    let productName = formData.get("productName") as string;

    let data = {
      sku: formData.get("sku") as string,
      productName: productName,
      categoryId: formData.get("categoryId") as string,
      moq: Number(formData.get("moq")),
      productDescription: formData.get("productDescription") as string,
      tags: [] as string[],
      sizeProduct: {},
      productMedia: [] as { imageUrl: string; imagePublicId: string }[],
      variantTypes: JSON.parse(formData.get("variantTypes") as string),
      variantRows: [] as Types.ObjectId[],
      exclusive: JSON.parse(formData.get("exclusive") as string),
      preOrder: JSON.parse(formData.get("preOrder") as string),
      marketingLinks: JSON.parse(formData.get("marketingLinks") as string),
      slug: generateSlug(productName),
    };

    let tags = formData.get("tags") as string;

    if (tags) {
      data.tags = tags.trim().split(",");
    }

    const sizeProduct = formData.get("sizeProduct") as File | null;
    if (sizeProduct) {
      let uploadResult: UploadResult = await uploadFileToCloudinary(
        sizeProduct,
        "products/size"
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
        "products"
      );

      data.productMedia = uploadResult.map((el) => ({
        imageUrl: el.secureUrl,
        imagePublicId: el.publicId,
        type: el.type,
      }));
    }

    const variantRows = JSON.parse(
      (formData.get("variantRows") as string) || "[]"
    );

    const resultVariantData = await ProductVariant.insertMany(variantRows, {
      rawResult: false,
    });

    data.variantRows = resultVariantData.map((doc) => doc._id);

    const product = await Product.create(data);

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: `Product with SKU ${product.sku}  successfully created`,
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
