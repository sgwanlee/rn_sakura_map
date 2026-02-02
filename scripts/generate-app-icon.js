#!/usr/bin/env node

/**
 * App Icon Generator Script
 * Uses OpenAI GPT Image 1 model to generate app icons
 *
 * Usage:
 *   node scripts/generate-app-icon.js --prompt "your prompt" --style flat --background auto
 *
 * Options:
 *   --prompt, -p     Image generation prompt (required)
 *   --style, -s      Style preset: flat, 3d, gradient, minimalist, cartoon, corporate (default: flat)
 *   --background, -b Background option: auto, transparent (default: auto)
 *   --output, -o     Output directory (default: assets)
 */

const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

// Load .env file from project root
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=");
        if (key && value && !process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

// Load env at startup
loadEnv();

// Style presets with detailed prompts
const STYLE_PRESETS = {
  flat: {
    name: "Flat Design",
    description: "Clean geometric shapes, solid colors, minimal shadows",
    prompt:
      "flat design style, clean geometric shapes, solid colors, minimal shadows, modern UI icon aesthetic",
  },
  "3d": {
    name: "3D Realistic",
    description: "Lighting and shadows, glossy finish, depth",
    prompt:
      "3D realistic style, professional lighting, subtle shadows, glossy finish, depth and dimension, high quality render",
  },
  gradient: {
    name: "Gradient",
    description: "Smooth color transitions, vibrant gradients",
    prompt:
      "gradient style, smooth color transitions, vibrant gradient colors, modern app icon aesthetic, seamless color blending",
  },
  minimalist: {
    name: "Minimalist",
    description: "Simple forms, maximum whitespace, essential elements only",
    prompt:
      "minimalist style, simple geometric forms, maximum whitespace, essential elements only, clean and elegant",
  },
  cartoon: {
    name: "Cartoon/Fun",
    description: "Cartoon style, bright colors, playful design",
    prompt:
      "cartoon style, fun and playful design, bright vibrant colors, friendly appearance, illustrated look",
  },
  corporate: {
    name: "Corporate/Professional",
    description: "Business-oriented, trustworthy, professional look",
    prompt:
      "corporate professional style, trustworthy business aesthetic, clean and refined, sophisticated color palette",
  },
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    prompt: null,
    style: "flat",
    background: "auto",
    output: "assets",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "--prompt":
      case "-p":
        options.prompt = nextArg;
        i++;
        break;
      case "--style":
      case "-s":
        options.style = nextArg;
        i++;
        break;
      case "--background":
      case "-b":
        options.background = nextArg;
        i++;
        break;
      case "--output":
      case "-o":
        options.output = nextArg;
        i++;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
App Icon Generator - Generate app icons using OpenAI GPT Image 1

Usage:
  node scripts/generate-app-icon.js --prompt "your prompt" [options]

Options:
  --prompt, -p     Image generation prompt (required)
  --style, -s      Style preset (default: flat)
  --background, -b Background option: auto, transparent (default: auto)
  --output, -o     Output directory (default: assets)
  --help, -h       Show this help message

Available Styles:
${Object.entries(STYLE_PRESETS)
  .map(([key, value]) => `  ${key.padEnd(12)} - ${value.description}`)
  .join("\n")}

Examples:
  node scripts/generate-app-icon.js -p "travel app with airplane and globe" -s gradient
  node scripts/generate-app-icon.js --prompt "fitness app dumbbell icon" --style 3d --background transparent

API Key:
  Reads OPENAI_API_KEY or OPEN_API_KEY from .env file in project root
`);
}

function validateOptions(options) {
  if (!options.prompt) {
    console.error("Error: --prompt is required");
    console.log('Use --help for usage information');
    process.exit(1);
  }

  if (!STYLE_PRESETS[options.style]) {
    console.error(`Error: Invalid style "${options.style}"`);
    console.log("Available styles:", Object.keys(STYLE_PRESETS).join(", "));
    process.exit(1);
  }

  if (!["auto", "transparent"].includes(options.background)) {
    console.error(`Error: Invalid background "${options.background}"`);
    console.log("Available options: auto, transparent");
    process.exit(1);
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY;
  if (!apiKey) {
    console.error("Error: OPENAI_API_KEY or OPEN_API_KEY is required in .env file");
    process.exit(1);
  }
}

async function generateIcon(options) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey,
  });

  const stylePreset = STYLE_PRESETS[options.style];

  // Build the full prompt
  const fullPrompt = `${options.prompt}.
Style: ${stylePreset.prompt}.
Requirements: Square format, centered design, high quality, professional finish, no text unless specifically requested.`;

  console.log("\n--- App Icon Generator ---");
  console.log(`Style: ${stylePreset.name}`);
  console.log(`Background: ${options.background}`);
  console.log(`Prompt: ${options.prompt}`);
  console.log("\nGenerating icon...\n");

  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      background: options.background,
    });

    // Get the base64 image data
    const imageData = response.data[0].b64_json;

    if (!imageData) {
      throw new Error("No image data received from API");
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageData, "base64");

    // Ensure output directory exists
    const outputDir = path.resolve(process.cwd(), options.output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save files
    const files = ["icon.png"];

    for (const filename of files) {
      const filePath = path.join(outputDir, filename);
      fs.writeFileSync(filePath, imageBuffer);
      console.log(`Saved: ${filePath}`);
    }

    console.log("\nIcon generation complete!");
    console.log("\nGenerated files:");
    files.forEach((f) => console.log(`  - ${options.output}/${f}`));
    console.log("\nNote: favicon.png needs to be created separately (16x16 or 32x32 size)");

    return true;
  } catch (error) {
    console.error("\nError generating icon:");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data?.error?.message || error.message}`);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Main execution
async function main() {
  const options = parseArgs();
  validateOptions(options);
  await generateIcon(options);
}

main();
