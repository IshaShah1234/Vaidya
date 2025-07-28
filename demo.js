const BlogAgent = require('./BlogAgent');

// Comprehensive medical topics organized by specialty and priority
const medicalTopicsDatabase = {
  // High-traffic, urgent medical topics
  emergency: [
    {
      title: "Heart attack warning signs every adult should know",
      keywords: ["heart attack symptoms", "chest pain", "cardiac emergency", "myocardial infarction", "heart disease"],
      urgency: "high",
      category: "cardiology"
    },
    {
      title: "Stroke symptoms and the critical golden hour",
      keywords: ["stroke symptoms", "brain attack", "FAST test", "neurological emergency", "cerebrovascular accident"],
      urgency: "high",
      category: "neurology"
    },
    {
      title: "Severe allergic reaction signs and emergency response",
      keywords: ["anaphylaxis", "allergic reaction", "epinephrine", "allergy emergency", "severe allergy"],
      urgency: "high",
      category: "immunology"
    }
  ],

  // Common chronic conditions with high search volume
  chronic_conditions: [
    {
      title: "Diabetes symptoms and early warning signs you shouldn't ignore",
      keywords: ["diabetes symptoms", "blood sugar symptoms", "early diabetes signs", "type 2 diabetes", "insulin resistance"],
      urgency: "medium",
      category: "endocrinology"
    },
    {
      title: "High blood pressure: silent killer symptoms and natural management",
      keywords: ["high blood pressure", "hypertension symptoms", "blood pressure control", "silent killer", "cardiovascular health"],
      urgency: "medium",
      category: "cardiology"
    },
    {
      title: "Thyroid disorders: recognizing hypothyroidism and hyperthyroidism",
      keywords: ["thyroid symptoms", "hypothyroidism", "hyperthyroidism", "thyroid gland", "endocrine disorders"],
      urgency: "medium",
      category: "endocrinology"
    },
    {
      title: "Arthritis types, symptoms and pain management strategies",
      keywords: ["arthritis symptoms", "joint pain", "rheumatoid arthritis", "osteoarthritis", "joint inflammation"],
      urgency: "medium",
      category: "rheumatology"
    }
  ],

  // Mental health topics (increasingly searched)
  mental_health: [
    {
      title: "Depression signs and when professional help is needed",
      keywords: ["depression symptoms", "mental health", "mood disorders", "clinical depression", "psychological help"],
      urgency: "medium",
      category: "psychiatry"
    },
    {
      title: "Anxiety disorders: types, symptoms and coping strategies",
      keywords: ["anxiety symptoms", "panic attacks", "generalized anxiety", "social anxiety", "anxiety management"],
      urgency: "medium",
      category: "psychiatry"
    },
    {
      title: "Recognizing burnout syndrome in the modern workplace",
      keywords: ["burnout symptoms", "work stress", "mental exhaustion", "occupational health", "stress management"],
      urgency: "medium",
      category: "occupational health"
    },
    {
      title: "ADHD in adults: overlooked symptoms and diagnosis",
      keywords: ["adult ADHD", "attention deficit", "ADHD symptoms", "focus problems", "hyperactivity disorder"],
      urgency: "low",
      category: "psychiatry"
    }
  ],

  // Women's health topics
  womens_health: [
    {
      title: "PCOS symptoms every woman should recognize",
      keywords: ["PCOS symptoms", "polycystic ovary syndrome", "hormonal imbalance", "irregular periods", "women's health"],
      urgency: "medium",
      category: "gynecology"
    },
    {
      title: "Menopause symptoms and hormone replacement therapy options",
      keywords: ["menopause symptoms", "hot flashes", "hormone therapy", "perimenopause", "women's wellness"],
      urgency: "low",
      category: "gynecology"
    },
    {
      title: "Endometriosis: painful periods and fertility concerns",
      keywords: ["endometriosis symptoms", "pelvic pain", "painful periods", "fertility issues", "reproductive health"],
      urgency: "medium",
      category: "gynecology"
    },
    {
      title: "Pregnancy symptoms and essential prenatal care guide",
      keywords: ["pregnancy symptoms", "prenatal care", "early pregnancy", "maternal health", "pregnancy wellness"],
      urgency: "low",
      category: "obstetrics"
    }
  ],

  // Respiratory and infectious diseases
  respiratory: [
    {
      title: "COVID-19 symptoms, variants and long-COVID complications",
      keywords: ["covid symptoms", "coronavirus", "long covid", "post-covid syndrome", "viral infection"],
      urgency: "medium",
      category: "infectious diseases"
    },
    {
      title: "Asthma triggers, symptoms and inhaler techniques",
      keywords: ["asthma symptoms", "breathing problems", "asthma triggers", "inhaler use", "respiratory health"],
      urgency: "medium",
      category: "pulmonology"
    },
    {
      title: "COPD early signs and lifestyle modifications",
      keywords: ["COPD symptoms", "chronic bronchitis", "emphysema", "breathing difficulties", "lung disease"],
      urgency: "medium",
      category: "pulmonology"
    },
    {
      title: "Pneumonia symptoms and when to seek immediate care",
      keywords: ["pneumonia symptoms", "lung infection", "chest infection", "respiratory illness", "bacterial infection"],
      urgency: "high",
      category: "pulmonology"
    }
  ],

  // Digestive health topics
  digestive: [
    {
      title: "IBS symptoms and dietary management strategies",
      keywords: ["IBS symptoms", "irritable bowel syndrome", "digestive health", "gut health", "abdominal pain"],
      urgency: "low",
      category: "gastroenterology"
    },
    {
      title: "GERD and acid reflux: lifestyle changes that work",
      keywords: ["acid reflux", "GERD symptoms", "heartburn", "digestive disorders", "stomach acid"],
      urgency: "low",
      category: "gastroenterology"
    },
    {
      title: "Inflammatory bowel disease: Crohn's vs ulcerative colitis",
      keywords: ["IBD symptoms", "Crohn's disease", "ulcerative colitis", "inflammatory bowel", "digestive inflammation"],
      urgency: "medium",
      category: "gastroenterology"
    },
    {
      title: "Food allergies vs intolerances: understanding the difference",
      keywords: ["food allergies", "food intolerance", "allergic reactions", "dietary restrictions", "immune response"],
      urgency: "low",
      category: "immunology"
    }
  ],

  // Pediatric health topics
  pediatric: [
    {
      title: "Common childhood illnesses and when to call the doctor",
      keywords: ["childhood illnesses", "pediatric symptoms", "kids health", "child fever", "pediatric care"],
      urgency: "medium",
      category: "pediatrics"
    },
    {
      title: "Childhood vaccines: schedule, safety and importance",
      keywords: ["childhood vaccines", "immunization schedule", "vaccine safety", "pediatric immunization", "child protection"],
      urgency: "low",
      category: "pediatrics"
    },
    {
      title: "Recognizing autism spectrum disorder in early childhood",
      keywords: ["autism symptoms", "developmental delays", "ASD signs", "child development", "early intervention"],
      urgency: "medium",
      category: "developmental pediatrics"
    },
    {
      title: "ADHD in children: symptoms parents shouldn't ignore",
      keywords: ["childhood ADHD", "hyperactive child", "attention problems", "learning difficulties", "behavioral issues"],
      urgency: "medium",
      category: "child psychiatry"
    }
  ],

  // Dermatology topics
  dermatology: [
    {
      title: "Skin cancer warning signs and prevention strategies",
      keywords: ["skin cancer symptoms", "melanoma signs", "mole changes", "skin protection", "dermatology screening"],
      urgency: "high",
      category: "dermatology"
    },
    {
      title: "Eczema and atopic dermatitis: triggers and treatment",
      keywords: ["eczema symptoms", "atopic dermatitis", "skin irritation", "dry skin", "allergic skin"],
      urgency: "low",
      category: "dermatology"
    },
    {
      title: "Psoriasis: understanding this chronic skin condition",
      keywords: ["psoriasis symptoms", "autoimmune skin", "scaly skin", "chronic skin condition", "inflammatory skin"],
      urgency: "low",
      category: "dermatology"
    },
    {
      title: "Acne in adults: causes and effective treatments",
      keywords: ["adult acne", "acne treatment", "hormonal acne", "skin breakouts", "acne scars"],
      urgency: "low",
      category: "dermatology"
    }
  ],

  // Neurological conditions
  neurology: [
    {
      title: "Migraine headaches: triggers, symptoms and prevention",
      keywords: ["migraine symptoms", "headache triggers", "migraine prevention", "chronic headaches", "neurological pain"],
      urgency: "medium",
      category: "neurology"
    },
    {
      title: "Early signs of Alzheimer's disease and dementia",
      keywords: ["Alzheimer symptoms", "dementia signs", "memory loss", "cognitive decline", "brain health"],
      urgency: "medium",
      category: "neurology"
    },
    {
      title: "Epilepsy and seizure disorders: recognition and first aid",
      keywords: ["seizure symptoms", "epilepsy signs", "seizure first aid", "neurological disorders", "brain seizures"],
      urgency: "high",
      category: "neurology"
    },
    {
      title: "Multiple sclerosis early symptoms and diagnosis",
      keywords: ["MS symptoms", "multiple sclerosis", "autoimmune neurological", "nerve damage", "neurological disease"],
      urgency: "medium",
      category: "neurology"
    }
  ],

  // Eye and ear health
  sensory: [
    {
      title: "Glaucoma: the silent thief of sight",
      keywords: ["glaucoma symptoms", "eye pressure", "vision loss", "eye disease", "ophthalmology"],
      urgency: "medium",
      category: "ophthalmology"
    },
    {
      title: "Hearing loss signs and prevention strategies",
      keywords: ["hearing loss", "ear health", "hearing protection", "auditory problems", "ENT health"],
      urgency: "low",
      category: "otolaryngology"
    },
    {
      title: "Diabetic retinopathy and eye complications",
      keywords: ["diabetic eye disease", "retinopathy", "diabetes complications", "vision problems", "eye screening"],
      urgency: "medium",
      category: "ophthalmology"
    }
  ],

  // Urological and kidney health
  urology: [
    {
      title: "Kidney stone symptoms and prevention methods",
      keywords: ["kidney stones", "renal calculi", "kidney pain", "urinary problems", "stone prevention"],
      urgency: "medium",
      category: "urology"
    },
    {
      title: "UTI symptoms and natural prevention strategies",
      keywords: ["UTI symptoms", "urinary tract infection", "bladder infection", "urinary health", "infection prevention"],
      urgency: "medium",
      category: "urology"
    },
    {
      title: "Prostate health: BPH and cancer screening",
      keywords: ["prostate symptoms", "BPH", "prostate cancer", "men's health", "urological screening"],
      urgency: "medium",
      category: "urology"
    }
  ],

  // Seasonal and lifestyle health
  lifestyle: [
    {
      title: "Seasonal allergies: symptoms and natural remedies",
      keywords: ["seasonal allergies", "hay fever", "pollen allergy", "allergy symptoms", "natural allergy relief"],
      urgency: "low",
      category: "immunology"
    },
    {
      title: "Sleep disorders: insomnia, sleep apnea and solutions",
      keywords: ["sleep disorders", "insomnia", "sleep apnea", "sleep health", "sleep medicine"],
      urgency: "medium",
      category: "sleep medicine"
    },
    {
      title: "Vitamin D deficiency: symptoms and health impacts",
      keywords: ["vitamin D deficiency", "nutritional deficiency", "bone health", "immune health", "vitamin supplements"],
      urgency: "low",
      category: "endocrinology"
    },
    {
      title: "Chronic fatigue syndrome: more than just being tired",
      keywords: ["chronic fatigue", "CFS symptoms", "persistent tiredness", "energy disorders", "fatigue syndrome"],
      urgency: "medium",
      category: "internal medicine"
    }
  ]
};

async function runEnhancedDemo() {
  const agent = new BlogAgent();
  
  console.log('🩺 Enhanced Vaidya.AI Blog Agent Demo');
  console.log('=====================================\n');
  
  try {
    // Demo options
    const demoMode = process.argv[2] || 'single'; // single, batch, category
    const categoryFilter = process.argv[3]; // optional category filter
    
    switch (demoMode) {
      case 'single':
        await runSingleBlogDemo(agent);
        break;
      case 'batch':
        await runBatchDemo(agent, categoryFilter);
        break;
      case 'category':
        await runCategoryDemo(agent, categoryFilter);
        break;
      case 'analytics':
        await runAnalyticsDemo(agent);
        break;
      default:
        console.log('Available demo modes:');
        console.log('  node demo.js single    - Generate one sample blog');
        console.log('  node demo.js batch     - Generate multiple blogs');
        console.log('  node demo.js category [category] - Generate blogs for specific category');
        console.log('  node demo.js analytics - Show analytics after generation');
        break;
    }
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

async function runSingleBlogDemo(agent) {
  console.log('🚀 Single Blog Generation Demo\n');
  
  // Select a high-priority topic
  const emergencyTopic = medicalTopicsDatabase.emergency[0];
  
  console.log(`📝 Generating: "${emergencyTopic.title}"`);
  console.log(`🏥 Category: ${emergencyTopic.category}`);
  console.log(`⚠️ Urgency: ${emergencyTopic.urgency}`);
  console.log(`🔍 Keywords: ${emergencyTopic.keywords.join(', ')}\n`);
  
  const startTime = Date.now();
  
  const result = await agent.generateAndSaveBlog(
    emergencyTopic.title,
    emergencyTopic.keywords,
    {
      includeImages: true,
      includeVideos: true,
      includeInteractiveElements: true
    }
  );
  
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log('✅ Blog Generated Successfully!\n');
  console.log(`📁 File: ${result.filepath}`);
  console.log(`🌐 URL: http://localhost:3002/blogs/${result.url}`);
  console.log(`📋 Title: ${result.title}`);
  console.log(`🏥 Category: ${result.category}`);
  console.log(`⏱️ Reading Time: ${result.readingTime} minutes`);
  console.log(`⚠️ Urgency Level: ${result.urgencyLevel}`);
  console.log(`🔍 Keywords: ${result.keywords.join(', ')}`);
  console.log(`⚡ Generation Time: ${duration} seconds`);
  console.log(`🖼️ Has Images: ${result.hasImages ? 'Yes' : 'No'}`);
  console.log(`📺 Has Videos: ${result.hasVideos ? 'Yes' : 'No'}\n`);
  
  displayNextSteps();
}

async function runBatchDemo(agent, categoryFilter) {
  console.log('🚀 Batch Blog Generation Demo\n');
  
  // Select topics for batch generation
  let selectedTopics = [];
  
  if (categoryFilter && medicalTopicsDatabase[categoryFilter]) {
    selectedTopics = medicalTopicsDatabase[categoryFilter].slice(0, 3);
    console.log(`📂 Generating blogs for category: ${categoryFilter}`);
  } else {
    // Mix of high-priority topics from different categories
    selectedTopics = [
      ...medicalTopicsDatabase.emergency.slice(0, 1),
      ...medicalTopicsDatabase.chronic_conditions.slice(0, 2),
      ...medicalTopicsDatabase.mental_health.slice(0, 1),
      ...medicalTopicsDatabase.womens_health.slice(0, 1)
    ];
    console.log('📂 Generating mixed category blogs');
  }
  
  console.log(`📊 Total topics to generate: ${selectedTopics.length}\n`);
  
  selectedTopics.forEach((topic, index) => {
    console.log(`${index + 1}. ${topic.title} (${topic.category})`);
  });
  
  console.log('\n🔄 Starting batch generation...\n');
  
  const batchResult = await agent.generateMultipleBlogs(selectedTopics, {
    includeImages: true,
    includeVideos: true,
    includeInteractiveElements: true
  });
  
  console.log('\n📊 BATCH GENERATION SUMMARY:');
  console.log('============================');
  console.log(`✅ Successfully generated: ${batchResult.summary.successful} blogs`);
  console.log(`❌ Failed: ${batchResult.summary.failed} blogs`);
  console.log(`📈 Success Rate: ${batchResult.summary.successRate}%\n`);
  
  if (batchResult.results.length > 0) {
    console.log('📋 Generated Blogs:');
    batchResult.results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.title}`);
      console.log(`   🌐 URL: http://localhost:3002/blogs/${result.url}`);
      console.log(`   🏥 Category: ${result.category}`);
      console.log(`   ⚠️ Urgency: ${result.urgencyLevel}`);
      console.log(`   📖 Reading Time: ${result.readingTime} min`);
      console.log(`   🎨 Features: ${result.hasImages ? '🖼️' : ''}${result.hasVideos ? '📺' : ''}`);
    });
  }
  
  if (batchResult.errors.length > 0) {
    console.log('\n❌ Failed Generations:');
    batchResult.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.topic}: ${error.error}`);
    });
  }
  
  displayNextSteps();
}

async function runCategoryDemo(agent, category) {
  if (!category) {
    console.log('📂 Available Categories:');
    console.log('========================');
    Object.keys(medicalTopicsDatabase).forEach(cat => {
      const topics = medicalTopicsDatabase[cat];
      console.log(`${cat.padEnd(20)} - ${topics.length} topics`);
    });
    console.log('\nUsage: node demo.js category [category_name]');
    return;
  }
  
  if (!medicalTopicsDatabase[category]) {
    console.log(`❌ Category "${category}" not found.`);
    console.log('Available categories:', Object.keys(medicalTopicsDatabase).join(', '));
    return;
  }
  
  console.log(`🏥 Category-Specific Demo: ${category.toUpperCase()}\n`);
  
  const categoryTopics = medicalTopicsDatabase[category];
  console.log(`📊 Available topics in ${category}: ${categoryTopics.length}`);
  
  // Generate all topics in the category
  const batchResult = await agent.generateMultipleBlogs(categoryTopics, {
    includeImages: true,
    includeVideos: true,
    includeInteractiveElements: true
  });
  
  console.log(`\n📊 CATEGORY GENERATION RESULTS (${category}):`);
  console.log('==========================================');
  console.log(`✅ Generated: ${batchResult.summary.successful}/${categoryTopics.length} blogs`);
  console.log(`📈 Success Rate: ${batchResult.summary.successRate}%`);
  
  // Category-specific analytics
  if (batchResult.results.length > 0) {
    const urgencyDistribution = {};
    const avgReadingTime = batchResult.results.reduce((sum, result) => 
      sum + parseInt(result.readingTime || 8), 0) / batchResult.results.length;
    
    batchResult.results.forEach(result => {
      const urgency = result.urgencyLevel || 'medium';
      urgencyDistribution[urgency] = (urgencyDistribution[urgency] || 0) + 1;
    });
    
    console.log(`📖 Average Reading Time: ${Math.round(avgReadingTime)} minutes`);
    console.log('⚠️ Urgency Distribution:');
    Object.entries(urgencyDistribution).forEach(([level, count]) => {
      const emoji = level === 'high' ? '🚨' : level === 'low' ? '✅' : '⚠️';
      console.log(`   ${emoji} ${level}: ${count} blogs`);
    });
  }
  
  displayNextSteps();
}

async function runAnalyticsDemo(agent) {
  console.log('📊 Analytics Demo\n');
  
  // First generate a few sample blogs if none exist
  const fs = require('fs-extra');
  const blogsDir = './generated-blogs';
  
  if (!fs.existsSync(blogsDir) || fs.readdirSync(blogsDir).filter(f => f.endsWith('.html')).length === 0) {
    console.log('📝 No existing blogs found. Generating sample blogs for analytics...\n');
    
    const sampleTopics = [
      medicalTopicsDatabase.emergency[0],
      medicalTopicsDatabase.chronic_conditions[0],
      medicalTopicsDatabase.mental_health[0]
    ];
    
    await agent.generateMultipleBlogs(sampleTopics);
  }
  
  // Generate analytics report
  const existingBlogs = fs.readdirSync(blogsDir)
    .filter(f => f.endsWith('.html'))
    .map(f => ({ url: f, title: f.replace('.html', '') }));
  
  const report = await agent.generateBlogReport(existingBlogs);
  
  console.log('📊 BLOG ANALYTICS REPORT');
  console.log('========================\n');
  
  console.log('📈 Overview:');
  console.log(`   Total Blogs: ${report.totalBlogs}`);
  console.log(`   Average Reading Time: ${report.avgReadingTime} minutes`);
  console.log(`   Estimated SEO Score: ${report.estimatedSEOScore}/100\n`);
  
  console.log('🏥 Category Distribution:');
  Object.entries(report.categories).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} blogs`);
  });
  
  console.log('\n⚠️ Urgency Level Distribution:');
  Object.entries(report.urgencyLevels).forEach(([level, count]) => {
    const emoji = level === 'high' ? '🚨' : level === 'low' ? '✅' : '⚠️';
    console.log(`   ${emoji} ${level}: ${count} blogs`);
  });
  
  console.log('\n🎨 Features Usage:');
  console.log(`   📸 Blogs with Images: ${report.featuresUsed.withImages}`);
  console.log(`   📺 Blogs with Videos: ${report.featuresUsed.withVideos}`);
  console.log(`   🎯 Interactive Elements: ${report.featuresUsed.withInteractiveElements}`);
  
  console.log('\n🔍 Top Keywords:');
  Object.entries(report.topKeywords).slice(0, 10).forEach(([keyword, count]) => {
    console.log(`   "${keyword}": ${count} times`);
  });
  
  displayNextSteps();
}

function displayNextSteps() {
  console.log('\n🎉 Demo Completed Successfully!');
  console.log('===============================\n');
  
  console.log('📌 Next Steps:');
  console.log('1. 🌐 Start the server: npm start');
  console.log('2. 🔍 Open http://localhost:3002 to use the web interface');
  console.log('3. 📁 Check generated blogs in the ./generated-blogs folder');
  console.log('4. 📊 Use the analytics endpoint: http://localhost:3002/api/analytics');
  console.log('5. 🚀 Deploy to your blog.vaidya.ai subdomain');
  console.log('6. 📈 Submit sitemap to Google Search Console');
  console.log('7. 📱 Monitor traffic and SEO performance\n');
  
  console.log('🔧 Advanced Features:');
  console.log('• Batch generation with different options');
  console.log('• Category-specific blog generation');
  console.log('• Interactive elements (symptom checkers, quizzes)');
  console.log('• Medical images with DALL-E integration');
  console.log('• YouTube video recommendations');
  console.log('• Comprehensive analytics and reporting');
  console.log('• SEO optimization with schema markup');
  console.log('• Mobile-responsive design\n');
  
  console.log('💡 Pro Tips:');
  console.log('• Focus on high-urgency topics for better engagement');
  console.log('• Use batch generation for content series');
  console.log('• Monitor which categories perform best');
  console.log('• Regular analytics review for content optimization');
  console.log('• Enable all features (images, videos, interactive) for best results\n');
}

function displayTopicStatistics() {
  console.log('📊 Medical Topics Database Statistics:');
  console.log('====================================\n');
  
  let totalTopics = 0;
  const urgencyStats = { high: 0, medium: 0, low: 0 };
  const categoryStats = {};
  
  Object.entries(medicalTopicsDatabase).forEach(([section, topics]) => {
    console.log(`${section.padEnd(20)}: ${topics.length} topics`);
    totalTopics += topics.length;
    
    topics.forEach(topic => {
      urgencyStats[topic.urgency]++;
      categoryStats[topic.category] = (categoryStats[topic.category] || 0) + 1;
    });
  });
  
  console.log(`\nTotal Topics: ${totalTopics}`);
  console.log('\nUrgency Distribution:');
  console.log(`🚨 High: ${urgencyStats.high}`);
  console.log(`⚠️ Medium: ${urgencyStats.medium}`);
  console.log(`✅ Low: ${urgencyStats.low}`);
  
  console.log('\nMedical Specialties Covered:');
  Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`${category}: ${count} topics`);
    });
  
  console.log('\n');
}

// Show statistics if called with stats argument
if (process.argv[2] === 'stats') {
  displayTopicStatistics();
} else {
  runEnhancedDemo();
}

module.exports = {
  medicalTopicsDatabase,
  runEnhancedDemo
};