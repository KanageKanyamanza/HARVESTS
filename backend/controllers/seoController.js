const catchAsync = require('../utils/catchAsync');
const Product = require('../models/Product');
const Producer = require('../models/Producer');
const Transformer = require('../models/Transformer');
const Restaurateur = require('../models/Restaurateur');
const Transporter = require('../models/Transporter');
const Exporter = require('../models/Exporter');
const Blog = require('../models/Blog');

/**
 * Générer un sitemap XML dynamique
 */
exports.generateSitemap = catchAsync(async (req, res) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://www.harvests.site';
  const currentDate = new Date().toISOString().split('T')[0];

  // Récupérer les données dynamiques
  const [products, producers, transformers, restaurateurs, transporters, exporters, blogs] = await Promise.all([
    Product.find({ isActive: true, status: 'approved' }).select('_id updatedAt').limit(1000),
    Producer.find({ isActive: true }).select('_id updatedAt').limit(500),
    Transformer.find({ isActive: true }).select('_id updatedAt').limit(500),
    Restaurateur.find({ isActive: true }).select('_id updatedAt').limit(500),
    Transporter.find({ isActive: true }).select('_id updatedAt').limit(500),
    Exporter.find({ isActive: true }).select('_id updatedAt').limit(500),
    Blog.find({ status: 'published' }).select('_id updatedAt').limit(500)
  ]);

  // Construire le XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n';

  // Pages statiques
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/products', priority: '0.9', changefreq: 'daily' },
    { url: '/categories', priority: '0.8', changefreq: 'weekly' },
    { url: '/producers', priority: '0.8', changefreq: 'daily' },
    { url: '/transformers', priority: '0.8', changefreq: 'daily' },
    { url: '/restaurateurs', priority: '0.8', changefreq: 'daily' },
    { url: '/transporteurs-exportateurs', priority: '0.7', changefreq: 'weekly' },
    { url: '/about', priority: '0.6', changefreq: 'monthly' },
    { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    { url: '/faq', priority: '0.6', changefreq: 'monthly' },
    { url: '/terms', priority: '0.4', changefreq: 'yearly' },
    { url: '/privacy', priority: '0.4', changefreq: 'yearly' },
    { url: '/pricing', priority: '0.7', changefreq: 'monthly' },
    { url: '/loyalty-program', priority: '0.6', changefreq: 'monthly' },
    { url: '/blog', priority: '0.7', changefreq: 'weekly' }
  ];

  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n\n';
  });

  // Produits
  products.forEach(product => {
    const lastmod = product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : currentDate;
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/products/${product._id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n\n';
  });

  // Producteurs
  producers.forEach(producer => {
    const lastmod = producer.updatedAt ? new Date(producer.updatedAt).toISOString().split('T')[0] : currentDate;
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/producers/${producer._id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n\n';
  });

  // Transformateurs
  transformers.forEach(transformer => {
    const lastmod = transformer.updatedAt ? new Date(transformer.updatedAt).toISOString().split('T')[0] : currentDate;
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/transformers/${transformer._id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n\n';
  });

  // Restaurateurs
  restaurateurs.forEach(restaurateur => {
    const lastmod = restaurateur.updatedAt ? new Date(restaurateur.updatedAt).toISOString().split('T')[0] : currentDate;
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/restaurateurs/${restaurateur._id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n\n';
  });

  // Transporteurs
  transporters.forEach(transporter => {
    const lastmod = transporter.updatedAt ? new Date(transporter.updatedAt).toISOString().split('T')[0] : currentDate;
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/transporteurs/${transporter._id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.6</priority>\n';
    xml += '  </url>\n\n';
  });

  // Exportateurs
  exporters.forEach(exporter => {
    const lastmod = exporter.updatedAt ? new Date(exporter.updatedAt).toISOString().split('T')[0] : currentDate;
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/exportateurs/${exporter._id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.6</priority>\n';
    xml += '  </url>\n\n';
  });

  // Articles de blog
  blogs.forEach(blog => {
    const lastmod = blog.updatedAt ? new Date(blog.updatedAt).toISOString().split('T')[0] : currentDate;
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/blog/${blog._id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.6</priority>\n';
    xml += '  </url>\n\n';
  });

  xml += '</urlset>';

  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

/**
 * Générer un robots.txt dynamique
 */
exports.generateRobots = catchAsync(async (req, res) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://www.harvests.site';
  
  let robots = '# robots.txt pour HARVESTS\n';
  robots += `# ${baseUrl}/robots.txt\n\n`;
  robots += 'User-agent: *\n';
  robots += 'Allow: /\n\n';
  robots += '# Pages à ne pas indexer\n';
  robots += 'Disallow: /api/\n';
  robots += 'Disallow: /admin/\n';
  robots += 'Disallow: /consumer/\n';
  robots += 'Disallow: /producer/\n';
  robots += 'Disallow: /transformer/\n';
  robots += 'Disallow: /restaurateur/\n';
  robots += 'Disallow: /transporter/\n';
  robots += 'Disallow: /exporter/\n';
  robots += 'Disallow: /auth/\n';
  robots += 'Disallow: /checkout\n';
  robots += 'Disallow: /cart\n';
  robots += 'Disallow: /orders/\n';
  robots += 'Disallow: /payments/\n';
  robots += 'Disallow: /settings\n';
  robots += 'Disallow: /notifications\n';
  robots += 'Disallow: /profile\n';
  robots += 'Disallow: /dashboard\n\n';
  robots += '# Autoriser les pages publiques importantes\n';
  robots += 'Allow: /products\n';
  robots += 'Allow: /products/*\n';
  robots += 'Allow: /categories\n';
  robots += 'Allow: /producers\n';
  robots += 'Allow: /producers/*\n';
  robots += 'Allow: /transformers\n';
  robots += 'Allow: /transformers/*\n';
  robots += 'Allow: /restaurateurs\n';
  robots += 'Allow: /restaurateurs/*\n';
  robots += 'Allow: /transporteurs-exportateurs\n';
  robots += 'Allow: /transporteurs/*\n';
  robots += 'Allow: /exportateurs/*\n';
  robots += 'Allow: /about\n';
  robots += 'Allow: /contact\n';
  robots += 'Allow: /faq\n';
  robots += 'Allow: /terms\n';
  robots += 'Allow: /privacy\n';
  robots += 'Allow: /pricing\n';
  robots += 'Allow: /loyalty-program\n';
  robots += 'Allow: /blog\n';
  robots += 'Allow: /blog/*\n\n';
  robots += `# Sitemap\n`;
  robots += `Sitemap: ${baseUrl}/sitemap.xml\n\n`;
  robots += '# Crawl-delay (optionnel, en secondes)\n';
  robots += 'Crawl-delay: 1\n';

  res.set('Content-Type', 'text/plain');
  res.send(robots);
});

