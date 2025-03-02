import fs from "fs";
import path from "path";
import { Model } from "./prisma-parser";

// Helper functions
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFileIfNotExists(filePath: string, content: string) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Created: ${filePath}`);
  } else {
    console.log(`File already exists: ${filePath}`);
  }
}

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function pluralize(str: string): string {
  // Very basic pluralization - in a real app, use a proper pluralization library
  if (str.endsWith("y")) {
    return str.slice(0, -1) + "ies";
  }
  if (str.endsWith("s") || str.endsWith("x") || str.endsWith("z") || str.endsWith("ch") || str.endsWith("sh")) {
    return str + "es";
  }
  return str + "s";
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

// Main file generation function
export function generateFiles(model: Model, basePath: string) {
  const modelName = model.name;
  const modelNameCamel = toCamelCase(modelName);
  const modelNamePlural = pluralize(modelNameCamel);
  const modelNameKebabPlural = toKebabCase(pluralize(modelName));

  // Create the base directory for the model in plural form
  const modelBasePath = path.join(basePath, `/${modelNameKebabPlural}`);
  ensureDirectoryExists(modelBasePath);

  // Create subdirectories
  const createPath = path.join(modelBasePath, "/create");
  const listPath = path.join(modelBasePath, "/list");
  const idPath = path.join(modelBasePath, "/[id]");
  const editPath = path.join(idPath, "/edit");
  const componentsPath = path.join(modelBasePath, "/components");
  const testsPath = path.join(modelBasePath, "/__tests__");

  ensureDirectoryExists(createPath);
  ensureDirectoryExists(listPath);
  ensureDirectoryExists(idPath);
  ensureDirectoryExists(editPath);
  ensureDirectoryExists(componentsPath);
  ensureDirectoryExists(testsPath);

  // Generate files with placeholder content
  // 1. Server actions
  writeFileIfNotExists(path.join(modelBasePath, "actions.ts"), `// Server actions for ${modelName}\n`);

  // 2. Components
  writeFileIfNotExists(path.join(componentsPath, `${modelName}Form.tsx`), `// Form component for ${modelName}\n`);

  // 3. Pages
  writeFileIfNotExists(path.join(listPath, "page.tsx"), `// List page for ${modelNamePlural}\n`);

  writeFileIfNotExists(path.join(createPath, "page.tsx"), `// Create page for ${modelName}\n`);

  writeFileIfNotExists(path.join(idPath, "page.tsx"), `// Detail page for ${modelName}\n`);

  writeFileIfNotExists(path.join(editPath, "page.tsx"), `// Edit page for ${modelName}\n`);

  // 4. Tests
  writeFileIfNotExists(path.join(testsPath, "actions.test.ts"), `// Tests for ${modelName} actions\n`);

  writeFileIfNotExists(path.join(testsPath, `${modelName}Form.test.tsx`), `// Tests for ${modelName} form component\n`);

  writeFileIfNotExists(path.join(testsPath, "ListPage.test.tsx"), `// Tests for ${modelName} list page\n`);

  writeFileIfNotExists(path.join(testsPath, "DetailPage.test.tsx"), `// Tests for ${modelName} detail page\n`);

  writeFileIfNotExists(path.join(testsPath, "CreatePage.test.tsx"), `// Tests for ${modelName} create page\n`);

  writeFileIfNotExists(path.join(testsPath, "EditPage.test.tsx"), `// Tests for ${modelName} edit page\n`);

  console.log(`Successfully created skeleton files for ${modelName}`);
}
