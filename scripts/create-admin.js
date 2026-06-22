const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://mshebl215_db_user:oIAMLDtFKqqrrpWN@cluster0.vij4xut.mongodb.net/petrowebsite?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'petrowebsite';

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const adminCollection = db.collection('admin_users');
    
    // Check if admin already exists
    const existingAdmin = await adminCollection.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists in database');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@petrowebsite.com',
      createdAt: new Date(),
      lastLogin: null
    };
    
    await adminCollection.insertOne(adminUser);
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

main();
