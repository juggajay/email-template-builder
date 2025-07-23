/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zebamail.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [
    '/api/*',
    '/auth/*',
    '/editor',
    '/my-templates',
    '/settings/*',
    '/admin/*',
    '/test/*',
    '/404',
    '/500',
  ],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://www.zebamail.com/sitemap.xml',
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/admin/',
          '/settings/',
          '/my-templates/',
        ],
      },
    ],
  },
  transform: async (config, path) => {
    // Custom priority for different pages
    const priorityMap = {
      '/': 1.0,
      '/pricing': 0.9,
      '/templates': 0.8,
      '/features': 0.8,
      '/blog': 0.7,
    };
    
    const customPriority = priorityMap[path] || 0.7;
    
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: customPriority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};