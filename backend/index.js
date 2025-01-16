const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
// const mongoose = require("mongoose");
const productRoute = require("./src/Routes/product");
const authRoute = require("./src/Routes/Auth");
const cartRoute = require("./src/Routes/cart");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const axios = require('axios');

const app = express();
const port = 5050;
dotenv.config();

app.use(express.static("public"));
app.use("/uploads", express.static("uploads")); // let api to use Image

app.use(morgan("dev")); // Log server requests

app.use(express.json()); // parses JSON-encoded request bodies and exposes the data in req.body.
app.use(express.urlencoded({ extended: true })); //parses URL-encoded request bodies and exposes the data in req.body.
app.use(cors()); // enables CORS to allow cross-origin requests from specified origins.
app.use(cookieParser());

// File Upload config.
app.use(
	fileUpload({
		limits: {
			fileSize: 2 * 1024 * 1024 * 1024, // 2MB max file size
		},
		abortOnLimit: true,
	})
);

// Routes
app.get("/", (req, res) => {
	res.send("Hello World!");
});
app.use("/api", productRoute);
app.use("/api", authRoute);
app.use("/api", cartRoute);

// Database connection
// const connect = async () => {
// 	try {
// 		await mongoose.connect(process.env.DB_URL);
// 		console.log("Database Connected.");
// 	} catch (error) {
// 		throw error;
// 	}
// };

// Start server
app.listen(port, () => {
	console.log(`Server is running on ${port}`);
	// connect();
});

app.get('/api/moviedb/*', async (req, res) => {
    try {
        const endpoint = req.params[0];
        const queryParams = req.query;
		console.log({ endpoint, queryParams });
        if (!endpoint) {
            return res.status(400).json({ error: 'Endpoint is required' });
        }

        const tmdbResponse = await axios.get(`https://api.themoviedb.org/3/${endpoint}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                ...queryParams,
            },
        });

        res.status(tmdbResponse.status).json(tmdbResponse.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json({
                error: error.message,
                details: error.response.data,
            });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});


app.get('/moviedb-img/*', async (req, res) => {
    try {
		const endpoint = req.params[0];

        if (!endpoint) {
            return res.status(400).json({ error: 'Image path is required' });
        }

        const imageUrl = `https://image.tmdb.org/t/p/${endpoint}`;

        const imageResponse = await axios.get(imageUrl, {
            responseType: 'stream',
        });

        res.set('Content-Type', imageResponse.headers['content-type']);
        imageResponse.data.pipe(res);
    } catch (error) {
        console.error('Error in image proxy route:', error);

        if (error.response) {
            res.status(error.response.status).json({
                error: error.message,
                details: error.response.data,
            });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

