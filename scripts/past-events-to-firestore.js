const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
} = require("firebase/firestore");
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} = require("firebase/storage");
const fs = require("fs");
const path = require("path");

const firebaseConfig = {
  apiKey: "AIzaSyCHacUCNfD9TLt6dJikiHVxg1FGq9fy6I0",
  authDomain: "spoton-645b5.firebaseapp.com",
  projectId: "spoton-645b5",
  storageBucket: "spoton-645b5.firebasestorage.app",
  messagingSenderId: "928397598606",
  appId: "1:928397598606:web:81de2d57e8f9a4fd994edf",
  measurementId: "G-KXXWR5HE3N"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const eventsPath = path.join(__dirname, "../app/data/events.json");
const events = JSON.parse(fs.readFileSync(eventsPath, "utf-8"));

const imagesFolder = path.join(__dirname, "../assets/images");

async function importEventsToFirestore() {
  console.log("Starting to import events to Firestore...\n");

  const confirm = process.argv.includes("--clean");
  if (confirm) {
    console.log("Existing events are being hidden...");
    const snapshot = await getDocs(collection(db, "events"));
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
      console.log(`Deleted: ${doc.id}`);
    }
  }

  for (const event of events) {
    const imageName = event.image;
    const imagePath = path.join(imagesFolder, imageName);

    if (!fs.existsSync(imagePath)) {
      console.warn(`The image is missing: ${imageName}→ bypassed`);
      continue;
    }

    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const storageRef = ref(storage, `events/${imageName}`);
      await uploadBytes(storageRef, imageBuffer, {
        contentType: "image/jpeg",
      });
      const imageUrl = await getDownloadURL(storageRef);
      console.log(`Loaded: ${imageName}`);

      const { id, ...dataWithoutId } = event; 
      await addDoc(collection(db, "events"), {
        ...dataWithoutId,
        image: imageUrl, 
        status: "Expired",
        createdAt: new Date(),
      });

      console.log(`Saved: ${event.title}`);
    } catch (error) {
      console.error(`Wrong. ${event.title}:`, error.message);
    }
  }

  console.log("\nImport completed!");
}

importEventsToFirestore().catch(console.error);