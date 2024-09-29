const { bucket } = require("../../firebase");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// Function to handle image upload to Firebase Storage
const uploadImageToFirebase = (file) => {
	return new Promise((resolve, reject) => {
		const imageName = `${uuidv4()}-${Date.now()}${path.extname(file.name)}`;
		const storageFile = bucket.file(imageName);
		const stream = storageFile.createWriteStream({
			metadata: {
				contentType: file.mimetype,
			},
		});

		stream.on("error", (err) => {
			reject(new Error("Image upload error: " + err.message));
		});

		stream.on("finish", async () => {
			try {
				await storageFile.makePublic();
				const imageUrl = `https://storage.googleapis.com/${bucket.name}/${storageFile.name}`;
				resolve(imageUrl);
			} catch (err) {
				reject(new Error("Error making file public: " + err.message));
			}
		});

		stream.end(file.data); // Upload the image buffer
	});
};

module.exports = uploadImageToFirebase;
