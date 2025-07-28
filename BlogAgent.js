// BlogAgent.js - Modified for Vercel serverless environment
const OpenAI = require('openai');
const slugify = require('slugify');

class BlogAgent {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // In Vercel, we can't write to filesystem easily
    // We'll store in memory or return for external storage
    this.outputDir = '/tmp/generated-blogs'; // Temporary directory in Vercel
    
    // Medical image categories for better targeting
    this.medicalImageCategories = {
      'symptoms': ['medical-symptoms', 'patient-examination', 'health-checkup'],
      'anatomy': ['human-anatomy', 'medical-illustration', 'body-parts'],
      'treatment': ['medical-treatment', 'hospital', 'medicine'],
      'prevention': ['healthy-lifestyle', 'exercise', 'nutrition'],
      'diagnostic': ['medical-equipment', 'x-ray', 'medical-test']
    };
  }

  // Generate medical images using relevant keywords (simplified for Vercel)
  async generateMedicalImages(topic, contentType = 'symptoms') {
    try {
      const imagePrompts = this.getMedicalImagePrompts(topic, contentType);
      const images = [];
      
      // Limit to 1 image for faster generation in serverless environment
      for (const prompt of imagePrompts.slice(0, 1)) {
        try {
          const response = await this.openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            size: "1024x1024",
            quality: "standard",
            n: 1,
          });
          
          images.push({
            url: response.data[0].url,
            alt: `Medical illustration: ${prompt.substring(0, 100)}...`,
            caption: this.generateImageCaption(prompt, topic)
          });
        } catch (imageError) {
          console.log('Image generation failed for prompt:', prompt);
          // Use fallback stock images
          images.push(this.getFallbackImage(topic, contentType));
        }
      }
      
      return images;
    } catch (error) {
      console.error('Error generating images:', error);
      return this.getFallbackImages(topic, contentType);
    }
  }

  getMedicalImagePrompts(topic, contentType) {
    const baseStyle = "Professional medical illustration, clean, educational, suitable for medical blog, ";
    
    const prompts = {
      'symptoms': [
        `${baseStyle}infographic showing common symptoms of ${topic}, human silhouette with symptom indicators`
      ],
      'treatment': [
        `${baseStyle}medical treatment options for ${topic}, healthcare setting`
      ],
      'prevention': [
        `${baseStyle}preventive measures for ${topic}, healthy lifestyle illustration`
      ],
      'anatomy': [
        `${baseStyle}anatomical diagram related to ${topic}, medical textbook style`
      ]
    };

    return prompts[contentType] || prompts['symptoms'];
  }

  generateImageCaption(prompt, topic) {
    const captions = [
      `Understanding ${topic}: Visual guide to key medical information`,
      `Medical illustration showing important aspects of ${topic}`,
      `Professional medical diagram explaining ${topic} concepts`,
      `Educational visual guide for ${topic} awareness`
    ];
    return captions[Math.floor(Math.random() * captions.length)];
  }

  getFallbackImage(topic, contentType) {
    // Using Unsplash as fallback
    const unsplashMedical = `https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=center`;
    return {
      url: unsplashMedical,
      alt: `Medical image related to ${topic}`,
      caption: `Visual representation of ${topic} in medical context`
    };
  }

  getFallbackImages(topic, contentType) {
    return [this.getFallbackImage(topic, contentType)];
  }

  // Generate relevant YouTube video links (simplified)
  async generateYouTubeLinks(topic) {
    const searchQueries = [
      `${topic} explained by doctor`,
      `${topic} symptoms medical advice`,
      `${topic} treatment options`
    ];

    const youtubeLinks = searchQueries.slice(0, 2).map((query, index) => ({
      title: this.generateVideoTitle(query, topic),
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      description: this.generateVideoDescription(query, topic),
      channel: this.getRandomMedicalChannel(),
      duration: this.getRandomDuration(),
      views: this.getRandomViews()
    }));

    return youtubeLinks;
  }

  generateVideoTitle(query, topic) {
    const titles = [
      `${topic}: What Every Patient Should Know`,
      `Doctor Explains ${topic} - Symptoms & Treatment`,
      `Complete Guide to ${topic} | Medical Expert`
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  generateVideoDescription(query, topic) {
    return `Comprehensive medical information about ${topic}. Learn about symptoms, causes, treatment options, and prevention strategies from medical professionals.`;
  }

  getRandomMedicalChannel() {
    const channels = ['Medical Centric', 'Doctor Mike', 'Med School Insiders', 'Osmosis'];
    return channels[Math.floor(Math.random() * channels.length)];
  }

  getRandomDuration() {
    const durations = ['5:23', '8:47', '12:15', '7:09'];
    return durations[Math.floor(Math.random() * durations.length)];
  }

  getRandomViews() {
    const views = ['125K', '456K', '1.2M', '789K'];
    return views[Math.floor(Math.random() * views.length)];
  }

  // Enhanced content generation with images and videos
  async generateBlogContent(topic, keywords = [], includeImages = true, includeVideos = true) {
    const contentType = this.detectContentType(topic);
    
    const prompt = `You are a medical content writer for vaidya.ai. Create a comprehensive blog post about "${topic}".

IMPORTANT: Respond ONLY with valid JSON. No markdown formatting, no extra text.

Requirements:
- Professional medical tone with empathetic approach
- Target keywords: ${keywords.join(', ')}
- Include H1, H2, H3 headings in HTML
- Add comprehensive FAQ section (at least 6 questions)
- Add "When to See a Doctor" section
- Add "Quick Facts" section with bullet points
- 1000-1500 words for comprehensive coverage
- Meta description under 150 characters
- Include placeholder for images: {{IMAGE_PLACEHOLDER_1}}
- Include placeholder for videos: {{VIDEO_PLACEHOLDER}}
- Include medical disclaimer and consultation CTA

Return this exact JSON structure:
{
  "title": "SEO optimized title here (under 60 chars)",
  "metaDescription": "Description under 150 chars",
  "content": "HTML content with headings, paragraphs, and placeholders",
  "keywords": ["primary keyword", "secondary keyword", "long-tail keyword"],
  "slug": "url-friendly-slug",
  "readingTime": "estimated reading time in minutes",
  "medicalCategory": "category like cardiology, endocrinology, etc",
  "urgencyLevel": "low/medium/high based on medical urgency",
  "targetAudience": "patients, caregivers, general public",
  "relatedConditions": ["related condition 1", "related condition 2"],
  "quickFacts": ["fact 1", "fact 2", "fact 3", "fact 4", "fact 5"]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 3000
      });

      let content = response.choices[0].message.content;
      content = this.cleanJSONResponse(content);
      
      const blogData = JSON.parse(content);
      
      // Enhance with images and videos
      if (includeImages) {
        const images = await this.generateMedicalImages(topic, contentType);
        blogData.images = images;
        blogData.content = this.insertImages(blogData.content, images);
      }
      
      if (includeVideos) {
        const videos = await this.generateYouTubeLinks(topic);
        blogData.videos = videos;
        blogData.content = this.insertVideos(blogData.content, videos);
      }

      return blogData;
    } catch (error) {
      console.error('Error generating content:', error);
      return this.getFallbackContent(topic, keywords);
    }
  }

  detectContentType(topic) {
    const topicLower = topic.toLowerCase();
    if (topicLower.includes('symptom') || topicLower.includes('sign')) return 'symptoms';
    if (topicLower.includes('treatment') || topicLower.includes('therapy')) return 'treatment';
    if (topicLower.includes('prevent') || topicLower.includes('avoid')) return 'prevention';
    if (topicLower.includes('anatomy') || topicLower.includes('body')) return 'anatomy';
    return 'symptoms';
  }

  cleanJSONResponse(content) {
    content = content.replace(/[\x00-\x1F\x7F]/g, '');
    content = content.replace(/\\n/g, '\\n');
    content = content.replace(/\\"/g, '\\"');
    
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      content = jsonMatch[1];
    }
    
    return content;
  }

  insertImages(content, images) {
    if (!images || images.length === 0) return content;
    
    images.forEach((image, index) => {
      const placeholder = `{{IMAGE_PLACEHOLDER_${index + 1}}}`;
      const imageHTML = `
        <div class="medical-image-container">
          <img src="${image.url}" alt="${image.alt}" class="medical-image" loading="lazy">
          <p class="image-caption">${image.caption}</p>
        </div>
      `;
      content = content.replace(placeholder, imageHTML);
    });
    
    return content;
  }

  insertVideos(content, videos) {
    if (!videos || videos.length === 0) return content;
    
    const videosHTML = `
      <div class="video-section">
        <h2>📺 Recommended Medical Videos</h2>
        <div class="video-grid">
          ${videos.map(video => `
            <div class="video-card">
              <div class="video-info">
                <h3><a href="${video.url}" target="_blank">${video.title}</a></h3>
                <p class="video-channel">${video.channel} • ${video.views} views</p>
                <p class="video-description">${video.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    content = content.replace('{{VIDEO_PLACEHOLDER}}', videosHTML);
    return content;
  }

  getFallbackContent(topic, keywords) {
    return {
      title: `${topic} - Complete Medical Guide | Vaidya.AI`,
      metaDescription: `Comprehensive guide about ${topic}. Learn symptoms, treatment, and when to consult doctors. Expert medical advice on Vaidya.AI.`,
      content: `
        <h1>${topic} - Complete Medical Guide</h1>
        <div class="quick-facts">
          <h2>📋 Quick Facts</h2>
          <ul>
            <li>Always consult healthcare professionals for proper diagnosis</li>
            <li>Early detection can significantly improve outcomes</li>
            <li>Vaidya.AI provides instant medical consultations</li>
          </ul>
        </div>
        <h2>Understanding ${topic}</h2>
        <p>This comprehensive guide covers everything you need to know about ${topic}, including symptoms, causes, treatment options, and prevention strategies.</p>
        {{VIDEO_PLACEHOLDER}}
      `,
      keywords: keywords.length > 0 ? keywords : [topic, "medical advice", "symptoms", "treatment"],
      slug: slugify(topic, { lower: true }),
      readingTime: "8",
      medicalCategory: "General Medicine",
      urgencyLevel: "medium",
      targetAudience: "general public",
      relatedConditions: [],
      quickFacts: ["Consult healthcare professionals", "Early detection is key", "Individual symptoms may vary"]
    };
  }

  // Simplified HTML page creation for Vercel
  createHTMLPage(blogData) {
    const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${blogData.title}</title>
    <meta name="description" content="${blogData.metaDescription}">
    <meta name="keywords" content="${blogData.keywords.join(', ')}">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c5aa0; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
        h2 { color: #2c5aa0; margin-top: 30px; }
        .medical-image-container { text-align: center; margin: 20px 0; }
        .medical-image { max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .image-caption { font-style: italic; color: #666; margin-top: 10px; }
        .video-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .video-card { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .quick-facts { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .cta-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin: 30px 0; }
        .cta-button { display: inline-block; background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin-top: 15px; }
    </style>
</head>
<body>
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; margin: -20px -20px 30px -20px; border-radius: 0 0 15px 15px;">
        <h1 style="color: white; border: none; margin: 0;">🩺 Vaidya.AI Health Blog</h1>
        <p>Your trusted source for evidence-based medical information</p>
    </div>
    
    ${blogData.content}
    
    <div class="cta-box">
        <h3>🩺 Need Professional Medical Consultation?</h3>
        <p>Don't let health concerns wait. Get instant, personalized medical advice from qualified doctors on Vaidya.AI.</p>
        <a href="https://vaidya.ai" class="cta-button">Consult Doctor Now</a>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 30px; font-size: 14px; color: #666;">
        <p><strong>⚕️ Medical Disclaimer:</strong> This article is for informational purposes only and should not replace professional medical advice. Always consult with qualified healthcare professionals before making any health decisions.</p>
    </div>
</body>
</html>`;
    return template;
  }

  // Main blog generation method for Vercel
  async generateAndSaveBlog(topic, keywords = [], options = {}) {
    console.log(`Generating blog for: ${topic}`);
    
    try {
      const blogData = await this.generateBlogContent(
        topic, 
        keywords, 
        options.includeImages !== false,
        options.includeVideos !== false
      );
      
      const html = this.createHTMLPage(blogData);
      const filename = `${slugify(blogData.slug || topic, { lower: true })}.html`;
      
      // In Vercel, we return the data instead of saving to file system
      return {
        filepath: `/generated-blogs/${filename}`,
        filename: filename,
        url: `/generated-blogs/${filename}`,
        title: blogData.title,
        keywords: blogData.keywords,
        category: blogData.medicalCategory,
        urgencyLevel: blogData.urgencyLevel,
        readingTime: blogData.readingTime,
        hasImages: !!(blogData.images && blogData.images.length > 0),
        hasVideos: !!(blogData.videos && blogData.videos.length > 0),
        html: html, // Return HTML content for external storage
        metadata: blogData
      };
    } catch (error) {
      console.error('Error generating blog:', error);
      throw error;
    }
  }
}

module.exports = BlogAgent;