const Blog = require('../../models/Blog');
const BlogVisit = require('../../models/BlogVisit');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { extractReferrerDomain, extractUTMParameters, generateSessionId, isBounce } = require('../../utils/deviceAnalyzer');
const { getClientIP, getDeviceInfo, getLocationInfo } = require('../../utils/visitorUtils');

// Liste des blogs publiés
exports.getBlogs = catchAsync(async (req, res, next) => {
  const language = req.language || 'fr';
  
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

// Détail d'un blog
exports.getBlogBySlug = catchAsync(async (req, res, next) => {
  const language = req.language || 'fr';
  const slug = req.params.slug;
  
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
  
  const referrer = req.headers.referer || req.headers.referrer || '';
  const referrerDomain = extractReferrerDomain(referrer);
  const utmParams = extractUTMParameters(req.url);
  
  let sessionId = req.cookies.sessionId || req.headers['x-session-id'];
  if (!sessionId) {
    sessionId = generateSessionId();
    res.cookie('sessionId', sessionId, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }
  
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

// Liker un blog
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

// Mettre à jour le tracking
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

