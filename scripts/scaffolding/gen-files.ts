import fs from "fs";
import path from "path";

// Convert strings to PascalCase and camelCase
const toPascalCase = (str: string) => str.replace(/(^\w|-\w)/g, (match) => match.replace("-", "").toUpperCase());

const toCamelCase = (str: string) => str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

// Utility to create a file with optional content
function createFile(filePath: string, content = "") {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created: ${filePath}`);
}

// Main scaffold function
function scaffoldModel(modelName: string) {
  const baseDir = path.join(
    __dirname,
    "..",
    "..", // Move from `scripts/scaffolding/` to root
    "src",
    "app",
    "[locale]",
    "saas",
    "(private)",
    modelName,
  );

  const PascalName = toPascalCase(modelName);
  const camelName = toCamelCase(modelName);

  const files = [
    `${baseDir}/[id]/view/page.tsx`,
    `${baseDir}/[id]/edit/page.tsx`,
    `${baseDir}/create/page.tsx`,
    `${baseDir}/list/page.tsx`,

    `${baseDir}/schemas/${modelName}Schema.ts`,

    `${baseDir}/hooks/use${PascalName}Form.ts`,
    `${baseDir}/hooks/use${PascalName}Table.ts`,

    `${baseDir}/components/${PascalName}Form/FormFields.tsx`,
    `${baseDir}/components/${PascalName}Table.tsx`,
    `${baseDir}/components/${PascalName}View.tsx`,

    `${baseDir}/actions/create${PascalName}.ts`,
    `${baseDir}/actions/update${PascalName}.ts`,
    `${baseDir}/actions/delete${PascalName}.ts`,
    `${baseDir}/actions/get${PascalName}s.ts`,

    `${baseDir}/lib/ability.ts`,
    `${baseDir}/lib/helpers.ts`,
    `${baseDir}/lib/define${PascalName}FieldVisibility.ts`,
  ];

  files.forEach((file) => createFile(file));
}

// CLI entry
const modelNameArg = process.argv[2];

if (!modelNameArg) {
  console.error("❌ Usage: `npx ts-node scripts/scaffolding/scaffolding-script.ts modelName`");
  process.exit(1);
}

scaffoldModel(modelNameArg);
