// api/index.js - Main Vercel serverless function
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Create Express app
const app = express();

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for the frontend
}));
app.use(compression());
app.use(cors({
  origin: process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory storage for generated blogs (in production, use a database)
const blogStorage = new Map();

// Import BlogAgent
let BlogAgent;
try {
  BlogAgent = require('../BlogAgent.js');
} catch (error) {
  console.error('Failed to load BlogAgent:', error);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.VERCEL_ENV || 'development',
    blogAgentAvailable: !!BlogAgent
  });
});

// Main blog generation endpoint
app.post('/api/generate-blog', async (req, res) => {
  try {
    const { topic, keywords = [], options = {} } = req.body;
    
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required and must be a non-empty string'
      });
    }

    if (!BlogAgent) {
      return res.status(500).json({
        success: false,
        error: 'Blog generation service is not available'
      });
    }

    // Generate a unique filename
    const filename = generateFilename(topic);
    
    // Initialize blog agent and generate blog
    const blogAgent = new BlogAgent();
    const result = await blogAgent.generateAndSaveBlog(
      topic.trim(),
      Array.isArray(keywords) ? keywords : [],
      options
    );

    // Store the blog in memory with the generated filename
    blogStorage.set(filename, {
      ...result,
      generatedAt: new Date().toISOString(),
      id: uuidv4()
    });

    res.json({
      success: true,
      blog: {
        title: result.title || topic,
        url: `/generated-blogs/${filename}.html`,
        filename: `${filename}.html`,
        category: result.category || 'General Medicine',
        urgencyLevel: result.urgencyLevel || 'medium',
        readingTime: result.readingTime || '8',
        keywords: result.keywords || keywords,
        features: {
          hasImages: result.hasImages || false,
          hasVideos: result.hasVideos || false,
          hasInteractiveElements: options.includeInteractiveElements || false
        }
      },
      metadata: result.metadata || {}
    });

  } catch (error) {
    console.error('Blog generation error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate blog',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Serve generated blog files
app.get('/generated-blogs/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const cleanFilename = filename.replace(/\.html$/, '');
    
    // Check if blog exists in storage
    if (blogStorage.has(cleanFilename)) {
      const blogData = blogStorage.get(cleanFilename);
      
      // Set appropriate headers for HTML content
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      return res.status(200).send(blogData.html);
    }
    
    // If not found, return 404 with helpful message
    res.status(404).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Blog Not Found - Vaidya.AI</title>
          <style>
              body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  margin: 0; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center;
              }
              .container { 
                  background: white; padding: 40px; border-radius: 15px; text-align: center; max-width: 500px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              }
              h1 { color: #e74c3c; margin-bottom: 20px; }
              p { color: #6c757d; line-height: 1.6; margin-bottom: 30px; }
              .btn { 
                  background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; 
                  border-radius: 8px; font-weight: bold; display: inline-block;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>📄 Blog Not Found</h1>
              <p>The blog you're looking for doesn't exist or may have expired. Please generate a new blog using the generator.</p>
              <a href="/" class="btn">🚀 Generate New Blog</a>
          </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Error serving blog:', error);
    res.status(500).send('Internal server error');
  }
});

// Get blogs list endpoint
app.get('/api/blogs', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = ''
    } = req.query;

    // Convert storage map to array
    const allBlogs = Array.from(blogStorage.entries()).map(([filename, data]) => ({
      name: filename,
      filename: `${filename}.html`,
      url: `/generated-blogs/${filename}.html`,
      title: data.title || filename.replace(/-/g, ' '),
      created: data.generatedAt || new Date().toISOString(),
      medicalCategory: data.category || 'General Medicine',
      urgencyLevel: data.urgencyLevel || 'medium',
      readingTime: data.readingTime || '8',
      keywords: data.keywords || [],
      quickFacts: data.quickFacts || []
    }));

    // Filter blogs based on search and category
    let filteredBlogs = allBlogs;
    
    if (search) {
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.name.toLowerCase().includes(search.toLowerCase()) ||
        blog.title.toLowerCase().includes(search.toLowerCase()) ||
        (blog.keywords && blog.keywords.some(keyword => 
          keyword.toLowerCase().includes(search.toLowerCase())
        ))
      );
    }
    
    if (category) {
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.medicalCategory?.toLowerCase() === category.toLowerCase()
      );
    }

    // Sort by creation date (newest first)
    filteredBlogs.sort((a, b) => new Date(b.created) - new Date(a.created));

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

    res.json({
      success: true,
      blogs: paginatedBlogs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(filteredBlogs.length / parseInt(limit)),
        total: filteredBlogs.length,
        hasNext: endIndex < filteredBlogs.length,
        hasPrev: startIndex > 0
      }
    });

  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blogs'
    });
  }
});

// Analytics endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const blogs = Array.from(blogStorage.values());
    
    const analytics = {
      totalBlogs: blogs.length,
      todayBlogs: blogs.filter(blog => {
        const today = new Date().toDateString();
        const blogDate = new Date(blog.generatedAt || Date.now()).toDateString();
        return today === blogDate;
      }).length,
      weeklyBlogs: blogs.filter(blog => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const blogDate = new Date(blog.generatedAt || Date.now());
        return blogDate >= weekAgo;
      }).length,
      avgReadingTime: blogs.length > 0 
        ? Math.round(blogs.reduce((sum, blog) => sum + parseInt(blog.readingTime || 8), 0) / blogs.length)
        : 8,
      featuresUsage: {
        withImages: blogs.filter(blog => blog.hasImages).length,
        withVideos: blogs.filter(blog => blog.hasVideos).length,
        withInteractiveElements: blogs.filter(blog => blog.hasInteractiveElements).length
      },
      categoriesDistribution: blogs.reduce((acc, blog) => {
        const category = blog.category || 'General Medicine';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {})
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

// Blog preview endpoint
app.get('/api/blogs/:filename/preview', async (req, res) => {
  try {
    const { filename } = req.params;
    const cleanFilename = filename.replace(/\.html$/, '');
    
    if (blogStorage.has(cleanFilename)) {
      const blogData = blogStorage.get(cleanFilename);
      
      // Extract first paragraph for preview
      const htmlContent = blogData.html || '';
      const preview = extractPreview(htmlContent, blogData.title || cleanFilename);
      
      return res.json({
        success: true,
        title: blogData.title || cleanFilename.replace(/-/g, ' '),
        preview: preview,
        fullUrl: `/generated-blogs/${filename}`
      });
    }
    
    res.status(404).json({
      success: false,
      error: 'Blog not found'
    });
    
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate preview'
    });
  }
});

// Delete blog endpoint
app.delete('/api/blogs/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const cleanFilename = filename.replace(/\.html$/, '');
    
    if (blogStorage.has(cleanFilename)) {
      blogStorage.delete(cleanFilename);
      return res.json({
        success: true,
        message: `Blog ${filename} deleted successfully`
      });
    }
    
    res.status(404).json({
      success: false,
      error: 'Blog not found'
    });
    
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete blog'
    });
  }
});

// Export blogs endpoint
app.get('/api/export/blogs', async (req, res) => {
  try {
    const blogs = Array.from(blogStorage.entries()).map(([filename, data]) => ({
      filename,
      title: data.title,
      category: data.category,
      keywords: data.keywords,
      generatedAt: data.generatedAt,
      readingTime: data.readingTime
    }));

    const exportData = {
      exportDate: new Date().toISOString(),
      totalBlogs: blogs.length,
      blogs: blogs
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=vaidya-blogs-export.json');
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting blogs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export blogs'
    });
  }
});

// Catch-all handler for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Utility functions
function generateFilename(topic) {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
    .replace(/-$/, '');
}

function extractPreview(htmlContent, title) {
  // Remove HTML tags and extract first 200 characters
  const textContent = htmlContent.replace(/<[^>]*>/g, '');
  const preview = textContent.substring(0, 200).trim();
  return preview + (preview.length === 200 ? '...' : '');
}

// Export the Express app for Vercel
module.exports = app;