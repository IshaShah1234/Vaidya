// api/blogs/[filename].js - Serve generated blog files
const path = require('path');

// Try to import BlogAgent, fallback if not available
let BlogAgent;
try {
  BlogAgent = require('../../BlogAgent.js');
} catch (error) {
  console.log('BlogAgent not found, using fallback');
  BlogAgent = null;
}

// In-memory storage for generated blogs (in production, use a database)
const blogStorage = new Map();

module.exports = async function handler(req, res) {
  const { filename } = req.query;
  
  try {
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return await serveBlog(req, res, filename);
      case 'POST':
        return await generateAndStoreBlog(req, res, filename);
      case 'DELETE':
        return await deleteBlog(req, res, filename);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Blog handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function serveBlog(req, res, filename) {
  try {
    // Clean filename
    const cleanFilename = filename.replace(/\.html$/, '');
    
    // Check if blog exists in storage
    if (blogStorage.has(cleanFilename)) {
      const blogData = blogStorage.get(cleanFilename);
      
      // Set appropriate headers for HTML content
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      
      return res.status(200).send(blogData.html);
    }
    
    // If not in storage, try to generate or return fallback
    if (!BlogAgent) {
      const fallbackHtml = generateFallbackBlog(filename);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(fallbackHtml);
    }
    
    const blogAgent = new BlogAgent();
    const topic = cleanFilename.replace(/-/g, ' ');
    
    const blogData = await blogAgent.generateAndSaveBlog(topic, [], {
      includeImages: true,
      includeVideos: true,
      includeInteractiveElements: true
    });
    
    // Store in memory
    blogStorage.set(cleanFilename, blogData);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    return res.status(200).send(blogData.html);
    
  } catch (error) {
    console.error('Error serving blog:', error);
    
    // Return a fallback HTML page
    const fallbackHtml = generateFallbackBlog(filename);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(fallbackHtml);
  }
}

async function generateAndStoreBlog(req, res, filename) {
  try {
    const { topic, keywords = [], options = {} } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const blogAgent = new BlogAgent();
    const blogData = await blogAgent.generateAndSaveBlog(topic, keywords, options);
    
    // Store in memory with the filename as key
    const cleanFilename = filename.replace(/\.html$/, '');
    blogStorage.set(cleanFilename, blogData);
    
    return res.status(200).json({
      success: true,
      message: 'Blog generated and stored successfully',
      url: `/generated-blogs/${filename}`,
      title: blogData.title
    });
    
  } catch (error) {
    console.error('Error generating blog:', error);
    return res.status(500).json({ 
      error: 'Failed to generate blog',
      details: error.message 
    });
  }
}

async function deleteBlog(req, res, filename) {
  try {
    const cleanFilename = filename.replace(/\.html$/, '');
    
    if (blogStorage.has(cleanFilename)) {
      blogStorage.delete(cleanFilename);
      return res.status(200).json({
        success: true,
        message: 'Blog deleted successfully'
      });
    }
    
    return res.status(404).json({
      error: 'Blog not found'
    });
    
  } catch (error) {
    console.error('Error deleting blog:', error);
    return res.status(500).json({ 
      error: 'Failed to delete blog',
      details: error.message 
    });
  }
}

function generateFallbackBlog(filename) {
  const title = filename.replace(/-/g, ' ').replace(/\.html$/, '');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Vaidya.AI Medical Blog</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 { 
            color: #2c5aa0; 
            border-bottom: 3px solid #4CAF50; 
            padding-bottom: 15px; 
            margin-bottom: 30px;
        }
        .medical-disclaimer {
            background: #e8f5e8;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #4CAF50;
            margin: 30px 0;
        }
        .cta-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 15px;
            margin: 30px 0;
        }
        .cta-button {
            display: inline-block;
            background: #e74c3c;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🩺 ${title}</h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <h3>⏳ Blog Content Loading...</h3>
            <p>We're generating your comprehensive medical blog with AI-powered content. This may take a moment.</p>
            <button onclick="window.location.reload()" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">🔄 Refresh Page</button>
        </div>
        
        <h2>About This Medical Topic</h2>
        <p>This comprehensive guide about <strong>${title}</strong> is being generated with the latest medical information, AI-generated illustrations, and interactive content to provide you with accurate, up-to-date health information.</p>
        
        <div class="medical-disclaimer">
            <h3>📋 Quick Medical Facts</h3>
            <ul>
                <li>Always consult with qualified healthcare professionals for medical advice</li>
                <li>This content is for informational purposes only</li>
                <li>Individual symptoms and treatments may vary</li>
                <li>Seek immediate medical attention for emergency symptoms</li>
            </ul>
        </div>
        
        <div class="cta-box">
            <h3>🩺 Need Professional Medical Consultation?</h3>
            <p>Get instant, personalized medical advice from qualified doctors.</p>
            <a href="https://vaidya.ai" class="cta-button">Consult Doctor Now</a>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
            <p><strong>⚕️ Medical Disclaimer:</strong> This article is for informational purposes only and should not replace professional medical advice. Always consult with qualified healthcare professionals before making any health decisions.</p>
        </div>
    </div>
    
    <script>
        // Auto-refresh after 10 seconds to load generated content
        setTimeout(() => {
            if (confirm('Blog content should be ready now. Would you like to refresh the page?')) {
                window.location.reload();
            }
        }, 10000);
    </script>
</body>
</html>`;
}