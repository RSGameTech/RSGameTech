import sharp from "sharp";
import { glob } from "glob";
import path from "path";
import fs from "fs";

const SIZES = [
  { name: "small", width: 480, height: 270 },
  { name: "medium", width: 768, height: 432 },
  { name: "large", width: 1200, height: 630 },
];

const SOURCE_DIR = "public/images/blogs";
const OUTPUT_DIR = "public/images/blogs/optimized";

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateResponsiveImages() {
  try {
    // Find all image files in source directory (excluding optimized folder)
    const files = await glob(`${SOURCE_DIR}/*.{jpg,jpeg,png,webp}`, {
      ignore: [`${OUTPUT_DIR}/**`],
    });

    if (files.length === 0) {
      console.log("No source images found in", SOURCE_DIR);
      return;
    }

    console.log(`Found ${files.length} image(s) to optimize...`);

    for (const file of files) {
      const basename = path.parse(file).name;
      const ext = path.parse(file).ext.toLowerCase();

      console.log(`Processing: ${basename}${ext}`);

      for (const size of SIZES) {
        const outputFile = path.join(OUTPUT_DIR, `${basename}.${size.name}${ext}`);

        try {
          await sharp(file)
            .resize(size.width, size.height, {
              fit: "cover",
              position: "center",
            })
            .toFile(outputFile);

          console.log(`  ✓ Generated ${size.name} (${size.width}x${size.height})`);
        } catch (err) {
          console.error(`  ✗ Failed to generate ${size.name}:`, err.message);
        }
      }
    }

    console.log("✓ Image optimization complete!");
  } catch (err) {
    console.error("Error during image optimization:", err);
    process.exit(1);
  }
}

generateResponsiveImages();
