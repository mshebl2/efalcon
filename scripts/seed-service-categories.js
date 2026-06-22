const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mshebl215_db_user:oIAMLDtFKqqrrpWN@cluster0.vij4xut.mongodb.net/petrowebsite?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.MONGODB_DB || 'petrowebsite';

const serviceCategories = [
  {
    _id: 'oil-gas',
    name: {
      en: 'Oil & Gas Solutions',
      ar: 'حلول النفط والغاز'
    },
    description: {
      en: 'Comprehensive petroleum storage, trading, and distribution solutions',
      ar: 'حلول شاملة لتخزين وتداول وتوزيع المنتجات البترولية'
    },
    isActive: true,
    order: 1
  },
  {
    _id: 'logistics',
    name: {
      en: 'Logistics & Marine Services',
      ar: 'الخدمات اللوجستية والبحرية'
    },
    description: {
      en: 'Integrated logistics solutions across marine ports and inland operations',
      ar: 'حلول لوجستية متكاملة عبر الموانئ البحرية والعمليات الداخلية'
    },
    isActive: true,
    order: 2
  },
  {
    _id: 'sustainability',
    name: {
      en: 'Alternative Energy & Water Desalination',
      ar: 'الطاقة البديلة وتحلية المياه'
    },
    description: {
      en: 'Sustainable energy and water infrastructure projects',
      ar: 'مشاريع البنية التحتية المستدامة للطاقة والمياه'
    },
    isActive: true,
    order: 3
  }
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('serviceCategories');
    
    // Clear existing categories
    await collection.deleteMany({});
    console.log('Cleared existing service categories');
    
    // Insert categories
    const result = await collection.insertMany(serviceCategories);
    console.log(`Inserted ${result.insertedCount} service categories`);
    
    console.log('Service categories seeded successfully!');
  } catch (error) {
    console.error('Error seeding service categories:', error);
  } finally {
    await client.close();
  }
}

seed();
