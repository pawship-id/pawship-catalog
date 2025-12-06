const XLSX = require('xlsx');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
try {
    const envPath = path.join(__dirname, '../../../.env');
    console.log('📁 Looking for .env at:', envPath);

    if (fs.existsSync(envPath)) {
        console.log('✅ .env file found');
        const envContent = fs.readFileSync(envPath, 'utf8');

        envContent.split('\n').forEach(line => {
            // Skip comments and empty lines
            if (line.trim().startsWith('#') || !line.trim()) return;

            const match = line.match(/^([^=:#]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();

                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });

        if (process.env.MONGODB_URI) {
            console.log('✅ MONGODB_URI loaded from .env');
        } else {
            console.log('⚠️  MONGODB_URI not found in .env');
        }
    } else {
        console.log('⚠️  .env file not found at:', envPath);
    }
} catch (error) {
    console.log('⚠️  Error loading .env file:', error.message);
}

// Since models are in TypeScript, we need to handle them differently
// We'll define the models directly here using the existing schemas in DB
let Product, ProductVariant, Category, Tag;

// Currency conversion rates (1 IDR to other currencies)
const CURRENCY_RATES = {
    USD: 1 / 16000,      // IDR to USD
    SGD: 1 / 12000,      // IDR to SGD
    HKD: 1 / 2000,       // IDR to HKD
}

// Helper function to generate slug
function generateSlug(text) {
    text = text.replace(/[^a-zA-Z0-9]/g, "-");

    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear().toString().slice(-2);
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const randomChars = Math.random().toString(36).substring(2, 4);

    const id = `${randomChars}${day}${month}${year}${seconds}`;

    return text.toLowerCase().split(" ").join("-") + "-" + id;
}

// Helper function to generate random code
function generateRandomCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Helper function to parse and clean array data
function parseArrayData(data) {
    if (!data || data.trim() === '') return [];
    return data.split(',').map(item => item.trim()).filter(item => item !== '');
}

// Connect to MongoDB
async function connectDB() {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not set. Please check your .env file.');
        }

        console.log('🔌 Connecting to MongoDB...');
        console.log('   Using URI:', mongoUri.substring(0, 30) + '...');

        await mongoose.connect(mongoUri, {
            dbName: process.env.MONGODB_DATABASE_NAME,
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds
        });
        console.log('✅ MongoDB connected successfully');

        // Debug: List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        console.log('📚 Available collections:', collectionNames.join(', '));

        // Initialize models after connection
        Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
        ProductVariant = mongoose.models.ProductVariant || mongoose.model('ProductVariant', new mongoose.Schema({}, { strict: false, collection: 'product_variants' }));
        Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false, collection: 'categories' }));
        Tag = mongoose.models.Tag || mongoose.model('Tag', new mongoose.Schema({}, { strict: false, collection: 'tags' }));

        console.log('✅ Models initialized');

        // Debug: Count and show sample data
        const categoryCount = await Category.countDocuments();
        const tagCount = await Tag.countDocuments();
        console.log(`📊 Documents - Categories: ${categoryCount}, Tags: ${tagCount}`);


    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
}

// Main seeding function
async function seedProducts() {
    try {
        console.log('🌱 Starting product seeding...\n');

        // Read Excel file
        const filePath = path.join(__dirname, '../../../Template Data - Bulk Product.xlsx');
        console.log('📂 Reading Excel file from:', filePath);

        if (!fs.existsSync(filePath)) {
            throw new Error(`Excel file not found at: ${filePath}`);
        }

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON - start from row 2 (baris 1 = header, baris 2+ = data)
        const rawData = XLSX.utils.sheet_to_json(worksheet, {
            defval: ''
        });

        console.log(`📊 Found ${rawData.length} rows to process\n`);

        if (rawData.length === 0) {
            console.log('⚠️  No data found in Excel file');
            return;
        }

        // Debug: Show first row to see column names
        console.log('📋 Excel Columns:', Object.keys(rawData[0]).join(', '));
        console.log('');


        // Group rows: Product Name = new product, empty Product Name = variant of previous product
        const productsArray = [];
        let currentProduct = null;

        rawData.forEach((row, index) => {
            const productName = row['Product Name'];

            if (productName && productName.trim() !== '') {
                // New product
                currentProduct = {
                    productData: row,
                    variants: [row] // First row is also a variant
                };
                productsArray.push(currentProduct);
            } else if (currentProduct) {
                // Additional variant for current product
                currentProduct.variants.push(row);
            } else {
                // No product yet, skip this row
                console.log(`⚠️  Row ${index + 1}: Skipping - no product name and no previous product`);
            }
        });

        console.log(`🏷️  Found ${productsArray.length} unique products\n`);

        // Debug: Show product-variant mapping
        console.log('📋 Product-Variant Mapping:');
        productsArray.forEach((item, idx) => {
            console.log(`   ${idx + 1}. ${item.productData['Product Name']}: ${item.variants.length} variant(s)`);
        });
        console.log('');

        let successCount = 0;
        let errorCount = 0;
        let currentIndex = 0;
        const totalProducts = productsArray.length;

        // Process each product
        for (const { productData, variants } of productsArray) {
            currentIndex++;
            const productName = productData['Product Name'];

            try {
                console.log(`\n[${currentIndex}/${totalProducts}] 📦 Processing: ${productName} (${variants.length} variants)`);

                // 1. Find Category by name (Category model uses 'name' field)
                const categoryName = productData['Category'];
                if (!categoryName) {
                    throw new Error('Category is required');
                }

                const categoryNameTrimmed = categoryName.trim();

                const category = await Category.findOne({
                    name: {
                        $regex: `^${categoryNameTrimmed}$`,
                        $options: 'i' // case insensitive
                    }
                })
                    .lean()
                    .exec();

                if (!category) {
                    throw new Error(`Category "${categoryName}" not found in database. Please create it first.`);
                }
                console.log(`   ✓ Category: ${category.name}`);

                // 2. Find or Create Tags
                const tagIds = [];
                const tagsData = productData['Tags'];
                if (tagsData && tagsData.trim() !== '') {
                    const tagNames = parseArrayData(tagsData);

                    for (const tagName of tagNames) {
                        const tagNameTrimmed = tagName.trim();

                        let tag = await Tag.findOne({
                            tagName: { $regex: new RegExp(`^${tagNameTrimmed}$`, 'i') }
                        }).lean().exec();

                        if (!tag) {
                            // Tag not found, create new one
                            const newTag = await Tag.create({
                                tagName: tagNameTrimmed,
                                deleted: false,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });
                            tag = newTag.toObject();
                            console.log(`      ✓ Tag created: ${tag.tagName}`);
                        }

                        tagIds.push(tag._id);
                    }

                    if (tagIds.length > 0) {
                        console.log(`   ✓ Tags: ${tagIds.length} tag(s) processed`);
                    }
                }

                // 3. Process Exclusive Countries
                const excludeCountryData = productData['Exclude Country'];
                const exclusive = {
                    enabled: false,
                    country: []
                };

                if (excludeCountryData && excludeCountryData.trim() !== '') {
                    exclusive.enabled = true;
                    exclusive.country = parseArrayData(excludeCountryData)
                        .map(country => capitalizeFirstLetter(country));
                    console.log(`   ✓ Exclusive: ${exclusive.country.join(', ')}`);
                }

                // 4. Process Pre-Order
                const preOrderData = productData['Pre-Order'];
                const preOrder = {
                    enabled: false,
                    leadTime: ''
                };

                if (preOrderData && preOrderData.trim() !== '') {
                    preOrder.enabled = true;
                    preOrder.leadTime = preOrderData.trim();
                    console.log(`   ✓ Pre-Order: ${preOrder.leadTime}`);
                }

                // 5. Process Marketing Links
                const marketingLinksData = productData['Marketing Links'];
                const marketingLinks = marketingLinksData ? parseArrayData(marketingLinksData) : [];

                // 6. Process Size Product Images
                const sizeProduct = [];
                for (let i = 1; i <= 10; i++) {
                    const sizeImage = productData[`Sizes Product Images ${i}`];
                    if (sizeImage && sizeImage.trim() !== '') {
                        sizeProduct.push({
                            imageUrl: sizeImage.trim(),
                            imagePublicId: '-'
                        });
                    }
                }
                console.log(`   ✓ Size Images: ${sizeProduct.length} images`);

                // 7. Process Product Media (Images + Videos)
                const productMedia = [];

                // Product Images
                for (let i = 1; i <= 10; i++) {
                    const productImage = productData[`Product Images ${i}`];
                    if (productImage && productImage.trim() !== '') {
                        productMedia.push({
                            imageUrl: productImage.trim(),
                            imagePublicId: '-',
                            type: 'image'
                        });
                    }
                }

                // Product Videos
                for (let i = 1; i <= 10; i++) {
                    const productVideo = productData[`Product Videos ${i}`];
                    if (productVideo && productVideo.trim() !== '') {
                        productMedia.push({
                            imageUrl: productVideo.trim(),
                            imagePublicId: '-',
                            type: 'video'
                        });
                    }
                }
                console.log(`   ✓ Media: ${productMedia.length} items (images + videos)`);

                // 8. Process Variant Types
                const variantTypeData = productData['Variant Type'];
                const variantTypes = [];
                if (variantTypeData && variantTypeData.trim() !== '') {
                    const types = parseArrayData(variantTypeData);
                    types.forEach(type => {
                        variantTypes.push({ name: type });
                    });
                    console.log(`   ✓ Variant Types: ${variantTypes.map(v => v.name).join(', ')}`);
                } else {
                    console.log(`   ⚠️  No Variant Type data found`);
                }


                // 9. Generate Slug
                const slug = generateSlug(productName);

                // 10. Create Product
                const product = await Product.create({
                    productName: productName,
                    slug: slug,
                    categoryId: category._id,
                    moq: parseInt(productData['MOQ']) || 1,
                    productDescription: productData['Product Description'] || '',
                    tags: tagIds,
                    exclusive: exclusive,
                    preOrder: preOrder,
                    marketingLinks: marketingLinks,
                    sizeProduct: sizeProduct,
                    productMedia: productMedia,
                    variantTypes: variantTypes,
                    deleted: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                console.log(`   ✓ Product created (ID: ${product._id})`);

                // 11. Create Product Variants (all variants from the array)
                console.log(`   📋 Creating ${variants.length} variant(s)...`);

                let createdCount = 0;
                let skippedCount = 0;

                const variantPromises = variants.map(async (variantRow, i) => {
                    // Parse variant attributes as object: { Size: "M", Color: "Boy" }
                    const attributesData = variantRow['Attributes'];
                    const attrs = {};
                    const attrValuesArray = [];

                    if (attributesData && attributesData.trim() !== '' && variantTypes.length > 0) {
                        const attrValues = parseArrayData(attributesData); // Split by comma and trim

                        variantTypes.forEach((vType, index) => {
                            if (attrValues[index]) {
                                // Use variant type name as key, attribute value as value
                                const attrValue = attrValues[index].trim();
                                attrs[vType.name] = attrValue;
                                attrValuesArray.push(attrValue);
                            }
                        });
                    }

                    // Generate Variant Name from attributes joined with "-"
                    let variantName = '';
                    if (attrValuesArray.length > 0) {
                        variantName = attrValuesArray.join('-');
                    } else {
                        // No attributes, skip this variant
                        console.log(`      ⚠️  SKIPPED - Product: "${productName}" - No attributes to generate variant name`);
                        skippedCount++;
                        return null;
                    }

                    // Get SKU from Excel
                    const sku = variantRow['Variant SKU Code'];
                    if (!sku || sku.trim() === '') {
                        console.log(`      ⚠️  SKIPPED - Product: "${productName}", Variant: "${variantName}" - SKU is empty`);
                        skippedCount++;
                        return null;
                    }

                    const skuTrimmed = sku.trim();

                    // Check if SKU already exists
                    const existingSKU = await ProductVariant.findOne({ sku: skuTrimmed }).lean().exec();
                    if (existingSKU) {
                        console.log(`      ⚠️  SKIPPED - Product: "${productName}", Variant: "${variantName}" - SKU "${skuTrimmed}" already exists`);
                        skippedCount++;
                        return null;
                    }

                    // Parse variant image
                    let variantImage = null;
                    const variantImageUrl = variantRow['Variant Image'];
                    if (variantImageUrl && variantImageUrl.trim() !== '') {
                        variantImage = {
                            imageUrl: variantImageUrl.trim(),
                            imagePublicId: '-'
                        };
                    }

                    // Parse prices
                    const priceIDR = parseFloat(variantRow['Price IDR']) || 0;
                    const priceUSD = variantRow['Price USD'] && variantRow['Price USD'] !== ''
                        ? parseFloat(variantRow['Price USD'])
                        : parseFloat((priceIDR * CURRENCY_RATES.USD).toFixed(2));
                    const priceSGD = variantRow['Price SGD'] && variantRow['Price SGD'] !== ''
                        ? parseFloat(variantRow['Price SGD'])
                        : parseFloat((priceIDR * CURRENCY_RATES.SGD).toFixed(2));
                    const priceHKD = variantRow['Price HKD'] && variantRow['Price HKD'] !== ''
                        ? parseFloat(variantRow['Price HKD'])
                        : parseFloat((priceIDR * CURRENCY_RATES.HKD).toFixed(2));

                    const price = {
                        IDR: priceIDR,
                        USD: priceUSD,
                        SGD: priceSGD,
                        HKD: priceHKD
                    };

                    // Create variant
                    createdCount++;
                    return ProductVariant.create({
                        codeRow: generateRandomCode(),
                        position: i + 1,
                        image: variantImage,
                        sku: skuTrimmed,
                        attrs,
                        name: variantName,
                        stock: parseInt(variantRow['Variant Stock']) || 0,
                        price,
                        productId: product._id,
                        deleted: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                });

                const results = await Promise.all(variantPromises);
                const createdVariants = results.filter(v => v !== null);

                if (createdVariants.length === 0) {
                    // No variants created, delete the product
                    await Product.findByIdAndDelete(product._id);
                    console.log(`      ⚠️  No variants created, product deleted`);
                    console.log(`   ❌ Product "${productName}" removed - no valid variants`);
                    errorCount++;
                } else {
                    console.log(`      ✓ ${createdVariants.length} variant(s) created${skippedCount > 0 ? `, ${skippedCount} skipped` : ''}`);
                    successCount++;
                    console.log(`   ✅ Completed successfully!`);
                }

            } catch (error) {
                errorCount++;
                console.error(`   ❌ Error:`, error.message);
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('📊 SEEDING SUMMARY');
        console.log('='.repeat(50));
        console.log(`✅ Successfully processed: ${successCount} products`);
        console.log(`❌ Errors: ${errorCount} products`);
        console.log('='.repeat(50) + '\n');

    } catch (error) {
        console.error('❌ Fatal error during seeding:', error);
        throw error;
    }
}

// Run seeder
async function run() {
    try {
        await connectDB();
        await seedProducts();
        console.log('🎉 Seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('💥 Seeding failed:', error);
        process.exit(1);
    }
}

run();
