const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Listing = require('./models/Listing');
const User = require('./models/User');
const Order = require('./models/Order');
const Review = require('./models/Review');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/marketplace";

const realisticReviews = [
    { rating: 5, comment: "Amazing performance, the screen is stunning! Best laptop I've used for coding." },
    { rating: 4, comment: "Good value for money, but the battery life is average when multitasking." },
    { rating: 3, comment: "The keyboard feels a bit flimsy, but everything else is great. Performance is solid." },
    { rating: 5, comment: "Super fast shipping! The laptop is exactly as described and works like a charm." },
    { rating: 2, comment: "Disappointed with the thermal performance, gets quite hot during heavy use." },
    { rating: 5, comment: "Best laptop I've owned so far. The build quality is premium and the trackpad is smooth." },
    { rating: 4, comment: "Solid build quality, very sleek design. Wish it had more USB-C ports though." },
    { rating: 4, comment: "The webcam is poor, but the display makes up for it. Great for media consumption." },
    { rating: 4, comment: "A bit pricey, but you get what you pay for. The M-series chip is incredible." },
    { rating: 5, comment: "Exactly what I needed for university. Lightweight, fast, and stays quiet." }
];

async function seedLaptopReviews() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB...');

        // 1. Find the specific listing
        const listingId = "69fe547110322a0ccad88535";
        const laptop = await Listing.findById(listingId);
        if (!laptop) {
            console.error(`Error: Listing with ID ${listingId} not found.`);
            process.exit(1);
        }
        console.log(`Found listing: ${laptop.title} (${laptop._id})`);

        // 2. Find the specific buyer "shoyo"
        const buyer = await User.findOne({ username: 'shoyo', role: 'buyer' });
        if (!buyer) {
            console.error('Error: User "shoyo" with role "buyer" not found.');
            process.exit(1);
        }
        console.log(`Found buyer: ${buyer.username} (${buyer._id})`);

        // 3. Seed 10 reviews
        console.log('Seeding 10 reviews...');
        for (let i = 0; i < realisticReviews.length; i++) {
            const reviewData = realisticReviews[i];

            // Create a dummy order for this review (Review model requires order_id)
            const order = new Order({
                buyer_id: buyer._id,
                seller_id: laptop.seller_id,
                items: [{
                    listing_id: laptop._id,
                    quantity: 1,
                    price: laptop.price
                }],
                totalAmount: laptop.price,
                status: 'Delivered',
                shippingDetails: {
                    firstName: buyer.firstName,
                    lastName: buyer.lastName,
                    email: buyer.username + "@example.com",
                    phone: "1234567890",
                    addressLine1: "123 Test St",
                    city: "Cairo",
                    state: "Cairo",
                    postalCode: "12345",
                    country: "Egypt"
                }
            });

            const savedOrder = await order.save();

            // Create the review
            const review = new Review({
                buyer_id: buyer._id,
                listing_id: laptop._id,
                order_id: savedOrder._id,
                rating: reviewData.rating,
                comment: reviewData.comment
            });

            await review.save();
            console.log(`Review ${i + 1} added: ${reviewData.rating} stars`);
        }

        console.log('Successfully seeded 10 reviews!');
        mongoose.connection.close();
    } catch (err) {
        console.error('Error seeding reviews:', err);
        mongoose.connection.close();
        process.exit(1);
    }
}

seedLaptopReviews();
