const { MongoClient, ObjectId } = require('mongodb');

async function insertFakeItems() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('borrow_lend_app');
        const itemsCollection = db.collection('items');
        const customersCollection = db.collection('customers');

        // Fetch all customers
        const customers = await customersCollection.find().toArray();

        // List of items, descriptions, and matching categories from your database
        const itemData = [
            // Camping category
            {
                name: "Camping Tent",
                description: "A spacious tent for 4 people. Perfect for weekend camping trips.",
                category: "Camping"
            },
            {
                name: "Sleeping Bag",
                description: "A warm, water-resistant sleeping bag for cold nights in the wild.",
                category: "Camping"
            },

            // Car Sharing category
            {
                name: "Toyota Corolla",
                description: "A reliable, fuel-efficient car. Great for city driving or long trips.",
                category: "Car Sharing"
            },
            {
                name: "Honda Civic",
                description: "A compact sedan with great mileage, available for short-term rentals.",
                category: "Car Sharing"
            },

            // Moving Van category
            {
                name: "Moving Van",
                description: "A large van with plenty of space for moving furniture or large items.",
                category: "Moving Van"
            },
            {
                name: "Truck with Lift",
                description: "A truck equipped with a hydraulic lift, perfect for heavy items.",
                category: "Moving Van"
            },

            // Tools category
            {
                name: "Power Drill",
                description: "Cordless power drill with a set of drill bits. Ideal for home DIY projects.",
                category: "Tools"
            },
            {
                name: "Circular Saw",
                description: "A powerful saw for cutting wood and other materials.",
                category: "Tools"
            },

            // Toys & Games category
            {
                name: "Board Game: Settlers of Catan",
                description: "A fun, strategic board game for up to 4 players. Perfect for game nights.",
                category: "Toys & Games"
            },
            {
                name: "Lego Set",
                description: "A large Lego set with over 1,000 pieces. Great for creative building.",
                category: "Toys & Games"
            },

            // Gardening category
            {
                name: "Lawn Mower",
                description: "Electric lawn mower. Ideal for keeping your lawn neat and tidy.",
                category: "Gardening"
            },
            {
                name: "Garden Hose",
                description: "50-foot flexible hose with adjustable nozzle for watering plants.",
                category: "Gardening"
            },

            // Books category
            {
                name: "The Great Gatsby",
                description: "A classic novel by F. Scott Fitzgerald.",
                category: "Books"
            },
            {
                name: "Harry Potter and the Sorcerer's Stone",
                description: "The first book in the Harry Potter series by J.K. Rowling.",
                category: "Books"
            },

            // Clothing category
            {
                name: "Winter Coat",
                description: "A heavy, insulated winter coat. Perfect for cold weather.",
                category: "Clothing"
            },
            {
                name: "Formal Dress",
                description: "A long, elegant evening dress. Great for formal events.",
                category: "Clothing"
            },

            // Electronics category
            {
                name: "GoPro Camera",
                description: "Action camera for recording high-quality videos in extreme conditions.",
                category: "Electronics"
            },
            {
                name: "Sony PlayStation 4",
                description: "Gaming console with wireless controllers. Includes popular games.",
                category: "Electronics"
            }
        ];

        // Insert one item per customer
        const itemsToInsert = customers.map((customer, index) => ({
            name: itemData[index % itemData.length].name,
            description: itemData[index % itemData.length].description,
            category: itemData[index % itemData.length].category,
            location: customer.address,  // Assign item location to customer's address
            hiringCost: (Math.random() * 20 + 5).toFixed(2),  // Random hiring cost between $5 and $25
            customerId: customer._id,  // Link item to customer
            imageUrl: null  // Set imageUrl to null for now
        }));

        // Insert items into the database
        const result = await itemsCollection.insertMany(itemsToInsert);
        console.log(`${result.insertedCount} items were inserted successfully!`);
    } catch (error) {
        console.error('Error inserting fake items:', error);
    } finally {
        await client.close();
    }
}

insertFakeItems();
