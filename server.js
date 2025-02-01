import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';




const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));


app.use(express.json());

// Ensure data directory exists
const dataDir = join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const dataFile = join(dataDir, 'data.json');

// Initialize data.json if it doesn't exist
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([], null, 2));
}

// Registration endpoint
app.post('/registerUser', (req, res) => {
    try {
        const userData = req.body;
        console.log('Received registration request:', userData);

        // Validate required fields
        if (!userData.username || !userData.email || !userData.password) {
            console.log('Missing required fields');
            return res.status(400).json({
                message: 'Missing required fields'
            });
        }

        // Read existing data
        let data = [];
        try {
            const fileContent = fs.readFileSync(dataFile, 'utf8');
            console.log('Current file content:', fileContent);
            data = JSON.parse(fileContent);

            if (!Array.isArray(data)) {
                console.log('Data is not an array, resetting to empty array');
                data = [];
            }
        } catch (readError) {
            console.error('Error reading data file:', readError);
            data = [];
        }

        // Check if username or email already exists
        const existingUser = data.find(user =>
            user.username === userData.username ||
            user.email === userData.email
        );

        if (existingUser) {
            console.log('User already exists');
            return res.status(400).json({
                message: 'Username or email already exists'
            });
        }

        // Generate unique ID and add to user data
        const { confirmPassword, ...userDataWithoutConfirm } = userData;
        const userWithId = {
            ...userDataWithoutConfirm,
            uid: uuidv4(),
            createdAt: new Date().toISOString()
        };

        // Add new user to data array
        data.push(userWithId);

        // Save updated data
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        console.log('User registered successfully:', userWithId.username);

        res.status(200).json({
            message: 'Registration successful',
            user: userWithId
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error occurred' });
    }
});

const friendPath = path.join(__dirname, "data", "friends.json");
app.post("/addFriend", (req, res) => {
    const newFriend = req.body;

    fs.readFile(friendPath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error reading file" });
        }

        const friend = JSON.parse(data);
        friend.push(newFriend);

        fs.writeFile(friendPath, JSON.stringify(friend, null, 2), "utf8", (err) => {
            if (err) {
                return res.status(500).json({ error: "Error writing file" });
            }
            res.status(200).json({ message: "User added successfully!", friend });
        });
    });
});

const messagePath = path.join(__dirname, "data", "messages.json");
// server.js - Add this endpoint
app.get('/getMessages', (req, res) => {
    const chatId = req.query.chatId;
    try {
        const messages = JSON.parse(fs.readFileSync(messagePath, 'utf8'));
        const filtered = messages.filter(msg => msg.chatId === chatId);
        res.json(filtered);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// Updated add message endpoint
app.post("/addMessage", (req, res) => {
    const newMessage = req.body;

    fs.readFile(messagePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error reading file" });
        }

        const messages = JSON.parse(data);
        messages.push({
            ...newMessage,
            id: uuidv4(),
            timestamp: new Date().toISOString()
        });

        fs.writeFile(messagePath, JSON.stringify(messages, null, 2), "utf8", (err) => {
            if (err) {
                return res.status(500).json({ error: "Error writing file" });
            }
            res.status(200).json({ message: "Message added successfully!", messages });
        });
    });
});

app.post("/removeFriend", (req, res) => {
    const friendToRemove = req.body;

    fs.readFile(friendPath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error reading file" });
        }

        let friends = JSON.parse(data);
        const updatedFriends = friends.filter((friend) => friend.uid !== friendToRemove.uid);

        fs.writeFile(friendPath, JSON.stringify(updatedFriends, null, 2), "utf8", (err) => {
            if (err) {
                return res.status(500).json({ error: "Error writing file" });
            }
            res.status(200).json({ message: "Friend removed successfully!", updatedFriends });
        });
    });
});

// GET endpoint to search users by email and password
app.get('/users', (req, res) => {
    try {
        console.log('Received login request:', req.query);
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        const { email, password } = req.query;

        // If email and password provided, search for matching user
        if (email && password) {
            console.log('Searching for user with email:', email);
            const user = data.find(u =>
                u.email === email &&
                u.password === password
            );

            if (user) {
                console.log('User found, sending response');
                res.json([user]);
            } else {
                console.log('No user found with provided credentials');
                res.json([]);
            }
        } else {
            console.log('No email/password provided');
            res.json(data);
        }
    } catch (error) {
        console.error('Detailed error in /users:', error);
        res.status(500).json({ message: 'Error reading users', error: error.message });
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
