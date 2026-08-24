import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cropsDir = path.join(__dirname, '../public/images/crops');

// Photo de vraies racines de manioc fraîches avec peau brune et cœur blanc
const maniocUrl = "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=1200&q=80";

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
  console.log("Updating Manioc image with fresh raw cassava roots photo...");
  const destJpg = path.join(cropsDir, "manioc.jpg");
  const destPng = path.join(cropsDir, "manioc.png");
  await downloadFile(maniocUrl, destJpg);
  await downloadFile(maniocUrl, destPng);
  console.log("Manioc image updated successfully!");
}

run();
