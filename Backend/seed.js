const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const ProductCategory = require('./models/ProductCategory');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/marketplace";

const seedCategories = [
    { name: "Electronics", description: "Gadgets and devices", imageUrl: "https://i.ibb.co/000000/electronics.jpg" },
    { name: "Fashion", description: "Clothing, shoes, and accessories", imageUrl: "https://i.ibb.co/000000/fashion.jpg" },
    { name: "Home & Garden", description: "Furniture and outdoor living", imageUrl: "https://i.ibb.co/000000/home.jpg" },
    { name: "Sports", description: "Sporting goods and equipment", imageUrl: "https://i.ibb.co/000000/sports.jpg" }
];

const seedProductsRaw = [
    { name: "Wireless Headphones", description: "High quality noise-canceling wireless headphones.", price: 99.99, brand: "SoundWave", countInStock: 50, _catObj: "Electronics" },
    { name: "Gaming Mouse", description: "Ergonomic gaming mouse with customizable RGB lighting.", price: 49.99, brand: "ClickPro", countInStock: 120, _catObj: "Electronics" },
    { name: "4K Monitor", description: "Stunning 4K resolution display with 144Hz refresh rate.", price: 299.99, brand: "Vision", countInStock: 30, _catObj: "Electronics" },
    { name: "Smartphone", description: "Latest generation smartphone with excellent camera.", price: 799.99, brand: "Techy", countInStock: 100, _catObj: "Electronics" },
    { name: "Running Shoes", description: "Comfortable and lightweight running shoes.", price: 79.99, brand: "Stride", countInStock: 80, _catObj: "Fashion" },
    { name: "Leather Jacket", description: "Premium quality leather jacket for all seasons.", price: 149.99, brand: "StyleCo", countInStock: 25, _catObj: "Fashion" },
    { name: "Sunglasses", description: "Stylish polarized sunglasses.", price: 39.99, brand: "Sunny", countInStock: 60, _catObj: "Fashion" },
    { name: "Office Chair", description: "Ergonomic office chair with lumbar support.", price: 129.99, brand: "ComfortSit", countInStock: 40, _catObj: "Home & Garden" },
    { name: "Coffee Table", description: "Minimalist wooden coffee table.", price: 89.99, brand: "WoodWorks", countInStock: 20, _catObj: "Home & Garden" },
    { name: "Yoga Mat", description: "Non-slip yoga mat made with eco-friendly materials.", price: 24.99, brand: "Zen", countInStock: 150, _catObj: "Sports" },
    { name: "Dumbbell Set", description: "Adjustable dumbbell set for home workouts.", price: 59.99, brand: "IronFit", countInStock: 45, _catObj: "Sports" }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected for seeding...');

        const categoryCount = await ProductCategory.countDocuments();
        const productCount = await Product.countDocuments();

        if (categoryCount === 0 || productCount === 0) {
            console.log('Missing categories or products. Clearing and reseeding initial data...');
            
            await ProductCategory.deleteMany({});
            await Product.deleteMany({});
            
            // Insert categories
            const insertedCategories = await ProductCategory.insertMany(seedCategories);
            console.log('Categories seeded successfully!');

            // Map category names to their new ObjectIds automatically
            const categoryMap = {};
            insertedCategories.forEach(cat => {
                categoryMap[cat.name] = cat._id;
            });

            // Prepare products with correct ObjectIds for categories
            const productsToInsert = seedProductsRaw.map(prod => {
                const sellerID = new mongoose.Types.ObjectId();
                return {
                    name: prod.name,
                    description: prod.description,
                    price: prod.price,
                    category: categoryMap[prod._catObj], // Mapping ObjectId
                    brand: prod.brand,
                    countInStock: prod.countInStock,
                    sellerID: sellerID
                };
            });

            await Product.insertMany(productsToInsert);
            console.log('Products seeded successfully!');
        } else {
            console.log('Database already contains categories/products. Skipping seeding.');
            console.log(`Current Categories: ${categoryCount}, Current Products: ${productCount}`);
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('Error seeding database:', err);
        mongoose.connection.close();
        process.exit(1);
    }
};

seedDB();
