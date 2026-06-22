const fs = require('fs');
const path = require('path');
const { MongoClient, GridFSBucket } = require('mongodb');

// Use the same connection string as the app
// Use same URI the app uses (see src/lib/mongodb.ts)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mshebl215_db_user:oIAMLDtFKqqrrpWN@cluster0.vij4xut.mongodb.net/petrowebsite?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_DB = process.env.MONGODB_DB || 'petrowebsite';

// Define banner images to upload
const bannerImages = [
  {
    filePath: 'public/gallery/logistic .webp',
    page: 'home',
    title: 'Logistic Services',
    description: 'Integrated logistics solutions across marine ports and inland operations',
    order: 1
  },
  {
    filePath: 'public/gallery/oil extraction.webp',
    page: 'home',
    title: 'Oil & Gas Solutions',
    description: 'Comprehensive petroleum storage, trading, and distribution solutions',
    order: 2
  },
  {
    filePath: 'public/gallery/water purification1.webp',
    page: 'home',
    title: 'Water Desalination',
    description: 'Advanced water desalination systems for clean water supply',
    order: 3
  },
  {
    filePath: 'public/about us banner .webp',
    page: 'about',
    title: 'About Us Banner',
    description: 'Learn more about Ebdaa Falcon and our mission',
    order: 1
  },
  {
    filePath: 'public/ourservicesbanner.webp',
    page: 'services',
    title: 'Our Services',
    description: 'Comprehensive energy, logistics, and sustainability solutions',
    order: 1
  },
  {
    filePath: 'public/ourworkbanner.webp',
    page: 'work',
    title: 'Our Work',
    description: 'Explore our portfolio of successful projects',
    order: 1
  },
  {
    filePath: 'public/blog banner.webp',
    page: 'blog',
    title: 'Blog Banner',
    description: 'Latest news and insights from our team',
    order: 1
  }
  ,
  {
    filePath: 'public/ourservicesbanner.webp',
    page: 'contact',
    title: 'Contact Us',
    description: "Get in touch with our team for inquiries, partnerships, and business opportunities",
    order: 1
  }
];

async function uploadBannerImages() {
  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(MONGODB_DB);
    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    console.log('Starting banner image upload...');

    for (const image of bannerImages) {
      try {
        // Check if file exists
        if (!fs.existsSync(image.filePath)) {
          console.log(`File not found: ${image.filePath}`);
          continue;
        }

        // Read file
        const fileBuffer = fs.readFileSync(image.filePath);
        const fileName = path.basename(image.filePath);

        // Check if image already exists
        const existingFiles = await bucket.find({ filename: fileName }).toArray();
        if (existingFiles.length > 0) {
          console.log(`Image already exists: ${fileName}`);
          continue;
        }

        // Upload to GridFS
        const uploadStream = bucket.openUploadStream(fileName, {
          metadata: {
            title: image.title,
            description: image.description,
            order: image.order,
            isActive: true,
            showTitle: true,
            showDescription: true,
            page: image.page
          }
        });

        uploadStream.end(fileBuffer);

        await new Promise((resolve, reject) => {
          uploadStream.on('error', reject);
          uploadStream.on('finish', resolve);
        });

        console.log(`Uploaded: ${fileName} for page: ${image.page}`);
      } catch (error) {
        console.error(`Error uploading ${image.filePath}:`, error);
      }
    }

    console.log('Banner image upload completed!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

uploadBannerImages();
