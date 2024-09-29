// services/FirestoreService.js

const { db } = require("../../firebase");

class FirestoreService {
	constructor(collectionName) {
		this.collection = db.collection(collectionName);
	}

	// Create a new document
	async create(data) {
		try {
			const docRef = await this.collection.add(data);
			return { id: docRef.id, ...data };
		} catch (error) {
			throw new Error("Error creating document: " + error.message);
		}
	}

	// Find all documents with optional query filters
	async find(query = {}) {
		try {
			let ref = this.collection;

			// Apply query filters if any
			Object.keys(query).forEach((field) => {
				ref = ref.where(field, "==", query[field]);
			});

			const snapshot = await ref.get();
			if (snapshot.empty) return [];

			const documents = [];
			snapshot.forEach((doc) => {
				documents.push({ id: doc.id, ...doc.data() });
			});

			return documents;
		} catch (error) {
			throw new Error("Error finding documents: " + error.message);
		}
	}

	// Find one document by query
	async findOne(query = {}) {
		try {
			let ref = this.collection;

			// Apply query filters
			Object.keys(query).forEach((field) => {
				ref = ref.where(field, "==", query[field]);
			});

			const snapshot = await ref.limit(1).get();
			if (snapshot.empty) return null;

			const doc = snapshot.docs[0];
			return { id: doc.id, ...doc.data() };
		} catch (error) {
			throw new Error("Error finding document: " + error.message);
		}
	}

	// Find document by ID
	async findById(id) {
		try {
			const docRef = this.collection.doc(id);
			const doc = await docRef.get();

			if (!doc.exists) return null;

			return { id: doc.id, ...doc.data() };
		} catch (error) {
			throw new Error("Error finding document by ID: " + error.message);
		}
	}

	// Update a document by ID
	async updateById(id, data) {
		try {
			const docRef = this.collection.doc(id);
			await docRef.update(data);
			return { id, ...data };
		} catch (error) {
			throw new Error("Error updating document: " + error.message);
		}
	}

	// Delete a document by ID
	async deleteById(id) {
		try {
			const docRef = this.collection.doc(id);
			await docRef.delete();
			return { message: `Document with ID ${id} deleted successfully.` };
		} catch (error) {
			throw new Error("Error deleting document: " + error.message);
		}
	}
}

module.exports = FirestoreService;
