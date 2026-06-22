/*
  Seed current services and projects into MongoDB and upload images to GridFS.

  - Uses values currently hardcoded in the frontend (src/lib/services.ts and our-work pages)
  - Uploads image files from /public paths to GridFS (bucket: images)
  - Stores inserted services in collection 'services' and projects in 'projects'
  - Preserves original imageUrl fields and adds imageFileId(s) for GridFS references
*/

const fs = require('fs');
const path = require('path');
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mshebl215_db_user:oIAMLDtFKqqrrpWN@cluster0.vij4xut.mongodb.net/petrowebsite?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_DB = process.env.MONGODB_DB || 'petrowebsite';

function decodePublicPath(p) {
  const noLeading = p.startsWith('/') ? p.slice(1) : p;
  const decoded = decodeURI(noLeading);
  // Ensure all assets resolve under public/
  if (!decoded.startsWith('public/')) {
    return path.join('public', decoded);
  }
  return decoded;
}

async function uploadImageIfExists(bucket, publicPath, metadata) {
  try {
    const resolved = path.join(process.cwd(), decodePublicPath(publicPath));
    if (!fs.existsSync(resolved)) {
      console.warn(`[seed] File not found, skipping: ${resolved}`);
      return null;
    }
    const fileName = path.basename(resolved);
    const buffer = fs.readFileSync(resolved);
    const uploadStream = bucket.openUploadStream(fileName, { metadata });
    await new Promise((resolve, reject) => {
      uploadStream.on('error', reject);
      uploadStream.on('finish', resolve);
      uploadStream.end(buffer);
    });
    return uploadStream.id.toString();
  } catch (e) {
    console.error('[seed] uploadImageIfExists error:', e.message);
    return null;
  }
}

// Services (as in src/lib/services.ts)
const servicesData = [
  {
    slug: 'engine-oils',
    title: {
      en: 'Motor Oils',
      ar: 'زيوت المحركات'
    },
    summary: {
      en: 'High-quality Saudi-made motor oils engineered for durability and peak performance.',
      ar: 'زيوت محركات عالية الجودة مصممة للأداء والمتانة.'
    },
    imageUrl: '/gallery/engine%20oil1.webp',
    features: {
      en: [
        'Synthetic and mineral formulations',
        'Extended engine protection',
        'High-temperature stability',
        'Fuel efficiency optimization'
      ],
      ar: [
        'تركيبات اصطناعية ومعدنية',
        'حماية ممتدة للمحرك',
        'ثبات عند درجات الحرارة العالية',
        'تحسين كفاءة الوقود'
      ]
    },
    content: {
      en: 'We provide premium-grade engine oils engineered to protect engines under extreme conditions... ',
      ar: 'نقدم زيوت محركات عالية الجودة لحماية المحركات في الظروف القاسية... '
    },
    detailedContent: {
      en: 'Our Falcon Motor Oils represent the pinnacle of lubrication technology...',
      ar: 'تمثل زيوت فالكون للمحركات قمة تقنيات التزييت...'
    },
    galleryImages: [
      '/gallery/engine%20oil1.webp',
      '/gallery/engine%20oil%20details.webp',
      '/gallery/engine%20oil%201%20detial.webp',
      '/gallery/product-img-1.webp',
      '/gallery/product-img-2.webp',
      '/gallery/product-img-3.webp'
    ],
    benefits: {
      en: [
        'Extended oil change intervals',
        'Superior engine protection',
        'Improved fuel economy',
        'Reduced maintenance costs',
        'Enhanced engine performance',
        'Compatible with all engine types'
      ],
      ar: [
        'فترات تغيير زيت أطول',
        'حماية فائقة للمحرك',
        'تحسين اقتصاد الوقود',
        'تقليل تكاليف الصيانة',
        'تحسين أداء المحرك',
        'متوافق مع جميع أنواع المحركات'
      ]
    },
    category: 'oil-gas',
    isActive: true,
    isFeatured: false,
    order: 1
  },
  {
    slug: 'oil-gas-solutions',
    title: {
      en: 'Oil & Gas Solutions',
      ar: 'حلول النفط والغاز'
    },
    summary: {
      en: 'Comprehensive petroleum storage, trading, and logistics solutions with advanced safety systems and strategic partnerships.',
      ar: 'حلول شاملة لتخزين وتداول ولوجستيات المنتجات البترولية.'
    },
    imageUrl: '/gallery/oil%20extraction.webp',
    features: {
      en: [
        'Bulk storage facilities',
        'Import/export operations',
        'Blending and distribution',
        'Trading and risk management'
      ],
      ar: [
        'مرافق التخزين بالجملة',
        'عمليات الاستيراد/التصدير',
        'الخلط والتوزيع',
        'التداول وإدارة المخاطر'
      ]
    },
    content: {
      en: 'Our oil and gas solutions provide comprehensive petroleum storage, trading, and logistics services...',
      ar: 'نوفر خدمات شاملة لتخزين وتداول ولوجستيات المنتجات البترولية...'
    },
    detailedContent: {
      en: 'We offer state-of-the-art petroleum storage facilities...',
      ar: 'نقدم مرافق تخزين بترول متطورة...'
    },
    galleryImages: [
      '/gallery/oil%20extraction.webp',
      '/gallery/logistic%20.webp',
      '/gallery/product-img-4.webp',
      '/gallery/product-img-5.webp',
      '/gallery/product-img-6.webp',
      '/gallery/product-img-7.webp'
    ],
    benefits: {
      en: [
        'Enhanced Storage Capacity',
        'Improved Safety Standards',
        'Reduced Operational Costs',
        'Strategic Market Access',
        'Advanced Risk Management',
        'Comprehensive Logistics Network'
      ],
      ar: [
        'زيادة سعة التخزين',
        'تحسين معايير الأمان',
        'تقليل التكاليف التشغيلية',
        'وصول استراتيجي للسوق',
        'إدارة مخاطر متقدمة',
        'شبكة لوجستية شاملة'
      ]
    },
    category: 'oil-gas',
    isActive: true,
    isFeatured: true,
    order: 2
  },
  {
    slug: 'logistics-marine-services',
    title: {
      en: 'Logistics & Marine Services',
      ar: 'خدمات اللوجستيات والبحرية'
    },
    summary: {
      en: 'World-class logistics across marine ports and inland operations to keep supply chains moving.',
      ar: 'لوجستيات عالمية المستوى عبر الموانئ والعمليات الداخلية.'
    },
    imageUrl: '/gallery/logistic%20.webp',
    features: {
      en: [
        'Port handling and stevedoring',
        'Customs and documentation',
        'Inland transport and distribution',
        'Global freight coordination'
      ],
      ar: [
        'مناولة الموانئ والتفريغ',
        'الجمارك والتوثيق',
        'النقل الداخلي والتوزيع',
        'تنسيق الشحن العالمي'
      ]
    },
    content: {
      en: 'We operate across marine and inland logistics to deliver reliability at scale...',
      ar: 'نعمل عبر اللوجستيات البحرية والداخلية لتقديم الموثوقية على نطاق واسع...'
    },
    detailedContent: {
      en: 'Our logistics and marine services provide comprehensive solutions...',
      ar: 'توفر خدمات اللوجستيات والبحرية لدينا حلولاً شاملة...'
    },
    galleryImages: [
      '/gallery/logistic%20.webp',
      '/gallery/electric.webp',
      '/gallery/product-2-img-1.webp',
      '/gallery/product-2-img-2.webp',
      '/gallery/product-2-img-3.webp'
    ],
    benefits: {
      en: [
        'Expert port operations',
        'Customs clearance services',
        'Inland transportation network',
        'Global freight coordination',
        'Documentation management',
        'Supply chain optimization'
      ],
      ar: [
        'عمليات موانئ خبيرة',
        'خدمات التخليص الجمركي',
        'شبكة النقل الداخلي',
        'تنسيق الشحن العالمي',
        'إدارة الوثائق',
        'تحسين سلسلة التوريد'
      ]
    },
    category: 'logistics',
    isActive: true,
    isFeatured: true,
    order: 3
  },
  {
    slug: 'renewable-energy-desalination',
    title: {
      en: 'Alternative Energy & Water Desalination',
      ar: 'الطاقة البديلة وتحلية المياه'
    },
    summary: {
      en: 'Sustainable solar and wind energy solutions alongside advanced water desalination systems.',
      ar: 'حلول طاقة شمسية ورياحية مستدامة إلى جانب أنظمة تحلية المياه.'
    },
    imageUrl: '/gallery/solar%20panels.webp',
    features: {
      en: [
        'Solar and wind integrations',
        'Hybrid energy systems',
        'Reverse osmosis desalination',
        'Sustainable infrastructure design'
      ],
      ar: [
        'تكامل الطاقة الشمسية والرياحية',
        'أنظمة الطاقة الهجينة',
        'تحلية المياه بالتناضح العكسي',
        'تصميم البنية التحتية المستدامة'
      ]
    },
    content: {
      en: 'We invest in sustainable energy projects and water technologies that secure resources...',
      ar: 'نستثمر في مشاريع الطاقة المستدامة وتقنيات المياه التي تؤمن الموارد...'
    },
    detailedContent: {
      en: 'Our alternative energy solutions focus on renewable resources...',
      ar: 'تركز حلول الطاقة البديلة لدينا على الموارد المتجددة...'
    },
    galleryImages: [
      '/gallery/solar%20panels.webp',
      '/gallery/solar%20energy.webp',
      '/gallery/wind%20genrators.webp',
      '/gallery/waterpurification.webp',
      '/gallery/water%20purification1.webp',
      '/gallery/product-3-img-1.webp',
      '/gallery/product-3-img-2.webp',
      '/gallery/product-3-img-3.webp',
      '/gallery/product-4-img-1.webp',
      '/gallery/product-4-img-2.webp',
      '/gallery/product-4-img-3.webp',
      '/gallery/product-5-img-1.webp',
      '/gallery/product-5-img-2.webp',
      '/gallery/product-5-img-3.webp',
      '/gallery/product-6-img-1.webp',
      '/gallery/product-6-img-2.webp',
      '/gallery/product-6-img-3.webp'
    ],
    benefits: {
      en: [
        'Environmentally friendly solutions',
        'Cost-effective renewable energy',
        'Advanced solar technology',
        'Efficient wind energy systems',
        'Pure water desalination',
        'Sustainable infrastructure'
      ],
      ar: [
        'حلول صديقة للبيئة',
        'طاقة متجددة فعّالة من حيث التكلفة',
        'تقنية شمسية متقدمة',
        'أنظمة طاقة رياحية فعّالة',
        'تحلية مياه نقية',
        'بنية تحتية مستدامة'
      ]
    },
    category: 'sustainability',
    isActive: true,
    isFeatured: false,
    order: 4
  }
];

// Projects (as in our-work pages)
const projectsData = [
  {
    slug: 'petroleum-storage-facility',
    title: { en: 'Petroleum Storage Facility', ar: 'منشأة تخزين البترول' },
    summary: { en: 'Modern storage facility with advanced safety systems and capacity management.', ar: 'منشأة حديثة مع أنظمة أمان متقدمة وإدارة السعة.' },
    description: { en: 'Strategic distribution hub.', ar: 'مركز توزيع استراتيجي.' },
    imageUrl: '/gallery/oil%20extraction.webp',
    galleryImages: ['/gallery/oil%20extraction.webp', '/gallery/engine%20oil%20.webp', '/gallery/engine%20oil%201%20detial.webp'],
    technologies: { en: [], ar: [] },
    features: { en: ['Advanced Storage Systems','Safety Compliance','Quality Monitoring'], ar: ['أنظمة تخزين متقدمة','امتثال الأمان','مراقبة الجودة'] },
    challenges: { en: [], ar: [] },
    solutions: { en: [], ar: [] },
    results: { en: [], ar: [] },
    client: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
    location: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
    duration: { en: '', ar: '' },
    budget: { en: '', ar: '' },
    category: 'oil-gas-projects',
    isActive: true,
    isFeatured: true,
    order: 1
  },
  {
    slug: 'trading-operations',
    title: { en: 'Trading Operations Center', ar: 'مركز عمليات التداول' },
    summary: { en: 'Strategic trading hub for petroleum products with real-time market analysis.', ar: 'مركز تداول استراتيجي مع تحليل السوق في الوقت الفعلي.' },
    description: { en: 'Automated trading systems and risk management.', ar: 'أنظمة تداول آلية وإدارة مخاطر.' },
    imageUrl: '/gallery/solar%20panels.webp',
    galleryImages: ['/gallery/solar%20panels.webp', '/gallery/wind%20genrators.webp', '/gallery/electric.webp'],
    technologies: { en: [], ar: [] },
    features: { en: ['Real-time Market Analysis','Automated Trading Systems','Risk Management'], ar: ['تحليل السوق','أنظمة تداول','إدارة المخاطر'] },
    challenges: { en: [], ar: [] },
    solutions: { en: [], ar: [] },
    results: { en: [], ar: [] },
    client: { en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة' },
    location: { en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة' },
    duration: { en: '', ar: '' },
    budget: { en: '', ar: '' },
    category: 'oil-gas-projects',
    isActive: true,
    isFeatured: false,
    order: 2
  },
  {
    slug: 'refinery-integration',
    title: { en: 'Refinery Integration Project', ar: 'مشروع تكامل المصفاة' },
    summary: { en: 'Comprehensive refinery integration with advanced processing capabilities.', ar: 'تكامل شامل للمصفاة مع قدرات معالجة متقدمة.' },
    description: { en: 'Integrated systems and optimized workflows.', ar: 'أنظمة متكاملة وتدفقات عمل محسنة.' },
    imageUrl: '/gallery/wind%20genrators.webp',
    galleryImages: ['/gallery/wind%20genrators.webp', '/gallery/oil%20extraction.webp', '/gallery/logistic%20.webp'],
    technologies: { en: [], ar: [] },
    features: { en: ['Advanced Processing Units','Integrated Control Systems','Optimized Workflows'], ar: ['وحدات معالجة متقدمة','أنظمة تحكم متكاملة','تدفقات عمل محسنة'] },
    challenges: { en: [], ar: [] },
    solutions: { en: [], ar: [] },
    results: { en: [], ar: [] },
    client: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
    location: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
    duration: { en: '', ar: '' },
    budget: { en: '', ar: '' },
    category: 'oil-gas-projects',
    isActive: true,
    isFeatured: false,
    order: 3
  },
  {
    slug: 'marine-port-expansion',
    title: { en: 'Marine Port Expansion', ar: 'توسع الميناء البحري' },
    summary: { en: 'Comprehensive port infrastructure development with enhanced cargo handling.', ar: 'تطوير شامل للبنية التحتية للميناء مع تحسين مناولة البضائع.' },
    description: { en: 'New berths and improved logistics.', ar: 'أرصفة جديدة ولوجستيات محسنة.' },
    imageUrl: '/gallery/logistic%20.webp',
    galleryImages: ['/gallery/logistic%20.webp'],
    technologies: { en: [], ar: [] },
    features: { en: ['Port infrastructure','Cargo handling','Logistics management'], ar: ['بنية تحتية للميناء','مناولة البضائع','إدارة اللوجستيات'] },
    challenges: { en: [], ar: [] },
    solutions: { en: [], ar: [] },
    results: { en: [], ar: [] },
    client: { en: 'Morocco', ar: 'المغرب' },
    location: { en: 'Morocco', ar: 'المغرب' },
    duration: { en: '', ar: '' },
    budget: { en: '', ar: '' },
    category: 'logistics-projects',
    isActive: true,
    isFeatured: true,
    order: 4
  },
  {
    slug: 'inland-transportation-network',
    title: { en: 'Inland Transportation Network', ar: 'شبكة النقل الداخلي' },
    summary: { en: 'Comprehensive inland transport with optimized routes and fleet management.', ar: 'نقل داخلي شامل مع تحسين الطرق وإدارة الأسطول.' },
    description: { en: 'Optimized routes and real-time tracking.', ar: 'طرق محسنة وتتبع في الوقت الفعلي.' },
    imageUrl: '/gallery/electric.webp',
    galleryImages: ['/gallery/electric.webp'],
    technologies: { en: [], ar: [] },
    features: { en: ['Transport routes','Fleet management','Route optimization'], ar: ['طرق النقل','إدارة الأسطول','تحسين الطرق'] },
    challenges: { en: [], ar: [] },
    solutions: { en: [], ar: [] },
    results: { en: [], ar: [] },
    client: { en: 'Egypt', ar: 'مصر' },
    location: { en: 'Egypt', ar: 'مصر' },
    duration: { en: '', ar: '' },
    budget: { en: '', ar: '' },
    category: 'logistics-projects',
    isActive: true,
    isFeatured: false,
    order: 5
  },
  {
    slug: 'warehousing-solutions',
    title: { en: 'Warehousing Solutions', ar: 'حلول المستودعات' },
    summary: { en: 'Advanced warehousing systems with inventory management and distribution.', ar: 'أنظمة مستودعات متقدمة مع إدارة المخزون والتوزيع.' },
    description: { en: 'Automated warehousing and distribution.', ar: 'مستودعات آلية وتوزيع فعال.' },
    imageUrl: '/gallery/wind%20genrators.webp',
    galleryImages: ['/gallery/wind%20genrators.webp'],
    technologies: { en: [], ar: [] },
    features: { en: ['Warehouse management','Inventory control','Distribution systems'], ar: ['إدارة المستودعات','مراقبة المخزون','أنظمة التوزيع'] },
    challenges: { en: [], ar: [] },
    solutions: { en: [], ar: [] },
    results: { en: [], ar: [] },
    client: { en: 'Jordan', ar: 'الأردن' },
    location: { en: 'Jordan', ar: 'الأردن' },
    duration: { en: '', ar: '' },
    budget: { en: '', ar: '' },
    category: 'logistics-projects',
    isActive: true,
    isFeatured: false,
    order: 6
  }
];

async function main() {
  let client;
  try {
    console.log('[seed] Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB);
    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    // Ensure indexes
    await db.collection('services').createIndex({ slug: 1 }, { unique: true }).catch(() => {});
    await db.collection('projects').createIndex({ slug: 1 }, { unique: true }).catch(() => {});

    console.log('[seed] Seeding services...');
    for (const svc of servicesData) {
      const imageFileId = await uploadImageIfExists(bucket, svc.imageUrl, { page: 'services', isActive: true });
      const galleryFileIds = [];
      for (const gi of svc.galleryImages || []) {
        const fid = await uploadImageIfExists(bucket, gi, { page: 'services', isActive: true });
        if (fid) galleryFileIds.push(fid);
      }

      const doc = {
        ...svc,
        imageFileId: imageFileId ? new ObjectId(imageFileId) : undefined,
        galleryFileIds: galleryFileIds.map((id) => new ObjectId(id)),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('services').updateOne(
        { slug: svc.slug },
        { $set: doc },
        { upsert: true }
      );
      console.log(`[seed] Upserted service: ${svc.slug}`);
    }

    console.log('[seed] Seeding projects...');
    for (const prj of projectsData) {
      const imageFileId = await uploadImageIfExists(bucket, prj.imageUrl, { page: 'work', isActive: true });
      const galleryFileIds = [];
      for (const gi of prj.galleryImages || []) {
        const fid = await uploadImageIfExists(bucket, gi, { page: 'work', isActive: true });
        if (fid) galleryFileIds.push(fid);
      }

      const doc = {
        ...prj,
        imageFileId: imageFileId ? new ObjectId(imageFileId) : undefined,
        galleryFileIds: galleryFileIds.map((id) => new ObjectId(id)),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('projects').updateOne(
        { slug: prj.slug },
        { $set: doc },
        { upsert: true }
      );
      console.log(`[seed] Upserted project: ${prj.slug}`);
    }

    console.log('[seed] Done.');
  } catch (e) {
    console.error('[seed] Failed:', e);
    process.exitCode = 1;
  } finally {
    if (client) await client.close();
  }
}

main();


