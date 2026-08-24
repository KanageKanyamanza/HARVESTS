import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tomateDir = path.join(__dirname, '../public/images/tomate');
const cropsDir = path.join(__dirname, '../public/images/crops');

[tomateDir, cropsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const downloads = [
  // Hero Image
  {
    name: "Hero Tomate",
    url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80",
    destJpg: path.join(tomateDir, "hero.jpg"),
    destCrop: path.join(cropsDir, "tomate.png")
  },
  // Stage 1: Pépinière & Semis
  {
    name: "Pépinière & Semis",
    url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
    destJpg: path.join(tomateDir, "stage_semis.jpg")
  },
  // Stage 2: Repiquage & Croissance tuteurée
  {
    name: "Repiquage & Tuteurage",
    url: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80",
    destJpg: path.join(tomateDir, "stage_croissance.jpg")
  },
  // Stage 3: Floraison & Fructification (Fleurs & Fruits verts)
  {
    name: "Floraison & Fruits verts",
    url: "https://images.unsplash.com/photo-1596196507371-209028882583?auto=format&fit=crop&w=800&q=80",
    destJpg: path.join(tomateDir, "stage_floraison.jpg")
  },
  // Stage 4: Récolte de tomates rouges mûres
  {
    name: "Récolte de tomates mûres",
    url: "https://images.unsplash.com/photo-1576181256399-83563454b679?auto=format&fit=crop&w=800&q=80",
    destJpg: path.join(tomateDir, "stage_recolte.jpg")
  },
  // Equipment 1: Tuteurs en bois/bambou
  {
    name: "Tuteurs en bois/bambou",
    url: "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=800&q=80",
    destJpg: path.join(tomateDir, "equip_tuteurs.jpg")
  },
  // Equipment 2: Goutte-à-goutte
  {
    name: "Système Goutte-à-goutte",
    url: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80",
    destJpg: path.join(tomateDir, "equip_goutte.jpg")
  },
  // Equipment 3: Pulvérisateur à dos
  {
    name: "Pulvérisateur à dos",
    url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80",
    destJpg: path.join(tomateDir, "equip_pulverisateur.jpg")
  },
  // Equipment 4: Houe & Daba
  {
    name: "Houe & Daba",
    url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
    destJpg: path.join(tomateDir, "equip_daba.jpg")
  }
];

const downloadFile = (url, dest) => {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (redirectResp) => {
          redirectResp.pipe(file);
          file.on('finish', () => { file.close(); resolve(true); });
        });
      } else {
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(true); });
      }
    }).on('error', (err) => {
      console.error(`Error downloading ${url}:`, err.message);
      resolve(false);
    });
  });
};

async function run() {
  console.log("Starting Tomato specific images download...");
  for (const item of downloads) {
    await downloadFile(item.url, item.destJpg);
    if (item.destCrop) {
      await downloadFile(item.url, item.destCrop);
    }
    console.log(`Downloaded: ${item.name}`);
  }
  console.log("All Tomato specific images downloaded successfully!");
}

run();
