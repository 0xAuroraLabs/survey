require('dotenv').config({ path: './.env.local' });
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Check if .env.local exists and load it
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`Checking for .env file at: ${envPath}`);
if (fs.existsSync(envPath)) {
  console.log('.env.local file found');
} else {
  console.error('.env.local file not found!');
  process.exit(1);
}

// Log environment variables (without showing the full private key)
console.log('Environment variables loaded:');
console.log(`- FIREBASE_ADMIN_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID || "aurora-pet-45be4"}`);
console.log(`- FIREBASE_ADMIN_CLIENT_EMAIL: ${process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 'Missing'}`);
console.log(`- FIREBASE_ADMIN_PRIVATE_KEY: ${process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'Found (redacted)' : 'Missing'}`);

// Try using service account directly if available
let serviceAccount = null;
const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
if (fs.existsSync(serviceAccountPath)) {
  try {
    serviceAccount = require(serviceAccountPath);
    console.log('Found service-account.json file, will use it for authentication');
  } catch (err) {
    console.error('Error loading service-account.json:', err.message);
  }
}

// Initialize Firebase Admin using environment variables
if (!admin.apps.length) {
  try {
    if (serviceAccount) {
      // Use service account file if available
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin SDK initialized with service account file');
    } else if (process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      // Use environment variables
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || "aurora-pet-45be4",
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: privateKey
        })
      });
      
      console.log('Firebase Admin SDK initialized with environment variables');
    } else {
      throw new Error('Missing Firebase Admin SDK credentials');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

// Example reward templates
const rewardTemplates = [
  {
    name: "Free Premium Membership",
    description: "Enjoy one month of premium membership benefits including priority support and exclusive features.",
    pointsRequired: 10,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Amazon Gift Card",
    description: "A $20 Amazon gift card that can be used for any purchase on Amazon.",
    pointsRequired: 20,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Custom Pet Portrait",
    description: "Get a digital custom portrait of your pet created by one of our talented artists.",
    pointsRequired: 30,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Donation to Animal Shelter",
    description: "We'll make a $25 donation to an animal shelter of your choice in your name.",
    pointsRequired: 15,
    status: "active",
    createdAt: new Date().toISOString(),
  }
];

async function createRewardTemplates() {
  try {
    console.log('Creating reward templates...');
    
    for (const template of rewardTemplates) {
      // Check if a reward with this name already exists
      const existingRewards = await db.collection('rewards')
        .where('name', '==', template.name)
        .get();
      
      if (!existingRewards.empty) {
        console.log(`Reward template "${template.name}" already exists, skipping.`);
        continue;
      }
      
      // Add new reward template
      const result = await db.collection('rewards').add(template);
      console.log(`Created reward template "${template.name}" with ID: ${result.id}`);
    }
    
    console.log('All reward templates created successfully!');
  } catch (error) {
    console.error('Error creating reward templates:', error);
  } finally {
    process.exit(0);
  }
}

createRewardTemplates(); 