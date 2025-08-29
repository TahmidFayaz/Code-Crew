const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide blog title'],
    minlength: 3,
    maxlength: 200,
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Please provide blog content'],
    minlength: 100,
  },
  excerpt: {
    type: String,
    maxlength: 300,
  },
  author: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['tips', 'success-stories', 'tutorials', 'announcements', 'interviews'],
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  featuredImage: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Please provide valid image URL',
    },
  },
  status: {
    type: String,
    enum: ['pending', 'published', 'rejected', "draft"],
    default: 'pending',
  },
  publishedAt: {
    type: Date,
  },
  readTime: {
    type: Number, // in minutes
    default: 5,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: [{
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    likedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  comments: [{
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  relatedHackathon: {
    type: mongoose.Types.ObjectId,
    ref: 'Hackathon',
  },
}, {
  timestamps: true,
});

// Auto-generate excerpt from content if not provided
BlogSchema.pre('save', function () {
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 297) + '...';
  }

  // Set publishedAt when status changes to published
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

// Index for searching blogs
BlogSchema.index({ title: 'text', content: 'text', tags: 'text' });
BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ category: 1, publishedAt: -1 });

module.exports = mongoose.model('Blog', BlogSchema);