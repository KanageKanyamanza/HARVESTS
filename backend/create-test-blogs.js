const mongoose = require('mongoose');
require('dotenv').config();

// Import des modèles
const Blog = require('./models/Blog');
const Admin = require('./models/Admin');

const createTestBlogs = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.DATABASE_URL || process.env.DATABASE || 'mongodb://localhost:27017/harvests', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB');

    // Trouver ou créer un admin pour être l'auteur
    let admin = await Admin.findOne({ role: { $in: ['admin', 'super-admin'] } });
    
    if (!admin) {
      // Créer un admin de test si aucun n'existe
      console.log('ℹ️ Aucun admin trouvé, création d\'un admin de test...');
      admin = await Admin.create({
        firstName: 'Admin',
        lastName: 'Blog',
        email: 'admin@blog.com',
        password: 'Admin123!',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin de test créé:', admin.email);
    } else {
      console.log('✅ Admin trouvé:', admin.email);
    }

    // Vérifier si les blogs existent déjà
    const existingBlogs = await Blog.find({ 
      'slug.fr': { $in: ['lagriculture-durable-au-senegal', 'transformation-alimentaire-locale', 'circuits-courts-agricoles'] }
    });
    
    if (existingBlogs.length > 0) {
      console.log('ℹ️ Certains blogs de test existent déjà');
      console.log('Blogs existants:', existingBlogs.map(b => b.slug?.fr || b._id));
    }

    // Blog 1: Agriculture durable
    const blog1Data = {
      title: {
        fr: 'L\'Agriculture Durable au Sénégal : Défis et Opportunités',
        en: 'Sustainable Agriculture in Senegal: Challenges and Opportunities'
      },
      excerpt: {
        fr: 'Découvrez comment l\'agriculture durable transforme le paysage agricole sénégalais et offre de nouvelles opportunités pour les producteurs locaux.',
        en: 'Discover how sustainable agriculture is transforming the Senegalese agricultural landscape and offering new opportunities for local producers.'
      },
      content: {
        fr: `
          <h2>Introduction</h2>
          <p>L'agriculture durable représente un enjeu majeur pour le Sénégal, pays où l'agriculture emploie plus de 60% de la population active. Face aux défis climatiques et à la nécessité de préserver les ressources naturelles, de nouvelles pratiques émergent.</p>
          
          <h2>Les Défis Actuels</h2>
          <p>Le Sénégal fait face à plusieurs défis agricoles :</p>
          <ul>
            <li>Variabilité climatique et sécheresses récurrentes</li>
            <li>Dégradation des sols</li>
            <li>Accès limité aux intrants de qualité</li>
            <li>Manque d'infrastructures de stockage</li>
          </ul>
          
          <h2>Les Opportunités</h2>
          <p>Malgré ces défis, de nombreuses opportunités s'offrent aux agriculteurs sénégalais :</p>
          <ul>
            <li>Développement de l'agriculture biologique</li>
            <li>Valorisation des produits locaux</li>
            <li>Accès aux marchés internationaux</li>
            <li>Technologies d'irrigation innovantes</li>
          </ul>
          
          <h2>Conclusion</h2>
          <p>L'agriculture durable au Sénégal nécessite une approche intégrée combinant pratiques traditionnelles et innovations modernes. Avec le soutien approprié, les producteurs peuvent améliorer leur productivité tout en préservant l'environnement.</p>
        `,
        en: `
          <h2>Introduction</h2>
          <p>Sustainable agriculture represents a major challenge for Senegal, a country where agriculture employs more than 60% of the active population. Facing climate challenges and the need to preserve natural resources, new practices are emerging.</p>
          
          <h2>Current Challenges</h2>
          <p>Senegal faces several agricultural challenges:</p>
          <ul>
            <li>Climate variability and recurring droughts</li>
            <li>Soil degradation</li>
            <li>Limited access to quality inputs</li>
            <li>Lack of storage infrastructure</li>
          </ul>
          
          <h2>Opportunities</h2>
          <p>Despite these challenges, many opportunities are available to Senegalese farmers:</p>
          <ul>
            <li>Development of organic agriculture</li>
            <li>Valorization of local products</li>
            <li>Access to international markets</li>
            <li>Innovative irrigation technologies</li>
          </ul>
          
          <h2>Conclusion</h2>
          <p>Sustainable agriculture in Senegal requires an integrated approach combining traditional practices and modern innovations. With appropriate support, producers can improve their productivity while preserving the environment.</p>
        `
      },
      type: 'article',
      category: 'strategie',
      tags: ['agriculture', 'durabilité', 'sénégal', 'environnement'],
      status: 'published',
      publishedAt: new Date(),
      author: admin._id,
      metaTitle: {
        fr: 'Agriculture Durable Sénégal - Défis',
        en: 'Sustainable Agriculture Senegal'
      },
      metaDescription: {
        fr: 'Découvrez les défis et opportunités de l\'agriculture durable au Sénégal. Pratiques innovantes et solutions pour les producteurs locaux.',
        en: 'Discover the challenges and opportunities of sustainable agriculture in Senegal. Innovative practices and solutions for local producers.'
      },
      views: 0,
      likes: 0
    };

    // Blog 2: Transformation alimentaire
    const blog2Data = {
      title: {
        fr: 'La Transformation Alimentaire Locale : Un Levier de Développement',
        en: 'Local Food Processing: A Development Lever'
      },
      excerpt: {
        fr: 'Explorez comment la transformation alimentaire locale crée de la valeur ajoutée et génère des emplois dans les communautés rurales sénégalaises.',
        en: 'Explore how local food processing creates added value and generates employment in Senegalese rural communities.'
      },
      content: {
        fr: `
          <h2>La Transformation Alimentaire : Un Secteur en Plein Essor</h2>
          <p>Au Sénégal, la transformation alimentaire locale connaît un développement significatif. Les transformateurs locaux jouent un rôle crucial dans la chaîne de valeur agricole.</p>
          
          <h2>Les Avantages de la Transformation Locale</h2>
          <ul>
            <li><strong>Création d'emplois :</strong> La transformation génère des emplois directs et indirects</li>
            <li><strong>Valorisation des produits :</strong> Les produits transformés ont une valeur ajoutée supérieure</li>
            <li><strong>Réduction du gaspillage :</strong> La transformation permet de conserver les produits excédentaires</li>
            <li><strong>Accès aux marchés :</strong> Les produits transformés sont plus faciles à commercialiser</li>
          </ul>
          
          <h2>Les Défis à Relever</h2>
          <p>Malgré les opportunités, les transformateurs font face à plusieurs défis :</p>
          <ul>
            <li>Accès au financement</li>
            <li>Formation technique</li>
            <li>Normes de qualité et certification</li>
            <li>Accès aux équipements modernes</li>
          </ul>
          
          <h2>Perspectives d'Avenir</h2>
          <p>Avec le soutien des institutions et des partenaires, le secteur de la transformation alimentaire locale peut devenir un pilier de l'économie sénégalaise.</p>
        `,
        en: `
          <h2>Food Processing: A Growing Sector</h2>
          <p>In Senegal, local food processing is experiencing significant development. Local processors play a crucial role in the agricultural value chain.</p>
          
          <h2>Advantages of Local Processing</h2>
          <ul>
            <li><strong>Job creation:</strong> Processing generates direct and indirect employment</li>
            <li><strong>Product valorization:</strong> Processed products have higher added value</li>
            <li><strong>Waste reduction:</strong> Processing allows preservation of surplus products</li>
            <li><strong>Market access:</strong> Processed products are easier to market</li>
          </ul>
          
          <h2>Challenges to Address</h2>
          <p>Despite opportunities, processors face several challenges:</p>
          <ul>
            <li>Access to financing</li>
            <li>Technical training</li>
            <li>Quality standards and certification</li>
            <li>Access to modern equipment</li>
          </ul>
          
          <h2>Future Prospects</h2>
          <p>With support from institutions and partners, the local food processing sector can become a pillar of the Senegalese economy.</p>
        `
      },
      type: 'etude-cas',
      category: 'operations',
      tags: ['transformation', 'alimentaire', 'développement', 'emploi'],
      status: 'published',
      publishedAt: new Date(),
      author: admin._id,
      metaTitle: {
        fr: 'Transformation Alimentaire Locale',
        en: 'Local Food Processing Senegal'
      },
      metaDescription: {
        fr: 'Découvrez comment la transformation alimentaire locale crée de la valeur et génère des emplois au Sénégal.',
        en: 'Discover how local food processing creates value and generates employment in Senegal.'
      },
      views: 0,
      likes: 0
    };

    // Blog 3: Circuits courts
    const blog3Data = {
      title: {
        fr: 'Les Circuits Courts Agricoles : Connecter Producteurs et Consommateurs',
        en: 'Short Agricultural Supply Chains: Connecting Producers and Consumers'
      },
      excerpt: {
        fr: 'Comprenez l\'importance des circuits courts pour rapprocher les producteurs des consommateurs et créer une économie locale plus résiliente.',
        en: 'Understand the importance of short supply chains to bring producers closer to consumers and create a more resilient local economy.'
      },
      content: {
        fr: `
          <h2>Qu'est-ce qu'un Circuit Court ?</h2>
          <p>Un circuit court est un mode de commercialisation des produits agricoles qui s'exerce soit par la vente directe du producteur au consommateur, soit par la vente indirecte à condition qu'il n'y ait qu'un seul intermédiaire.</p>
          
          <h2>Les Bénéfices des Circuits Courts</h2>
          <h3>Pour les Producteurs</h3>
          <ul>
            <li>Meilleure rémunération</li>
            <li>Contact direct avec les consommateurs</li>
            <li>Valorisation de leur travail</li>
            <li>Planification de la production facilitée</li>
          </ul>
          
          <h3>Pour les Consommateurs</h3>
          <ul>
            <li>Produits frais et de qualité</li>
            <li>Traçabilité garantie</li>
            <li>Prix souvent compétitifs</li>
            <li>Relation de confiance avec le producteur</li>
          </ul>
          
          <h2>Les Plateformes Numériques</h2>
          <p>Les plateformes numériques comme HARVESTS facilitent la mise en relation entre producteurs et consommateurs, rendant les circuits courts plus accessibles.</p>
          
          <h2>Conclusion</h2>
          <p>Les circuits courts représentent une solution durable pour renforcer l'économie locale et améliorer la qualité de vie des producteurs et consommateurs.</p>
        `,
        en: `
          <h2>What is a Short Supply Chain?</h2>
          <p>A short supply chain is a mode of marketing agricultural products that operates either through direct sale from producer to consumer, or through indirect sale provided there is only one intermediary.</p>
          
          <h2>Benefits of Short Supply Chains</h2>
          <h3>For Producers</h3>
          <ul>
            <li>Better remuneration</li>
            <li>Direct contact with consumers</li>
            <li>Recognition of their work</li>
            <li>Easier production planning</li>
          </ul>
          
          <h3>For Consumers</h3>
          <ul>
            <li>Fresh and quality products</li>
            <li>Guaranteed traceability</li>
            <li>Often competitive prices</li>
            <li>Trust relationship with the producer</li>
          </ul>
          
          <h2>Digital Platforms</h2>
          <p>Digital platforms like HARVESTS facilitate connections between producers and consumers, making short supply chains more accessible.</p>
          
          <h2>Conclusion</h2>
          <p>Short supply chains represent a sustainable solution to strengthen the local economy and improve the quality of life for producers and consumers.</p>
        `
      },
      type: 'article',
      category: 'marketing',
      tags: ['circuits-courts', 'commerce', 'local', 'consommation'],
      status: 'published',
      publishedAt: new Date(),
      author: admin._id,
      metaTitle: {
        fr: 'Circuits Courts Agricoles',
        en: 'Short Agricultural Supply Chains'
      },
      metaDescription: {
        fr: 'Découvrez comment les circuits courts connectent producteurs et consommateurs au Sénégal.',
        en: 'Discover how short supply chains connect producers and consumers in Senegal.'
      },
      views: 0,
      likes: 0
    };

    // Créer les blogs
    const blogs = [blog1Data, blog2Data, blog3Data];
    const createdBlogs = [];

    for (let i = 0; i < blogs.length; i++) {
      const blogData = blogs[i];
      
      // Vérifier si le blog existe déjà
      const existingBlog = await Blog.findOne({ 
        'slug.fr': blogData.slug?.fr || `blog-${i + 1}`
      });
      
      if (existingBlog) {
        console.log(`ℹ️ Blog ${i + 1} existe déjà: ${existingBlog.slug?.fr || existingBlog._id}`);
        createdBlogs.push(existingBlog);
      } else {
        const blog = await Blog.create(blogData);
        createdBlogs.push(blog);
        console.log(`✅ Blog ${i + 1} créé: ${blog.slug?.fr || blog._id}`);
      }
    }

    console.log('\n✅ Résumé:');
    console.log(`- ${createdBlogs.length} blog(s) disponible(s)`);
    createdBlogs.forEach((blog, index) => {
      console.log(`  ${index + 1}. ${blog.title?.fr || blog.title?.en || 'Sans titre'}`);
      console.log(`     Slug FR: ${blog.slug?.fr || 'N/A'}`);
      console.log(`     Type: ${blog.type}`);
      console.log(`     Catégorie: ${blog.category || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création des blogs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
};

createTestBlogs();

