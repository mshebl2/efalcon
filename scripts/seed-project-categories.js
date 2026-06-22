/**
 * Seed script to create project categories in the database
 * Run this once to populate the projectCategories collection with the initial categories
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mshebl215_db_user:oIAMLDtFKqqrrpWN@cluster0.vij4xut.mongodb.net/petrowebsite?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.MONGODB_DB || 'petrowebsite';

const projectCategories = [
  {
    name: {
      en: 'Oil & Gas Projects',
      ar: 'مشاريع النفط والغاز'
    },
    description: {
      en: 'Comprehensive petroleum storage, trading, and distribution solutions',
      ar: 'حلول شاملة لتخزين وتجارة وتوزيع المنتجات البترولية'
    },
    slug: 'oil-gas-projects',
    order: 1,
    isActive: true
  },
  {
    name: {
      en: 'Logistics Projects',
      ar: 'مشاريع الخدمات اللوجستية'
    },
    description: {
      en: 'Integrated logistics solutions across marine ports and inland operations',
      ar: 'حلول لوجستية متكاملة عبر الموانئ البحرية والعمليات الداخلية'
    },
    slug: 'logistics-projects',
    order: 2,
    isActive: true
  }
];

async function seedProjectCategories() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 20000,
    socketTimeoutMS: 45000,
    family: 4,
    tls: true,
    tlsAllowInvalidCertificates: true,
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DB_NAME);
    const collection = db.collection('projectCategories');

    // Clear existing categories
    await collection.deleteMany({});
    console.log('Cleared existing project categories');

    // Insert new categories
    const result = await collection.insertMany(projectCategories);
    console.log(`Inserted ${result.insertedCount} project categories`);

    // Display inserted categories
    const categories = await collection.find({}).toArray();
    console.log('\nProject categories in database:');
    categories.forEach(cat => {
      console.log(`- ${cat.name.en} (${cat.name.ar})`);
      console.log(`  Slug: ${cat.slug}, Order: ${cat.order}, Active: ${cat.isActive}`);
      console.log(`  ID: ${cat._id}`);
    });

    console.log('\n✅ Project categories seeded successfully!');
  } catch (error) {
    console.error('Error seeding project categories:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

// Run the seed function
seedProjectCategories()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

