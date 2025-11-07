const BlogVisitor = require('../models/BlogVisitor');
const Blog = require('../models/Blog');
const BlogVisit = require('../models/BlogVisit');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { getClientIP, getDeviceInfo, getLocationInfo } = require('../utils/visitorUtils');

/**
 * GET /blog-visitors/check - Vérifier si un visiteur existe
 */
exports.checkVisitor = catchAsync(async (req, res, next) => {
  const ipAddress = getClientIP(req);
  const visitor = await BlogVisitor.findByIP(ipAddress);
  
  if (visitor) {
    res.status(200).json({
      exists: true,
      visitor: {
        firstName: visitor.firstName,
        lastName: visitor.lastName,
        email: visitor.email,
        country: visitor.country,
        isReturningVisitor: visitor.isReturningVisitor,
        totalBlogsVisited: visitor.totalBlogsVisited,
        lastVisitAt: visitor.lastVisitAt
      }
    });
  } else {
    res.status(200).json({
      exists: false
    });
  }
});

/**
 * POST /blog-visitors/submit - Soumettre le formulaire visiteur
 */
exports.submitVisitorForm = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, country, blogId, blogTitle, blogSlug, scrollDepth, timeOnPage } = req.body;
  
  // Validation
  if (!firstName || !lastName || !email || !country) {
    return next(new AppError('Tous les champs sont requis', 400));
  }
  
  const ipAddress = getClientIP(req);
  const userAgent = req.headers['user-agent'] || '';
  const deviceInfo = getDeviceInfo(userAgent);
  const locationInfo = await getLocationInfo(ipAddress);
  
  // Générer ou récupérer le sessionId
  let sessionId = req.cookies.sessionId || req.headers['x-session-id'];
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Chercher un visiteur existant par email ou IP
  let visitor = await BlogVisitor.findOne({
    $or: [
      { email: email.toLowerCase() },
      { ipAddress, sessionId }
    ]
  });
  
  if (visitor) {
    // Visiteur existant - mettre à jour
    visitor.firstName = firstName;
    visitor.lastName = lastName;
    visitor.country = country;
    visitor.lastVisitAt = new Date();
    visitor.isReturningVisitor = true;
    
    // Ajouter la visite au blog si fournie
    if (blogId) {
      await visitor.addBlogVisit(blogId, blogTitle, blogSlug, scrollDepth || 0, timeOnPage || 0);
    }
  } else {
    // Nouveau visiteur
    visitor = await BlogVisitor.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      country,
      ipAddress,
      city: locationInfo.city,
      region: locationInfo.region,
      userAgent,
      device: {
        type: deviceInfo.type,
        browser: deviceInfo.browser,
        os: deviceInfo.os
      },
      sessionId,
      source: 'blog_form',
      status: 'active'
    });
    
    // Ajouter la visite au blog si fournie
    if (blogId) {
      await visitor.addBlogVisit(blogId, blogTitle, blogSlug, scrollDepth || 0, timeOnPage || 0);
    }
  }
  
  // Incrémenter les vues du blog si fourni
  if (blogId) {
    const blog = await Blog.findById(blogId);
    if (blog) {
      await blog.incrementViews();
    }
  }
  
  res.status(200).json({
    success: true,
    data: {
      visitor: {
        id: visitor._id,
        firstName: visitor.firstName,
        lastName: visitor.lastName,
        email: visitor.email,
        isReturningVisitor: visitor.isReturningVisitor,
        totalBlogsVisited: visitor.totalBlogsVisited
      }
    }
  });
});

/**
 * GET /blog-visitors/admin - Liste des visiteurs (admin)
 */
exports.getVisitors = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  
  const visitors = await BlogVisitor.find({ status: 'active' })
    .sort('-lastVisitAt')
    .skip(skip)
    .limit(limit)
    .select('-__v');
  
  const total = await BlogVisitor.countDocuments({ status: 'active' });
  
  res.status(200).json({
    success: true,
    data: visitors,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

/**
 * GET /blog-visitors/admin/stats - Statistiques des visiteurs (admin)
 */
exports.getVisitorStats = catchAsync(async (req, res, next) => {
  const stats = await BlogVisitor.getGlobalStats();
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

