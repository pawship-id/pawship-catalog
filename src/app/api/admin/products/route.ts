import {
  bulkUploadFileToCloudinary,
  uploadFileToCloudinary,
  UploadResult,
} from "@/lib/helpers/cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { generateSlug } from "@/lib/helpers";
import dbConnect from "@/lib/mongodb";
import ProductVariant from "@/lib/models/ProductVariant";
import Product from "@/lib/models/Product";
import { VariantRowForm } from "@/lib/types/product";
import Tag from "@/lib/models/Tag";
import { TagForm } from "@/lib/types/tag";

// GET: read all product
export async function GET() {
  await dbConnect();

  try {
    const products = await Product.find({})
      .select("productName slug categoryId productDescription productMedia")
      .populate({
        path: "categoryDetail",
        select: "name",
      })
      .sort({ createdAt: -1 })
      .exec();

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
    let tagData = JSON.parse(formData.get("tags") as string);

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

    let data = {
      productName: productName,
      categoryId: formData.get("categoryId") as string,
      moq: Number(formData.get("moq")),
      productDescription: formData.get("productDescription") as string,
      tags: tags,
      sizeProduct: {},
      productMedia: [] as { imageUrl: string; imagePublicId: string }[],
      variantTypes: JSON.parse(formData.get("variantTypes") as string),
      exclusive: JSON.parse(formData.get("exclusive") as string),
      preOrder: JSON.parse(formData.get("preOrder") as string),
      marketingLinks: JSON.parse(formData.get("marketingLinks") as string),
      slug: generateSlug(productName),
    };

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

    const product = await Product.create(data);

    const variantRows = JSON.parse(
      (formData.get("variantRows") as string) || "[]"
    );

    const variantRowsData = variantRows.map((el: VariantRowForm) => ({
      ...el,
      productId: product._id,
    }));

    await ProductVariant.insertMany(variantRowsData, {
      rawResult: false,
    });

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: `Product ${product.productName} successfully created`,
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
