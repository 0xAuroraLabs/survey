// Simple script to add reward templates to Firestore
// Run with: node scripts/add-reward-templates.js

const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, query, where } = require("firebase/firestore");

// Your Firebase configuration (copy from your firebase.js/ts file)
const firebaseConfig = {
  apiKey: "AIzaSyD1KZXvA14l9YzP9QHAyRYYEAZqNMpP9ck",
  authDomain: "aurora-pet-45be4.firebaseapp.com",
  projectId: "aurora-pet-45be4",
  storageBucket: "aurora-pet-45be4.appspot.com",
  messagingSenderId: "626797398899",
  appId: "1:626797398899:web:1bc0b79b4eb384c5e1e930",
  measurementId: "G-V42SBCKX87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Reward template default data
const defaultRewardTemplates = [
  {
    name: "Coffee Gift Card",
    description: "A $5 gift card for your favorite coffee shop",
    pointsRequired: 100,
    status: "active"
  },
  {
    name: "Movie Ticket",
    description: "A free movie ticket at your local cinema",
    pointsRequired: 250,
    status: "active"
  },
  {
    name: "Food Delivery Voucher",
    description: "A $15 voucher for your next food delivery order",
    pointsRequired: 400,
    status: "active"
  },
  {
    name: "Premium Subscription",
    description: "One month of premium subscription to our service",
    pointsRequired: 500,
    status: "active"
  },
  {
    name: "Tech Gadget",
    description: "A cool tech gadget of your choice under $50",
    pointsRequired: 1000,
    status: "active"
  }
];

// Function to create reward templates
async function createRewardTemplates() {
  console.log('Creating reward templates...');
  try {
    const rewardTemplatesRef = collection(db, "rewardTemplates");
    const addedTemplates = [];
    
    for (const template of defaultRewardTemplates) {
      // Check if template already exists with same name
      const existingQuery = query(rewardTemplatesRef, where("name", "==", template.name));
      const existingSnapshot = await getDocs(existingQuery);
      
      if (existingSnapshot.empty) {
        // Add new template
        const docRef = await addDoc(rewardTemplatesRef, {
          ...template,
          createdAt: new Date().toISOString()
        });
        
        console.log(`Created template: ${template.name} (${docRef.id})`);
        addedTemplates.push({
          id: docRef.id,
          ...template
        });
      } else {
        console.log(`Template already exists: ${template.name}`);
      }
    }
    
    console.log(`Added ${addedTemplates.length} new reward templates`);
  } catch (error) {
    console.error("Error creating reward templates:", error);
  }
}

// Run the function
createRewardTemplates()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err)); 