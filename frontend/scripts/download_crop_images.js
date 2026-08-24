import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cropsDir = path.join(__dirname, '../public/images/crops');
const stagesDir = path.join(__dirname, '../public/images/stages');
const equipDir = path.join(__dirname, '../public/images/equipment');

[cropsDir, stagesDir, equipDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const downloads = [
  // Crops
  { url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80", dest: path.join(cropsDir, "pomme-de-terre.jpg") },
  { url: "https://images.unsplash.com/photo-1567016507665-356928ac6679?auto=format&fit=crop&w=800&q=80", dest: path.join(cropsDir, "arachide.jpg") },
  { url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80", dest: path.join(cropsDir, "igname.jpg") },
  { url: "https://images.unsplash.com/photo-1588252303782-7ee9a3d46337?auto=format&fit=crop&w=800&q=80", dest: path.join(cropsDir, "piment.jpg") },
  { url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80", dest: path.join(cropsDir, "aubergine.jpg") },
  { url: "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=800&q=80", dest: path.join(cropsDir, "gombo.jpg") },
  { url: "https://images.unsplash.com/photo-1598170845058-12db4576905b?auto=format&fit=crop&w=800&q=80", dest: path.join(cropsDir, "chou.jpg") },
  { url: "https://images.unsplash.com/photo-1447175008436-08417142ea96?auto=format&fit=crop&w=800&q=80", dest: path.join(cropsDir, "carotte.jpg") },
  { url: "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=800&q=80", dest: path.join(cropsDir, "haricot-vert.jpg") },
  { url: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=800&q=80", dest: path.join(cropsDir, "banane.jpg") },
  { url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80", dest: path.join(cropsDir, "mangue.jpg") },
  { url: "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?auto=format&fit=crop&w=800&q=80", dest: path.join(cropsDir, "papaye.jpg") },
  { url: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80", dest: path.join(cropsDir, "pasteque.jpg") },
  { url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80", dest: path.join(cropsDir, "niebe.jpg") },

  // Stages
  { url: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80", dest: path.join(stagesDir, "semis_pepiniere.jpg") },
  { url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80", dest: path.join(stagesDir, "croissance_vegetative.jpg") },
  { url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80", dest: path.join(stagesDir, "floraison_fructification.jpg") },
  { url: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=800&q=80", dest: path.join(stagesDir, "recolte_maturite.jpg") },

  // Equipment
  { url: "https://images.unsplash.com/photo-1530267981675-7ab3f16787c8?auto=format&fit=crop&w=800&q=80", dest: path.join(equipDir, "tracteur_motoculteur.jpg") },
  { url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80", dest: path.join(equipDir, "daba_outils.jpg") },
  { url: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80", dest: path.join(equipDir, "irrigation_goutte.jpg") },
  { url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80", dest: path.join(equipDir, "pulverisateur.jpg") },
  { url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80", dest: path.join(equipDir, "semoir_charrue.jpg") },
  { url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80", dest: path.join(equipDir, "moissonneuse_batteuse.jpg") }
];

const downloadFile = (item) => {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(item.dest);
    https.get(item.url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (redirectResp) => {
          redirectResp.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        });
      } else {
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', (err) => {
      console.error(`Error downloading ${item.url}:`, err.message);
      resolve();
    });
  });
};

async function run() {
  console.log("Starting image downloads...");
  for (const item of downloads) {
    await downloadFile(item);
    console.log(`Downloaded ${path.basename(item.dest)}`);
  }
  console.log("All image downloads completed!");
}

run();
