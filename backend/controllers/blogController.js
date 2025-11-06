const Blog = require('../models/Blog');
const BlogVisit = require('../models/BlogVisit');
const Admin = require('../models/Admin');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { analyzeDevice, extractReferrerDomain, extractUTMParameters, generateSessionId, isBounce } = require('../utils/deviceAnalyzer');
const { getClientIP, getDeviceInfo, getLocationInfo } = require('../utils/visitorUtils');

// ROUTES PUBLIQUES

/**
 * GET /blogs - Liste des blogs publiés
 */
exports.getBlogs = catchAsync(async (req, res, next) => {
  const language = req.language || 'fr';
  
  // Construction de la requête
  const queryObj = { status: 'published' };
  
  // Filtres
  if (req.query.type) queryObj.type = req.query.type;
  if (req.query.category) queryObj.category = req.query.category;
  if (req.query.tag) queryObj.tags = req.query.tag;
  
  // Recherche textuelle
  if (req.query.search) {
    const searchTerm = req.query.search.trim();
    queryObj.$or = [
      { [`title.${language}`]: { $regex: searchTerm, $options: 'i' } },
      { [`content.${language}`]: { $regex: searchTerm, $options: 'i' } },
      { [`excerpt.${language}`]: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ];
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Tri
  let sortBy = '-publishedAt';
  if (req.query.sort) {
    const sortOptions = {
      'publishedAt': '-publishedAt',
      'views': '-views',
      'likes': '-likes',
      'title': `title.${language}`
    };
    sortBy = sortOptions[req.query.sort] || sortBy;
  }
  
  // Requête
  const blogs = await Blog.find(queryObj)
    .populate('author', 'firstName lastName email')
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(`title.${language} slug.${language} excerpt.${language} type category tags featuredImage author views likes publishedAt createdAt`);
  
  const total = await Blog.countDocuments(queryObj);
  
  // Localiser les données
  const localizedBlogs = blogs.map(blog => ({
    ...blog.toObject(),
    title: blog.getTitle(language),
    slug: blog.getSlug(language),
    excerpt: blog.getExcerpt(language)
  }));
  
  res.status(200).json({
    success: true,
    data: localizedBlogs,
    language,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

/**
 * GET /blogs/:slug - Détail d'un blog
 */
exports.getBlogBySlug = catchAsync(async (req, res, next) => {
  const language = req.language || 'fr';
  const slug = req.params.slug;
  
  // Trouver le blog par slug
  const blog = await Blog.findOne({ [`slug.${language}`]: slug })
    .populate('author', 'firstName lastName email');
  
  if (!blog) {
    return next(new AppError('Blog non trouvé', 404));
  }
  
  // Vérifier le statut (permettre aux admins de voir les brouillons)
  const isAdmin = req.admin || (req.user && req.user.role === 'admin');
  if (blog.status !== 'published' && !isAdmin) {
    return next(new AppError('Blog non publié', 404));
  }
  
  // Créer un enregistrement de visite
  const ipAddress = getClientIP(req);
  const userAgent = req.headers['user-agent'] || '';
  const deviceInfo = getDeviceInfo(userAgent);
  const locationInfo = await getLocationInfo(ipAddress);
  
  // Extraire le référent et les UTM
  const referrer = req.headers.referer || req.headers.referrer || '';
  const referrerDomain = extractReferrerDomain(referrer);
  const utmParams = extractUTMParameters(req.url);
  
  // Générer ou récupérer le sessionId
  let sessionId = req.cookies.sessionId || req.headers['x-session-id'];
  if (!sessionId) {
    sessionId = generateSessionId();
    res.cookie('sessionId', sessionId, {
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }
  
  // Créer la visite
  const visit = await BlogVisit.create({
    blog: blog._id,
    user: req.admin ? req.admin._id : (req.user ? req.user._id : null),
    sessionId,
    ipAddress,
    country: locationInfo.country,
    region: locationInfo.region,
    city: locationInfo.city,
    userAgent,
    device: deviceInfo,
    referrer,
    referrerDomain,
    ...utmParams,
    pageTitle: blog.getTitle(language),
    pageUrl: req.originalUrl
  });
  
  // Incrémenter les vues
  await blog.incrementViews();
  
  // Localiser les données
  const localizedBlog = {
    ...blog.toObject(),
    ...blog.getLocalizedContent(language),
    images: blog.images || []
  };
  
  res.status(200).json({
    success: true,
    data: localizedBlog,
    language,
    visitId: visit._id.toString()
  });
});

/**
 * POST /blogs/:id/like - Liker un blog
 */
exports.likeBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    return next(new AppError('Blog non trouvé', 404));
  }
  
  await blog.incrementLikes();
  
  res.status(200).json({
    success: true,
    data: {
      likes: blog.likes
    }
  });
});

/**
 * POST /blogs/track - Mettre à jour le tracking
 */
exports.trackVisit = catchAsync(async (req, res, next) => {
  const { visitId, timeOnPage, scrollDepth, action } = req.body;
  
  if (!visitId) {
    return next(new AppError('visitId requis', 400));
  }
  
  const visit = await BlogVisit.findById(visitId);
  
  if (!visit) {
    return next(new AppError('Visite non trouvée', 404));
  }
  
  // Mettre à jour les métriques
  if (timeOnPage !== undefined) visit.timeOnPage = timeOnPage;
  if (scrollDepth !== undefined) visit.scrollDepth = scrollDepth;
  
  // Gérer les actions
  if (action === 'leave') {
    await visit.markAsCompleted();
  } else if (action === 'bounce') {
    await visit.markAsBounced();
  } else {
    // Mise à jour simple
    visit.isBounce = isBounce(visit);
    await visit.save();
  }
  
  res.status(200).json({
    success: true,
    data: {
      visit: {
        timeOnPage: visit.timeOnPage,
        scrollDepth: visit.scrollDepth,
        isBounce: visit.isBounce,
        status: visit.status
      }
    }
  });
});

// ROUTES ADMIN

/**
 * GET /blogs/admin/blogs - Liste tous les blogs (admin)
 */
exports.getAllBlogsAdmin = catchAsync(async (req, res, next) => {
  const language = req.language || 'fr';
  const queryObj = {};
  
  // Filtres
  if (req.query.status) queryObj.status = req.query.status;
  if (req.query.type) queryObj.type = req.query.type;
  if (req.query.category) queryObj.category = req.query.category;
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  
  const blogs = await Blog.find(queryObj)
    .populate('author', 'firstName lastName email')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);
  
  const total = await Blog.countDocuments(queryObj);
  
  res.status(200).json({
    success: true,
    data: blogs,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

/**
 * GET /blogs/admin/blogs/:id - Détail d'un blog (admin)
 */
exports.getBlogAdmin = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id)
    .populate('author', 'firstName lastName email');
  
  if (!blog) {
    return next(new AppError('Blog non trouvé', 404));
  }
  
  res.status(200).json({
    success: true,
    data: blog
  });
});

/**
 * POST /blogs/admin/blogs - Créer un blog
 */
exports.createBlog = catchAsync(async (req, res, next) => {
  // Validation : au moins un titre requis
  if (!req.body.title?.fr && !req.body.title?.en) {
    return next(new AppError('Au moins un titre (FR ou EN) est requis', 400));
  }
  
  // Validation : au moins un contenu requis
  if (!req.body.content?.fr && !req.body.content?.en) {
    return next(new AppError('Au moins un contenu (FR ou EN) est requis', 400));
  }
  
  // Ajouter l'auteur (req.admin est défini par adminAuthController.protect)
  req.body.author = req.admin._id;
  
  // Définir publishedAt si status est published
  if (req.body.status === 'published' && !req.body.publishedAt) {
    req.body.publishedAt = new Date();
  }
  
  const blog = await Blog.create(req.body);
  
  res.status(201).json({
    success: true,
    data: blog
  });
});

/**
 * PUT /blogs/admin/blogs/:id - Mettre à jour un blog
 */
exports.updateBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    return next(new AppError('Blog non trouvé', 404));
  }
  
  // Mettre à jour
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      blog[key] = req.body[key];
    }
  });
  
  // Définir publishedAt si status passe à published
  if (blog.status === 'published' && !blog.publishedAt) {
    blog.publishedAt = new Date();
  }
  
  await blog.save();
  
  res.status(200).json({
    success: true,
    data: blog
  });
});

/**
 * DELETE /blogs/admin/blogs/:id - Supprimer un blog
 */
exports.deleteBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  
  if (!blog) {
    return next(new AppError('Blog non trouvé', 404));
  }
  
  // Supprimer aussi les visites associées
  await BlogVisit.deleteMany({ blog: blog._id });
  
  res.status(200).json({
    success: true,
    message: 'Blog supprimé avec succès'
  });
});

/**
 * GET /blogs/admin/stats - Statistiques globales
 */
exports.getStats = catchAsync(async (req, res, next) => {
  const total = await Blog.countDocuments();
  const published = await Blog.countDocuments({ status: 'published' });
  const draft = await Blog.countDocuments({ status: 'draft' });
  
  // Statistiques par type
  const byType = await Blog.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);
  
  // Statistiques par catégorie
  const byCategory = await Blog.aggregate([
    { $match: { category: { $exists: true } } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  // Total des vues et likes
  const stats = await Blog.aggregate([
    {
      $group: {
        _id: null,
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' }
      }
    }
  ]);
  
  // Statistiques de tracking
  const totalVisits = await BlogVisit.countDocuments();
  const uniqueVisitors = await BlogVisit.distinct('sessionId').then(ids => ids.length);
  
  const deviceBreakdown = await BlogVisit.aggregate([
    { $group: { _id: '$device.type', count: { $sum: 1 } } }
  ]);
  
  const topCountries = await BlogVisit.aggregate([
    { $match: { country: { $exists: true, $ne: 'Unknown' } } },
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  const topReferrers = await BlogVisit.aggregate([
    { $match: { referrerDomain: { $exists: true } } },
    { $group: { _id: '$referrerDomain', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      total,
      published,
      draft,
      byType,
      byCategory,
      totalViews: stats[0]?.totalViews || 0,
      totalLikes: stats[0]?.totalLikes || 0,
      tracking: {
        totalVisits,
        uniqueVisitors,
        deviceBreakdown,
        topCountries,
        topReferrers
      }
    }
  });
});

/**
 * GET /blogs/admin/blogs/:id/visits - Visites d'un blog
 */
exports.getBlogVisits = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  
  const visits = await BlogVisit.find({ blog: req.params.id })
    .sort('-visitedAt')
    .skip(skip)
    .limit(limit);
  
  const total = await BlogVisit.countDocuments({ blog: req.params.id });
  
  res.status(200).json({
    success: true,
    data: visits,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

/**
 * GET /blogs/admin/visits - Toutes les visites
 */
exports.getAllVisits = catchAsync(async (req, res, next) => {
  const queryObj = {};
  
  if (req.query.blogId) queryObj.blog = req.query.blogId;
  if (req.query.country) queryObj.country = req.query.country;
  if (req.query.deviceType) queryObj['device.type'] = req.query.deviceType;
  
  if (req.query.dateFrom || req.query.dateTo) {
    queryObj.visitedAt = {};
    if (req.query.dateFrom) queryObj.visitedAt.$gte = new Date(req.query.dateFrom);
    if (req.query.dateTo) queryObj.visitedAt.$lte = new Date(req.query.dateTo);
  }
  
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  
  const visits = await BlogVisit.find(queryObj)
    .populate('blog', 'title')
    .sort('-visitedAt')
    .skip(skip)
    .limit(limit);
  
  const total = await BlogVisit.countDocuments(queryObj);
  
  res.status(200).json({
    success: true,
    data: visits,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

/**
 * POST /blogs/translate - Traduction automatique
 */
exports.translateText = catchAsync(async (req, res, next) => {
  const { text, fromLang, toLang } = req.body;
  
  if (!text || !fromLang || !toLang) {
    return next(new AppError('Texte, langue source et langue cible requis', 400));
  }
  
  if (fromLang === toLang) {
    return res.status(200).json({
      success: true,
      data: {
        translatedText: text
      }
    });
  }
  
  try {
    // Essayer MyMemory en premier
    const axios = require('axios');
    try {
      const response = await axios.get(`https://api.mymemory.translated.net/get`, {
        params: {
          q: text,
          langpair: `${fromLang}|${toLang}`
        },
        timeout: 5000
      });
      
      if (response.data && response.data.responseData && response.data.responseData.translatedText) {
        return res.status(200).json({
          success: true,
          data: {
            translatedText: response.data.responseData.translatedText
          }
        });
      }
    } catch (mymemoryError) {
      console.log('MyMemory failed, trying LibreTranslate...');
    }
    
    // Fallback vers LibreTranslate
    try {
      const response = await axios.post('https://libretranslate.de/translate', {
        q: text,
        source: fromLang,
        target: toLang,
        format: 'text'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      if (response.data && response.data.translatedText) {
        return res.status(200).json({
          success: true,
          data: {
            translatedText: response.data.translatedText
          }
        });
      }
    } catch (libreError) {
      console.error('LibreTranslate failed:', libreError.message);
    }
    
    // Si les deux services échouent, retourner le texte original
    return res.status(200).json({
      success: true,
      data: {
        translatedText: text,
        warning: 'Traduction non disponible, texte original retourné'
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la traduction:', error);
    return res.status(200).json({
      success: true,
      data: {
        translatedText: text,
        warning: 'Erreur de traduction, texte original retourné'
      }
    });
  }
});

