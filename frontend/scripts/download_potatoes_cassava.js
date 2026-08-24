import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cropsDir = path.join(__dirname, '../public/images/crops');

if (!fs.existsSync(cropsDir)) {
  fs.mkdirSync(cropsDir, { recursive: true });
}

const downloads = [
  {
    name: "Pomme de terre",
    url: "https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&w=1200&q=80",
    destJpg: path.join(cropsDir, "pomme-de-terre.jpg"),
    destPng: path.join(cropsDir, "pomme-de-terre.png")
  },
  {
    name: "Manioc",
    url: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=1200&q=80",
    destJpg: path.join(cropsDir, "manioc.jpg"),
    destPng: path.join(cropsDir, "manioc.png")
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
  console.log("Downloading main images for Pomme de terre & Manioc...");
  for (const item of downloads) {
    await downloadFile(item.url, item.destJpg);
    await downloadFile(item.url, item.destPng);
    console.log(`Successfully updated main image for ${item.name}!`);
  }
}

run();
