#!/usr/bin/env node
import fs from "fs";
import { extractModels, parseSchema } from "./prisma-parser";
import { generateFiles } from "./file-generator";

// Helper function to convert string to kebab-case
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

// Configuration
const SCHEMA_PATH = "./prisma/schema.prisma";
const OUTPUT_BASE_PATH = "./src/app/saas/(private)";

// Function to prompt user for input
async function prompt(question: string): Promise<string> {
  const { createInterface } = await import("readline");

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Main function
async function main() {
  try {
    console.log("\n🚀 Next.js CRUD+L Scaffolding Generator 🚀\n");

    // Check if schema file exists
    if (!fs.existsSync(SCHEMA_PATH)) {
      console.error(`❌ Prisma schema not found at ${SCHEMA_PATH}`);
      console.log("Make sure you have initialized Prisma in your project.");
      process.exit(1);
    }

    // 1. Read the Prisma schema
    console.log("📝 Reading Prisma schema...");
    const schemaContent = fs.readFileSync(SCHEMA_PATH, "utf8");

    // 2. Parse schema and extract models
    console.log("🔍 Analyzing schema...");
    const parsedSchema = parseSchema(schemaContent);
    const models = extractModels(parsedSchema);

    if (models.length === 0) {
      console.error("❌ No models found in schema");
      console.log("Make sure your schema contains at least one model definition.");
      process.exit(1);
    }

    // 3. Prompt user to select a model
    console.log("\n📋 Available models:");
    models.forEach((model, index) => {
      console.log(`  ${index + 1}. ${model.name} (${model.fields.length} fields)`);
    });
    console.log("");

    // Get user selection
    const selection = await prompt("Enter the number of the model to scaffold: ");
    const modelIndex = parseInt(selection, 10) - 1;

    if (isNaN(modelIndex) || modelIndex < 0 || modelIndex >= models.length) {
      console.error("❌ Invalid selection");
      process.exit(1);
    }

    const selectedModel = models[modelIndex];

    // Confirm with user
    console.log(`\n📊 Selected model: ${selectedModel.name}`);
    console.log("Fields:");
    selectedModel.fields.forEach((field) => {
      console.log(`  - ${field.name} (${field.type}${field.isRequired ? ", required" : ""})`);
    });

    const confirm = await prompt("\nGenerate scaffolding for this model? (y/n): ");

    if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
      console.log("❌ Operation cancelled");
      process.exit(0);
    }

    // Ask for output base path
    const customPath = await prompt(`\nOutput directory (default: ${OUTPUT_BASE_PATH}): `);
    const outputPath = customPath.trim() || OUTPUT_BASE_PATH;

    console.log("\n🛠️ Generating scaffolding...");

    // 4. Generate files for the selected model
    generateFiles(selectedModel, outputPath);

    console.log("\n✅ Scaffolding completed successfully!");
    console.log(`\nNavigate to ${outputPath}/${toKebabCase(selectedModel.name)} to see your generated files.`);
    console.log("Happy coding! 🎉");
  } catch (error) {
    console.error("\n❌ Error generating scaffolding:", error);
    process.exit(1);
  }
}

// Run the main function
main();
