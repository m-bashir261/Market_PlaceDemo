const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Listing = require('./models/Listing');
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
    { title: "Wireless Headphones", description: "High quality noise-canceling wireless headphones.", price: 99.99, brand: "SoundWave", countInStock: 50, _catObj: "Electronics", rating: 4.5, delivery_days: 5, image_urls: ["https://i.ibb.co/000000/headphones.jpg"] },
    { title: "Gaming Mouse", description: "Ergonomic gaming mouse with customizable RGB lighting.", price: 49.99, brand: "ClickPro", countInStock: 120, _catObj: "Electronics" ,rating: 3.5, delivery_days: 3, image_urls: ["https://i.ibb.co/000000/mouse.jpg"]},
    { title: "4K Monitor", description: "Stunning 4K resolution display with 144Hz refresh rate.", price: 299.99, brand: "Vision", countInStock: 30, _catObj: "Electronics",rating: 2.5, delivery_days: 7, image_urls: ["https://i.ibb.co/000000/monitor.jpg"] },
    { title: "Smartphone", description: "Latest generation smartphone with excellent camera.", price: 799.99, brand: "Techy", countInStock: 100, _catObj: "Electronics",rating: 5, delivery_days: 4, image_urls: ["https://i.ibb.co/000000/phone.jpg"] },
    { title: "Running Shoes", description: "Comfortable and lightweight running shoes.", price: 79.99, brand: "Stride", countInStock: 80, _catObj: "Fashion" ,rating: 0.5, delivery_days: 5, image_urls: ["https://i.ibb.co/000000/shoes.jpg"]},
    { title: "Leather Jacket", description: "Premium quality leather jacket for all seasons.", price: 149.99, brand: "StyleCo", countInStock: 25, _catObj: "Fashion" ,rating:3, delivery_days: 6, image_urls: ["https://i.ibb.co/000000/jacket.jpg"]},
    { title: "Sunglasses", description: "Stylish polarized sunglasses.", price: 39.99, brand: "Sunny", countInStock: 60, _catObj: "Fashion" ,rating: 4.5, delivery_days: 3, image_urls: ["https://i.ibb.co/000000/sunglasses.jpg"]},
    { title: "Office Chair", description: "Ergonomic office chair with lumbar support.", price: 129.99, brand: "ComfortSit", countInStock: 40, _catObj: "Home & Garden" ,rating: 2, delivery_days: 10, image_urls: ["https://i.ibb.co/000000/chair.jpg"]},
    { title: "Coffee Table", description: "Minimalist wooden coffee table.", price: 89.99, brand: "WoodWorks", countInStock: 20, _catObj: "Home & Garden" ,rating: 1.5, delivery_days: 8, image_urls: ["https://i.ibb.co/000000/table.jpg"]},
    { title: "Yoga Mat", description: "Non-slip yoga mat made with eco-friendly materials.", price: 24.99, brand: "Zen", countInStock: 150, _catObj: "Sports" ,rating: 1, delivery_days: 4, image_urls: ["https://i.ibb.co/000000/mat.jpg"]},
    { title: "Dumbbell Set", description: "Adjustable dumbbell set for home workouts.", price: 59.99, brand: "IronFit", countInStock: 45, _catObj: "Sports", delivery_days: 5, image_urls: ["https://i.ibb.co/000000/dumbbells.jpg"] }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected for seeding...');

        const categoryCount = await ProductCategory.countDocuments();
        const listingCount = await Listing.countDocuments();

        if (true) {
            console.log('Clearing and reseeding database forcefully...');
            
            await ProductCategory.deleteMany({});
            await Listing.deleteMany({});
            
            // Insert categories
            const insertedCategories = await ProductCategory.insertMany(seedCategories);
            console.log('Categories seeded successfully!');

            // Map category names to their new ObjectIds automatically
            const categoryMap = {};
            insertedCategories.forEach(cat => {
                categoryMap[cat.name] = cat._id;
            });

            // Prepare listings with correct ObjectIds for categories
            const listingsToInsert = seedProductsRaw.map(prod => {
                const seller_id = new mongoose.Types.ObjectId();
                return {
                    seller_id: seller_id,
                    category_id: categoryMap[prod._catObj], // Mapping ObjectId
                    title: prod.title,
                    description: prod.description,
                    price: prod.price,
                    delivery_days: prod.delivery_days,
                    image_urls: prod.image_urls,
                    countInStock: prod.countInStock,
                    rating: prod.rating || 0
                };
            });

            await Listing.insertMany(listingsToInsert);
            console.log('Listings seeded successfully!');
        } else {
            console.log('Database already contains categories/listings. Skipping seeding.');
            console.log(`Current Categories: ${categoryCount}, Current Listings: ${listingCount}`);
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('Error seeding database:', err);
        mongoose.connection.close();
        process.exit(1);
    }
};

seedDB();
