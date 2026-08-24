import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cropsDir = path.join(__dirname, '../public/images/crops');

const downloads = [
  {
    name: "Arachide",
    url: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80",
    destJpg: path.join(cropsDir, "arachide.jpg"),
    destPng: path.join(cropsDir, "arachide.png")
  },
  {
    name: "Riz",
    url: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&w=800&q=80",
    destJpg: path.join(cropsDir, "riz.jpg"),
    destPng: path.join(cropsDir, "riz.png")
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
  console.log("Downloading correct images for Arachide and Riz...");
  for (const item of downloads) {
    await downloadFile(item.url, item.destJpg);
    await downloadFile(item.url, item.destPng);
    console.log(`Successfully updated ${item.name} images!`);
  }
}

run();
