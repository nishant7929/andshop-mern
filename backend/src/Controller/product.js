const Product = require("../models/products");
const Cart = require("../models/cart");
const uploadImage = require("../middlewares/uploadImage");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const FirestoreService = require("../services/FirestoreService");
const { bucket, db } = require("../../firebase");
const uploadImageToFirebase = require("../utils/uploadImage");

const productService = new FirestoreService("Products");

// List
exports.products = async (req, res, next) => {
	try {
		const productList = await productService.find();
		res.status(200).json(productList);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// GET PRODUCT
exports.product = async (req, res, next) => {
	try {
		const productList = await productService.findById(req.params.id);
		res.status(200).json(productList);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// Create
exports.createProduct = async (req, res) => {
	try {
		const { productImage } = req.files;

		if (!productImage) {
			return res
				.status(400)
				.json({ message: "Product image is required" });
		}
		const imageUrl = await uploadImageToFirebase(productImage);
		const productData = {
			...req.body,
			imageUrl,
		};
		const product = await productService.create(productData);
		res.status(201).json(product);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// Update Product
exports.updateProduct = async (req, res) => {
	try {
		const { id } = req.params;

		const productRef = db.collection("Products").doc(id);
		const productSnapshot = await productRef.get();
		if (!productSnapshot.exists) {
			return res.status(404).json({ message: "Product not found" });
		}

		const productData = productSnapshot.data();
		const oldImageUrl = productData.imageUrl;

		let updatedData = { ...req.body };

		if (req.files && req.files.productImage) {
			const imageUrl = await uploadImageToFirebase(
				req.files.productImage
			);
			updatedData.imageUrl = imageUrl;

			// const oldImageName = oldImageUrl.split("/").pop();

			// const oldImageFile = bucket.file(oldImageName);
			// await oldImageFile.delete();
		}
		await productRef.update(updatedData);
		const updatedProduct = await productRef.get();

		res.status(200).json({ id: id, ...updatedProduct.data() });
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
	try {
		const product = await productService.deleteById(req.params.id);
		// await Cart.updateMany(
		// 	{ "items.product": req.params.id },
		// 	{ $pull: { items: { product: productId } } }
		// );

		if (product) {
			res.json({
				status: 200,
				success: true,
				message: "Deleted successfully...",
			});
		} else {
			res.status(404).json({ message: "Product not found" });
		}
	} catch (err) {
		res.json(
			err || {
				staus: 500,
				success: false,
				message: "Something went wrong!",
			}
		);
	}
};
