const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "*",
    methods: ["GET,PUT,POST,DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")))

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1); // Exit the process with failure
    }
}

startServer();