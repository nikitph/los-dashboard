// Types for the parsed schema
export type Field = {
  name: string;
  type: string;
  isRequired: boolean;
  isUnique: boolean;
  isId: boolean;
  isList: boolean;
  isRelation: boolean;
  relationName?: string;
  relationModel?: string;
  defaultValue?: string;
};

export type Model = {
  name: string;
  fields: Field[];
};

// Function to parse the schema
export function parseSchema(schemaContent: string): string[] {
  // Split the schema into lines
  return schemaContent.split("\n").map((line) => line.trim());
}

// Function to extract models from the parsed schema
export function extractModels(parsedSchema: string[]): Model[] {
  const models: Model[] = [];
  let currentModel: Model | null = null;

  // Regular expressions for parsing
  const modelRegex = /model\s+(\w+)\s+\{/;
  const fieldRegex = /(\w+)\s+(\w+)(\(\))?\s*(\?)?\s*(@.+)?/;
  const relationRegex = /@relation\((?:name:\s*"([^"]+)")?(?:.*,\s*references:\s*\[([^\]]+)\])?\)/;
  const attributeRegex = /@(\w+)(?:\(([^)]*)\))?/g;

  for (const line of parsedSchema) {
    // Check if this line defines a model
    const modelMatch = line.match(modelRegex);
    if (modelMatch) {
      // Store previous model if any
      if (currentModel) {
        models.push(currentModel);
      }

      // Start new model
      currentModel = { name: modelMatch[1], fields: [] };
      continue;
    }

    // Check if this line ends a model
    if (line === "}" && currentModel) {
      models.push(currentModel);
      currentModel = null;
      continue;
    }

    // Skip if we're not inside a model definition
    if (!currentModel) continue;

    // Check if this line defines a field
    const fieldMatch = line.match(fieldRegex);
    if (fieldMatch) {
      const [_, name, type, isList, isOptional, attributes] = fieldMatch;

      // Default field properties
      const field: Field = {
        name,
        type,
        isRequired: !isOptional,
        isUnique: false,
        isId: false,
        isList: Boolean(isList),
        isRelation: false,
      };

      // Parse attributes if any
      if (attributes) {
        let match;
        while ((match = attributeRegex.exec(attributes)) !== null) {
          const [_, attrName, attrValue] = match;

          if (attrName === "id") {
            field.isId = true;
          } else if (attrName === "unique") {
            field.isUnique = true;
          } else if (attrName === "default") {
            field.defaultValue = attrValue;
          } else if (attrName === "relation") {
            field.isRelation = true;
            const relationMatch = attributes.match(relationRegex);
            if (relationMatch) {
              field.relationName = relationMatch[1];
              // Extract related model name from the type
              field.relationModel = type;
            }
          }
        }
      }

      currentModel.fields.push(field);
    }
  }

  return models;
}

// Generate Zod schema for a model
export function generateZodSchema(model: Model): string {
  let schema = `export const ${model.name}Schema = z.object({\n`;

  model.fields.forEach((field) => {
    // Skip relation fields for validation
    if (field.isRelation) return;

    let fieldSchema = "z.";

    // Determine the Zod type based on Prisma type
    switch (field.type) {
      case "String":
        fieldSchema += "string()";
        break;
      case "Int":
        fieldSchema += "number().int()";
        break;
      case "Float":
        fieldSchema += "number()";
        break;
      case "Boolean":
        fieldSchema += "boolean()";
        break;
      case "DateTime":
        fieldSchema += "date()";
        break;
      default:
        // For custom types or enums
        fieldSchema += "any()";
    }

    // Add validation rules
    if (field.isUnique) {
      // Can't really validate uniqueness on the client, but we note it
      fieldSchema += '.describe("unique")';
    }

    // Make field optional if not required
    if (!field.isRequired && !field.isId) {
      fieldSchema += ".optional()";
    }

    // Add the field to the schema
    schema += `  ${field.name}: ${fieldSchema},\n`;
  });

  schema += "});\n";

  return schema;
}
