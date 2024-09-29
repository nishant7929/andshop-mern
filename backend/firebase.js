const admin = require("firebase-admin");
const firebaseConfig = require("./serviceAccountKey.json");

admin.initializeApp({
	credential: admin.credential.cert(firebaseConfig),
	storageBucket: 'gs://andshop-4dfe2.appspot.com',
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
