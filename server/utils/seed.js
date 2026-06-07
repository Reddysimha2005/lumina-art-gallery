require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Painting = require('../models/Painting');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const CATEGORIES = [
    'Abstract', 'Realism', 'Impressionism', 'Portrait', 
    'Landscape', 'Modern', 'Mythology', 'Wildlife', 
    'Street Art', 'Spiritual', 'Contemporary Indian'
];

const MEDIUMS = [
    'Oil on Canvas', 'Watercolor', 'Acrylic', 
    'Digital', 'Charcoal', 'Mixed Media', 'Ink', 'Gouache'
];

const generateTitle = (category, i) => {
    const prefixes = ['Echoes of', 'Vision of', 'The', 'Beyond', 'Silent', 'Golden', 'Eternal'];
    const suffixes = ['Dreams', 'Reality', 'Light', 'Shadows', 'Harmony', 'Whispers'];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${category} ${suffixes[Math.floor(Math.random() * suffixes.length)]} ${i}`;
};

const generateArtist = () => {
    const first = ['Aarav', 'Maya', 'Kabir', 'Elena', 'Julian', 'Sofia', 'Rohan', 'Isabella', 'Vikram', 'Meera', 'Leo', 'Zara', 'Arjun', 'Ananya', 'David', 'Chloe'];
    const last = ['Sharma', 'Patel', 'Rossi', 'Chen', 'Dubois', 'Singh', 'Garcia', 'Kapur', 'Müller', 'Kim', 'Iyer', 'Silva', 'Gupta', 'Verma'];
    return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
};

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');

        // Clear existing data
        await Painting.deleteMany();
        console.log('Cleared existing paintings');

        const paintings = [];
        
        // Generate exactly 10 featured indices out of 100
        const featuredIndices = new Set();
        while(featuredIndices.size < 10) {
            featuredIndices.add(Math.floor(Math.random() * 100));
        }

        for (let i = 0; i < 100; i++) {
            const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            const price = Math.floor(Math.random() * (500000 - 3000 + 1)) + 3000;
            const year = Math.floor(Math.random() * (2024 - 1900 + 1)) + 1900;
            
            paintings.push({
                title: generateTitle(category, i),
                artist: generateArtist(),
                year: year,
                medium: MEDIUMS[Math.floor(Math.random() * MEDIUMS.length)],
                dimensions: `${Math.floor(Math.random() * 40 + 20)}x${Math.floor(Math.random() * 40 + 20)} inches`,
                description: `This is a beautiful ${category.toLowerCase()} painting created using ${MEDIUMS[Math.floor(Math.random() * MEDIUMS.length)]}. It evokes a sense of deep emotion and technical mastery.`,
                price: price,
                category: category,
                imageUrl: `https://picsum.photos/seed/${Math.random()}/800/600`,
                isSold: false,
                isFeatured: featuredIndices.has(i),
                likes: []
            });
        }

        await Painting.insertMany(paintings);
        console.log('Successfully seeded 100 paintings');

        // Ensure at least one admin exists
        const adminEmail = 'admin@artgallery.com';
        const adminExists = await User.findOne({ email: adminEmail });
        
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('admin123', salt);
            const admin = new User({
                name: 'Admin User',
                email: adminEmail,
                passwordHash: passwordHash,
                isVerified: true,
                role: 'admin'
            });
            await admin.save();
            console.log('Created default admin (admin@artgallery.com / admin123)');
        }

        console.log('Seeding Complete');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
