const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
require('dotenv').config();

const menuItems = [
    // Appetizers
    {
        name: 'Samosa',
        description: 'Crispy golden pastry filled with spiced potatoes and peas, served with tangy tamarind chutney',
        price: 80,
        category: 'appetizers',
        available: true,
        ingredients: []
    },
    {
        name: 'Chickenpakora',
        description: 'Tender chicken pieces marinated in spices and coated in crispy chickpea batter',
        price: 150,
        category: 'appetizers',
        available: true,
        ingredients: []
    },
    {
        name: 'Onionbhaji',
        description: 'Crispy fried onion fritters seasoned with aromatic Indian spices',
        price: 90,
        category: 'appetizers',
        available: true,
        ingredients: []
    },
    {
        name: 'Paneer-Tikka',
        description: 'Grilled cottage cheese cubes marinated in tandoori spices and yogurt',
        price: 180,
        category: 'appetizers',
        available: true,
        ingredients: []
    },
    {
        name: 'DahiPuri',
        description: 'Crispy hollow shells filled with creamy yogurt, sweet and spicy chutneys',
        price: 100,
        category: 'appetizers',
        available: true,
        ingredients: []
    },
    {
        name: 'Palak Paneer',
        description: 'Crispy hollow shells served with spicy tamarind water and chickpea filling (Pani Puri)',
        price: 90,
        category: 'appetizers',
        available: true,
        ingredients: []
    },

    // Main Courses
    {
        name: 'ButterChicken',
        description: 'Tender chicken pieces in rich tomato and cream sauce with aromatic spices',
        price: 350,
        category: 'main',
        available: true,
        ingredients: []
    },
    {
        name: 'ChickenBiryani',
        description: 'Fragrant basmati rice layered with spiced chicken, saffron, and herbs',
        price: 320,
        category: 'main',
        available: true,
        ingredients: []
    },
    {
        name: 'MalaiKofta',
        description: 'Cottage cheese and potato dumplings in creamy cashew and tomato gravy',
        price: 280,
        category: 'main',
        available: true,
        ingredients: []
    },
    {
        name: 'Rogan',
        description: 'Aromatic lamb curry slow-cooked with Kashmiri spices and yogurt (Rogan Josh)',
        price: 420,
        category: 'main',
        available: true,
        ingredients: []
    },
    {
        name: 'Chole Bhature',
        description: 'Spiced chickpea curry cooked with aromatic herbs and tangy tomatoes',
        price: 220,
        category: 'main',
        available: true,
        ingredients: []
    },
    {
        name: 'Dal Makhni',
        description: 'Creamy black lentils slow-cooked overnight with butter and cream (Dal Makhani)',
        price: 240,
        category: 'main',
        available: true,
        ingredients: []
    },

    // Desserts
    {
        name: 'GulabJamun',
        description: 'Soft milk dumplings soaked in rose-scented sugar syrup',
        price: 120,
        category: 'desserts',
        available: true,
        ingredients: []
    },
    {
        name: 'Rasmalai',
        description: 'Delicate cottage cheese patties in sweetened saffron-flavored milk',
        price: 150,
        category: 'desserts',
        available: true,
        ingredients: []
    },
    {
        name: 'Jalebi',
        description: 'Crispy sweet spirals deep-fried and soaked in sugar syrup',
        price: 100,
        category: 'desserts',
        available: true,
        ingredients: []
    },
    {
        name: 'Pista Kulfi',
        description: 'Traditional Indian ice cream with cardamom, pistachios, and saffron',
        price: 130,
        category: 'desserts',
        available: true,
        ingredients: []
    },
    {
        name: 'Gajar Ka Halwa',
        description: 'Warm carrot pudding cooked with milk, ghee, and garnished with nuts (Gajar Halwa)',
        price: 140,
        category: 'desserts',
        available: true,
        ingredients: []
    },

    // Beverages
    {
        name: 'Mango-Lassi',
        description: 'Creamy yogurt drink blended with fresh mango pulp and cardamom',
        price: 100,
        category: 'beverages',
        available: true,
        ingredients: []
    },
    {
        name: 'Chai',
        description: 'Spiced Indian tea brewed with milk, ginger, and aromatic spices (Masala Chai)',
        price: 60,
        category: 'beverages',
        available: true,
        ingredients: []
    },
    {
        name: 'Lime-Soda',
        description: 'Refreshing fizzy drink with fresh lime juice and a hint of salt',
        price: 70,
        category: 'beverages',
        available: true,
        ingredients: []
    }
];

async function seedMenu() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing menu items
        await MenuItem.deleteMany({});
        console.log('Cleared existing menu items');

        // Insert new menu items
        const result = await MenuItem.insertMany(menuItems);
        console.log(`Successfully added ${result.length} menu items`);

        // Display summary by category
        const categories = ['appetizers', 'main', 'desserts', 'beverages'];
        for (const category of categories) {
            const count = result.filter(item => item.category === category).length;
            console.log(`  - ${category}: ${count} items`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding menu:', error);
        process.exit(1);
    }
}

seedMenu();
