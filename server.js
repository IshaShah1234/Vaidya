// api/index.js - Main Vercel serverless function
const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Create Express app
const app = express();

// Rate limiting with memory store (Vercel compatible)
const blogGenerationLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    error: 'Too many blog generation requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(generalLimit);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware for Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Enhanced topic suggestions (same as original)
const topicSuggestions = {
  cardiovascular: [
    { title: "Heart attack warning signs and prevention", keywords: ["heart attack symptoms", "chest pain", "cardiac emergency", "heart disease prevention"] },
    { title: "High blood pressure management and natural remedies", keywords: ["hypertension", "blood pressure control", "natural remedies", "heart health"] },
    { title: "Understanding cholesterol levels and heart health", keywords: ["cholesterol levels", "LDL HDL", "heart disease", "lipid profile"] }
  ],
  endocrine: [
    { title: "Diabetes symptoms and early warning signs", keywords: ["diabetes symptoms", "blood sugar", "early diabetes signs", "diabetes diagnosis"] },
    { title: "Thyroid disorders: symptoms and treatment options", keywords: ["thyroid symptoms", "hypothyroidism", "hyperthyroidism", "thyroid treatment"] },
    { title: "Understanding insulin resistance and prediabetes", keywords: ["insulin resistance", "prediabetes", "metabolic syndrome", "blood sugar control"] }
  ],
  respiratory: [
    { title: "Asthma triggers and management strategies", keywords: ["asthma symptoms", "asthma triggers", "inhaler use", "respiratory health"] },
    { title: "COPD symptoms and lifestyle modifications", keywords: ["COPD symptoms", "chronic bronchitis", "emphysema", "breathing difficulties"] },
    { title: "COVID-19 symptoms and recovery guidelines", keywords: ["covid symptoms", "coronavirus", "post-covid recovery", "respiratory illness"] }
  ],
  mental_health: [
    { title: "Depression signs and when to seek help", keywords: ["depression symptoms", "mental health", "mood disorders", "psychological help"] },
    { title: "Anxiety disorders: types and treatment options", keywords: ["anxiety symptoms", "panic attacks", "social anxiety", "mental wellness"] },
    { title: "Stress management techniques for better mental health", keywords: ["stress management", "mental wellness", "coping strategies", "mindfulness"] }
  ],
  digestive: [
    { title: "IBS symptoms and dietary management", keywords: ["IBS symptoms", "irritable bowel syndrome", "digestive health", "gut health"] },
    { title: "GERD symptoms and lifestyle changes", keywords: ["acid reflux", "GERD symptoms", "heartburn", "digestive disorders"] },
    { title: "Understanding food allergies and intolerances", keywords: ["food allergies", "food intolerance", "allergic reactions", "dietary restrictions"] }
  ],
  women_health: [
    { title: "PCOS symptoms and management strategies", keywords: ["PCOS symptoms", "polycystic ovary syndrome", "hormonal imbalance", "women's health"] },
    { title: "Menopause symptoms and hormone therapy", keywords: ["menopause symptoms", "hormone replacement", "hot flashes", "women's wellness"] },
    { title: "Pregnancy symptoms and prenatal care", keywords: ["pregnancy symptoms", "prenatal care", "maternal health", "pregnancy wellness"] }
  ],
  pediatric: [
    { title: "Common childhood illnesses and when to worry", keywords: ["childhood illnesses", "pediatric symptoms", "kids health", "child development"] },
    { title: "Vaccination schedule and importance for children", keywords: ["childhood vaccines", "immunization schedule", "vaccine safety", "pediatric care"] },
    { title: "Recognizing developmental delays in children", keywords: ["child development", "developmental delays", "pediatric milestones", "early intervention"] }
  ]
};

// Mock BlogAgent class for Vercel (since file system operations are limited)
class MockBlogAgent {
  constructor() {
    this.isVercelEnvironment = true;
  }

  async generateAndSaveBlog(topic, keywords = [], options = {}) {
    // Simulate blog generation
    const mockBlog = {
      title: `Understanding ${topic}`,
      url: `${this.sanitizeFilename(topic)}.html`,
      filepath: `/tmp/${this.sanitizeFilename(topic)}.html`,
      keywords: keywords.length > 0 ? keywords : this.generateKeywords(topic),
      category: this.determineCategory(topic),
      urgencyLevel: this.determineUrgencyLevel(topic),
      readingTime: Math.floor(Math.random() * 10) + 5,
      hasImages: options.includeImages !== false,
      hasVideos: options.includeVideos || false,
      metadata: {
        generated: new Date().toISOString(),
        wordCount: Math.floor(Math.random() * 2000) + 1000,
        sections: ['Introduction', 'Symptoms', 'Causes', 'Treatment', 'Prevention', 'Conclusion']
      }
    };

    return mockBlog;
  }

  async generateMultipleBlogs(topics, options = {}) {
    const results = [];
    const errors = [];
    let successful = 0;

    for (let i = 0; i < Math.min(topics.length, 20); i++) {
      try {
        const result = await this.generateAndSaveBlog(topics[i].topic || topics[i], topics[i].keywords, options);
        results.push(result);
        successful++;
      } catch (error) {
        errors.push({
          topic: topics[i].topic || topics[i],
          error: error.message
        });
      }
    }

    return {
      summary: {
        total: topics.length,
        successful,
        failed: errors.length
      },
      results,
      errors
    };
  }

  sanitizeFilename(topic) {
    return topic.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  generateKeywords(topic) {
    const baseKeywords = [
      'symptoms', 'treatment', 'causes', 'prevention', 'diagnosis',
      'health', 'medical', 'care', 'wellness', 'management'
    ];
    return baseKeywords.slice(0, Math.floor(Math.random() * 5) + 3);
  }

  determineCategory(topic) {
    const topicLower = topic.toLowerCase();
    if (topicLower.includes('heart') || topicLower.includes('blood pressure')) return 'Cardiovascular';
    if (topicLower.includes('diabetes') || topicLower.includes('thyroid')) return 'Endocrine';
    if (topicLower.includes('asthma') || topicLower.includes('respiratory')) return 'Respiratory';
    if (topicLower.includes('mental') || topicLower.includes('depression')) return 'Mental Health';
    if (topicLower.includes('digestive') || topicLower.includes('stomach')) return 'Digestive';
    if (topicLower.includes('women') || topicLower.includes('pregnancy')) return 'Women\'s Health';
    if (topicLower.includes('child') || topicLower.includes('pediatric')) return 'Pediatric';
    return 'General Medicine';
  }

  determineUrgencyLevel(topic) {
    const topicLower = topic.toLowerCase();
    if (topicLower.includes('emergency') || topicLower.includes('attack')) return 'high';
    if (topicLower.includes('chronic') || topicLower.includes('management')) return 'low';
    return 'medium';
  }
}

// Initialize Mock Blog Agent
const blogAgent = new MockBlogAgent();

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: 'vercel-serverless',
    platform: 'vercel'
  };
  
  res.json(health);
});

// Enhanced blog generation endpoint
app.post('/api/generate-blog', blogGenerationLimit, async (req, res) => {
  try {
    const { topic, keywords, options = {} } = req.body;
    
    if (!topic) {
      return res.status(400).json({ 
        error: 'Topic is required',
        code: 'MISSING_TOPIC'
      });
    }

    console.log(`🚀 Generating blog for: ${topic}`);
    
    const startTime = Date.now();
    const result = await blogAgent.generateAndSaveBlog(topic, keywords || [], options);
    const endTime = Date.now();
    const generationTime = Math.round((endTime - startTime) / 1000);
    
    res.json({
      success: true,
      message: 'Blog generated successfully!',
      generationTime,
      blog: {
        title: result.title,
        url: result.url,
        filepath: result.filepath,
        keywords: result.keywords,
        category: result.category,
        urgencyLevel: result.urgencyLevel,
        readingTime: result.readingTime,
        features: {
          hasImages: result.hasImages,
          hasVideos: result.hasVideos,
          hasInteractiveElements: options.includeInteractiveElements || false
        },
        metadata: result.metadata
      }
    });
  } catch (error) {
    console.error('❌ Error generating blog:', error);
    res.status(500).json({ 
      error: 'Failed to generate blog', 
      details: error.message,
      code: 'GENERATION_FAILED'
    });
  }
});

// Batch blog generation endpoint
app.post('/api/generate-multiple-blogs', blogGenerationLimit, async (req, res) => {
  try {
    const { topics, options = {} } = req.body;
    
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({
        error: 'Topics array is required',
        code: 'MISSING_TOPICS'
      });
    }

    if (topics.length > 20) {
      return res.status(400).json({
        error: 'Maximum 20 topics allowed per batch',
        code: 'TOO_MANY_TOPICS'
      });
    }

    console.log(`🚀 Starting batch generation of ${topics.length} blogs...`);
    
    const startTime = Date.now();
    const batchResult = await blogAgent.generateMultipleBlogs(topics, options);
    const endTime = Date.now();
    
    const totalTime = Math.round((endTime - startTime) / 1000);
    
    res.json({
      success: true,
      message: `Batch generation completed: ${batchResult.summary.successful}/${batchResult.summary.total} blogs generated`,
      batchId: `batch_${Date.now()}`,
      totalTime,
      summary: batchResult.summary,
      results: batchResult.results,
      errors: batchResult.errors
    });
  } catch (error) {
    console.error('❌ Error in batch generation:', error);
    res.status(500).json({
      error: 'Batch generation failed',
      details: error.message,
      code: 'BATCH_GENERATION_FAILED'
    });
  }
});

// Get topic suggestions endpoint
app.get('/api/topic-suggestions', (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    
    let suggestions = [];
    
    if (category && topicSuggestions[category]) {
      suggestions = topicSuggestions[category];
    } else {
      Object.values(topicSuggestions).forEach(categoryTopics => {
        suggestions.push(...categoryTopics);
      });
    }
    
    const shuffled = suggestions.sort(() => 0.5 - Math.random());
    const limited = shuffled.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      category: category || 'all',
      suggestions: limited,
      totalCategories: Object.keys(topicSuggestions).length
    });
  } catch (error) {
    console.error('Error getting topic suggestions:', error);
    res.status(500).json({
      error: 'Failed to get topic suggestions',
      details: error.message
    });
  }
});

// Mock blogs list endpoint (since file system is limited in Vercel)
app.get('/api/blogs', (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      urgency, 
      sortBy = 'created', 
      sortOrder = 'desc',
      search 
    } = req.query;
    
    // Mock blog data for demonstration
    const mockBlogs = [
      {
        name: 'diabetes-symptoms-guide',
        filename: 'diabetes-symptoms-guide.html',
        url: '/blogs/diabetes-symptoms-guide.html',
        title: 'Understanding Diabetes Symptoms and Early Warning Signs',
        created: new Date('2024-01-15'),
        modified: new Date('2024-01-15'),
        size: 15420,
        medicalCategory: 'Endocrine',
        urgencyLevel: 'medium',
        keywords: ['diabetes', 'symptoms', 'blood sugar', 'health'],
        readingTime: 8
      },
      {
        name: 'heart-attack-prevention',
        filename: 'heart-attack-prevention.html',
        url: '/blogs/heart-attack-prevention.html',
        title: 'Heart Attack Warning Signs and Prevention',
        created: new Date('2024-01-14'),
        modified: new Date('2024-01-14'),
        size: 18750,
        medicalCategory: 'Cardiovascular',
        urgencyLevel: 'high',
        keywords: ['heart attack', 'prevention', 'cardiovascular', 'emergency'],
        readingTime: 12
      }
    ];
    
    let filteredBlogs = [...mockBlogs];
    
    // Apply filters
    if (category) {
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.medicalCategory && blog.medicalCategory.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    if (urgency) {
      filteredBlogs = filteredBlogs.filter(blog => blog.urgencyLevel === urgency);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.title?.toLowerCase().includes(searchLower) ||
        blog.name.toLowerCase().includes(searchLower) ||
        blog.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower))
      );
    }
    
    const totalBlogs = filteredBlogs.length;
    const totalPages = Math.ceil(totalBlogs / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);
    
    res.json({
      blogs: paginatedBlogs,
      pagination: {
        total: totalBlogs,
        pages: totalPages,
        current: parseInt(page),
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        categories: { 'Endocrine': 1, 'Cardiovascular': 1 },
        urgencyLevels: { 'medium': 1, 'high': 1 },
        appliedFilters: { category, urgency, search }
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch blogs',
      details: error.message
    });
  }
});

// Analytics endpoint with mock data
app.get('/api/analytics', (req, res) => {
  try {
    const mockStats = {
      totalBlogs: 25,
      todayBlogs: 3,
      weeklyBlogs: 12,
      monthlyBlogs: 25,
      categoriesDistribution: {
        'Cardiovascular': 8,
        'Endocrine': 6,
        'Respiratory': 4,
        'Mental Health': 3,
        'Digestive': 2,
        'Women\'s Health': 1,
        'Pediatric': 1
      },
      urgencyDistribution: {
        'high': 5,
        'medium': 15,
        'low': 5
      },
      featuresUsage: {
        withImages: 20,
        withVideos: 8,
        withInteractiveElements: 12
      },
      avgReadingTime: 9,
      topKeywords: {
        'symptoms': 18,
        'treatment': 15,
        'prevention': 12,
        'health': 25,
        'diagnosis': 10,
        'management': 8
      },
      recentActivity: [
        {
          title: 'Heart Attack Prevention Guide',
          created: new Date(),
          category: 'Cardiovascular',
          urgency: 'high'
        },
        {
          title: 'Understanding Diabetes',
          created: new Date(Date.now() - 86400000),
          category: 'Endocrine',
          urgency: 'medium'
        }
      ]
    };
    
    res.json(mockStats);
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({
      error: 'Failed to generate analytics',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    code: 'INTERNAL_ERROR'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    code: 'NOT_FOUND'
  });
});

// Export the Express app as a Vercel function
module.exports = app;