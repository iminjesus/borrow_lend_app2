const express = require('express');
const multer = require('multer');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const path = require('path');

// Initialize the Express app
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public')); // Serve static files from the public directory

// MongoDB Connection
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db, itemsCollection, customersCollection;

// Connect to MongoDB
client.connect().then(() => {
    console.log('Connected to MongoDB');
    db = client.db('borrow_lend_app');
    itemsCollection = db.collection('items');
    customersCollection = db.collection('customers');
}).catch(err => console.error('Failed to connect to MongoDB', err));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Prefix the file name with a timestamp to avoid name conflicts
    }
});
const upload = multer({ storage: storage });

// -----------------------------------
// Routes for Items
// -----------------------------------

// Get all items or filter by category
app.get('/items', async (req, res) => {
    const { category } = req.query;
    let query = {};

    // If the category exists and isn't 'All', use it to filter
    if (category && category !== 'All') {
        query.category = { $regex: new RegExp(category, 'i') }; // Case-insensitive matching
    }

    try {
        const items = await itemsCollection.find(query).toArray();
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Error fetching items' });
    }
});

// Get item by ID
app.get('/items/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await itemsCollection.findOne({ _id: new ObjectId(itemId) });

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(item);
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({ error: 'Error fetching item details' });
    }
});

app.post('/items', upload.single('image'), async (req, res) => {
    const { name, description, category, hiringCost, customerId } = req.body;

    try {
        // Check if the file upload worked
        if (!req.file) {
            console.error("No file uploaded");
        } else {
            console.log("Uploaded file: ", req.file);
        }

        const customer = await customersCollection.findOne({ _id: new ObjectId(customerId) });

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const newItem = {
            name,
            description,
            category,
            location: customer.address,  // Use the customer's address as the location
            hiringCost,
            imageUrl: req.file ? `/images/${req.file.filename}` : null  // Save the image URL
        };

        const result = await itemsCollection.insertOne(newItem);
        res.status(201).json({ success: true, item: result.ops[0] });
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ success: false, message: 'Error adding item to database' });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        // Check if the customer exists
        const customer = await customersCollection.findOne({ email });

        if (!customer) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        // Check password
        const match = await bcrypt.compare(password, customer.password);

        if (!match) {
            return res.status(400).json({ success: false, message: 'Invalid password' });
        }

        // Login successful
        res.json({ success: true, message: 'Login successful', customer });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, message: 'Error logging in' });
    }
});


// -----------------------------------
// Start the Server
// -----------------------------------

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
