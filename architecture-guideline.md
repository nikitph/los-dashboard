
# CreditIQ Architecture Guidelines

## Executive Summary

The CreditIQ App Architecture provides a structured, maintainable approach to building a full-stack financial application using Next.js, Prisma, and React. Built on the principles of separation of concerns, field-level security, and internationalization, this architecture creates clear boundaries between data validation, business logic, UI presentation, and server operations.

At its core, the architecture organizes code by domain model, with each Prisma entity having a dedicated folder structure that encapsulates all related functionality. This model-first approach ensures high cohesion and appropriate coupling between related components while enforcing consistent patterns for schemas, hooks, components, and server actions. The architecture prioritizes strong typing with Zod schemas, permission-aware UI with CASL, and comprehensive internationalization with next-intl, creating a robust foundation for building complex financial workflows that meet the demanding requirements of the lending industry. By following these guidelines, developers can create features that are secure, accessible, and maintainable across the application lifecycle.

---

## Table of Contents

1. [Folder Structure Standards](#folder-structure-standards)
2. [Layer Responsibilities](#layer-responsibilities)
3. [Schemas](#schemas)
4. [Hooks](#hooks)
5. [Components](#components)
6. [Server Actions](#server-actions)
7. [Field-Level Permissions](#field-level-permissions)
8. [Translation Standards](#translation-standards)
9. [Error Handling](#error-handling)
10. [Documentation Standards](#documentation-standards)
11. [Common Anti-Patterns](#common-anti-patterns)
12. [Testing Standards](#testing-standards)

---

## Folder Structure Standards

### Model-Based Folder Convention

Each **Prisma model** (e.g., `User`, `LoanApplication`, `Bank`) should have its own top-level folder under `/src/app/[locale]/saas/(private)/{modelName}/`, containing all logic and UI related to that model. The following Structure is expected. The leaf nodes like FormFields etc will obviously change depending on the model Requirements.Please do note we use /src folder.

```bash
/src/app/[locale]/saas/(private)/guarantor/
├── [id]/
│   ├── view/
│   │   └── page.tsx
│   └── edit/
│       └── page.tsx
├── create/
│   └── page.tsx
├── list/
│   └── page.tsx
├── new/
│   └── page.tsx
├── schemas/
│   ├── guarantorSchema.ts
├── hooks/
│   ├── useGuarantorForm.ts
│   └── useGuarantorTable.ts
├── components/
│   ├── GuarantorForm/
│   │   ├── FormFields.tsx
│   ├── GuarantorTable.tsx
│   └── GuarantorView.tsx
├── actions/
│   ├── createGuarantor.ts
│   ├── updateGuarantor.ts
│   ├── deleteGuarantor.ts
│   └── getGuarantors.ts
├── lib/
│   ├── ability.ts
│   ├── helpers.ts
│   └── defineGuarantorFieldVisibility.ts
└── tests/
    ├── components/
    │   ├── GuarantorForm.test.tsx
    │   ├── GuarantorTable.test.tsx
    │   └── GuarantorView.test.tsx
    ├── hooks/
    │   ├── useGuarantorForm.test.ts
    │   └── useGuarantorTable.test.ts
    ├── schemas/
    │   └── guarantorSchema.test.ts
    ├── actions/
    │   ├── createGuarantor.test.ts
    │   ├── updateGuarantor.test.ts
    │   ├── deleteGuarantor.test.ts
    │   └── getGuarantors.test.ts
    └── lib/
        └── defineGuarantorFieldVisibility.test.ts
```

> 🔁 This co-location ensures modularity, discoverability, and better model-level encapsulation.
> 🔐 All forms and list tables must enforce field-level permissions via define{ModelName}FieldVisibility(ability)

---

## Layer Responsibilities

| Layer | Responsibility |
|-------|----------------|
| **Schema** | Define validation and types, no side effects |
| **Hook** | Orchestrate logic, data flow, form handlers |
| **Component** | Render UI, handle presentation, translate messages |
| **Server Action** | Execute business logic, validate data, authorize, respond |
| **Utility** | Shared helpers, CASL rules, formatting, uploads |

---

## Schemas

Pure Zod schemas. No side effects, no imports from `next`, `react`, or `t()`.
- Reusable validators (`phoneValidator`, `emailValidator`, etc.) store them in the same file
- Export inferred types using `z.infer<typeof schema>`
- 🔁 ALL Zod schemas use only translation **keys**, never hardcoded strings. All fields must have a translation key.
- Every model must use its own i18n namespace:
```
{
  "Guarantors": {
    "form": {},
    "validation": {},
    "errors": {},
    "toast": {},
    "list": {}
  }
}
```
- Inject the key for translation accordingly.

### File Structure

Each schema file should contain **at least 4** exports:

| Use Case                | Schema Name            | Purpose                                 |
|------------------------|------------------------|-----------------------------------------|
| ✅ Create form          | `createModelSchema`    | For form inputs or create APIs          |
| ✅ Update form (partial)| `updateModelSchema`    | For PATCH updates or step forms         |
| ✅ API validation       | `modelApiSchema`       | Full validation with `.strict()`        |
| ✅ View-only typing     | `modelViewSchema`      | Includes derived/read-only fields       |

### Example: `userSchema.ts`

```ts
import { z } from "zod";

// 🟩 CREATE
export const createUserSchema = z.object({
firstName:  z.string().min(1, { message:  "validation.firstName.required" }),
lastName:  z.string().min(1, { message:  "validation.lastName.required" }),
email:  z.string().email({ message:  "validation.email.invalid" }),
addressState:  z.string().min(1, { message:  "validation.addressState.required" }),
  role: z.enum(["USER", "ADMIN"]),
});

// 🟧 UPDATE (Partial)
export const updateUserSchema = createUserSchema.extend({
  id: z.string().uuid()
}).partial();

// 🟥 API (Strict)
export const userApiSchema = createUserSchema.strict();

// 🔵 VIEW SCHEMA
export const userViewSchema = z.object({
  id: z.string().uuid(),
  firstName:  z.string(),
  lastName:  z.string(),
  email:  z.string(),
  addressState:  z.string(),
  role: z.enum(["USER", "ADMIN"]),
  createdAt: z.date(),
  formattedCreatedAt: z.string(), // derived field
});

// 💡 Inferred types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserView = z.infer<typeof userViewSchema>;
```

### Design Rationale

| Pattern | Why |
|---------|-----|
| Split schemas per use case | Prevents monolithic validation logic |
| Use .partial() for updates | PATCH-friendly, form step-friendly |
| .strict() in API schemas | Blocks unknown/injected fields |
| Add computed fields in views | Keeps UI types clean |
| Infer types using z.infer | No duplicated TypeScript interfaces |

### Folder Convention

Every schema should live under:

```
/src/app/[locale]/saas/(private)/{modelName}/schemas/{modelName}Schema.ts
```

Example:

```
/src/app/[locale]/saas/(private)/guarantor/schemas/guarantorSchema.ts
```

All model related code should use this generated Schema for the model.

---

## Hooks

Encapsulate form and logic orchestration.

- `useUserForm.ts` for RHF integration
- `useUserList.ts` for filters, search
- Should not contain JSX
- 🔐 Must compute & return field visibility:

```ts
const ability = useAbility();
const visibility = useMemo(() => defineGuarantorFieldVisibility(ability), [ability]);
```

### Naming Convention

| Hook File        | Purpose                                           |
|------------------|---------------------------------------------------|
| `useXForm.ts`    | Form creation/edit logic (RHF + Zod + CASL)      |
| `useXTable.ts`   | Table filters, pagination, column visibility     |
| `useXView.ts`    | Derived state for read-only model views (optional) |

> ❗ Do not include JSX or translations inside hooks — these are logic-only.

### Responsibilities Per Hook

#### `useXForm()`
Handles:
- `useForm()` initialization with Zod resolver
- Default values (create vs edit)
- `useAbility()` + `define<Field>FieldVisibility()`
- Optional dynamic field computation
- Controlled field visibility map

- All fields must use `FormField` from `shadcn/ui`, bound via `form.control`
- Avoid using `register()` directly — always use `Controller`/`FormField` abstraction

Example:

```tsx
<FormField
  control={form.control}
  name="firstName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>First Name</FormLabel>
      <FormControl>
        <Input placeholder="Enter first name" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

```ts
const ability = useAbility();
const visibility = useMemo(() => defineGuarantorFieldVisibility(ability), [ability]);

const form = useForm<CreateGuarantorInput>({
  resolver: zodResolver(createGuarantorSchema),
  defaultValues: ...
});
```

**Returns:**
```ts
{
  form,
  visibility,
  isEditMode,
  defaultValues
}
```

#### `useXTable()`
Handles:
- Search/filter input state
- Pagination + sorting
- Table column definitions (filtered by CASL)
- Row selection (optional)
- React Table integration (`useReactTable()`)

```ts
const visibility = useMemo(() => defineGuarantorFieldVisibility(ability), [ability]);

const columns = useMemo(() => generateColumns(visibility), [visibility]);

const table = useReactTable({ data, columns, ... });
```

**Returns:**
```ts
{
  table,
  filters,
  pagination,
  sorting,
  visibility
}
```

#### `useXView()` *(optional)*
Used in:
- View pages (`/view/page.tsx`)
- Displays fields dynamically based on CASL and field formatting
- Can include derived state (e.g., `isFullyVerified`)

**Returns:**
```ts
{
  visibility,
  derivedFields,
  formattedValues
}
```

### CASL Integration Pattern

Always compute field visibility using:

```ts
const ability = useAbility();
const visibility = useMemo(() => defineModelFieldVisibility(ability), [ability]);
```

### Testable Returns

| Hook                  | Key Return                                    |
|-----------------------|-----------------------------------------------|
| `useGuarantorForm()`  | `form`, `visibility`, `isEditMode`            |
| `useGuarantorTable()` | `filters`, `pagination`, `columns`, `visibility` |
| `useGuarantorView()`  | `visibility`, `derivedFields`, `formattedValues` |

---

## Components

Render-only logic. Stateless and presentation-focused.
All components are designed to be **pure**, **stateless**, and **style-consistent**, built with **shadcn/ui** and **Tailwind CSS**.

- `UserForm.tsx`
- `UserStatusBadge.tsx`
- Use `useTranslations("Component")` for i18n
- conditionally render based on Visibility
```tsx
{visibility.firstName && <FormField name="firstName" />};
```

### Responsibilities

✅ Accept props only — do not fetch data
✅ Accept visibility map if needed (from hook)
✅ Stateless except for UI toggles (accordion, expand/collapse)
✅ Use composition: avoid nesting too much logic
✅ Style using Tailwind utility classes + `shadcn` slots

### Testing Philosophy

These components should be:
- 🧼 Easy to snapshot test
- 🎯 Driven by props and layout logic
- 🔍 Consistent across pages (e.g., `ViewUser`, `ViewGuarantor`)

### Suggested Composition

Example View Section:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Basic Details</CardTitle>
  </CardHeader>
  <CardContent className="grid grid-cols-2 gap-4">
    <InfoField label="First Name" value={user.firstName} />
    <InfoField label="Last Name" value={user.lastName} />
    {visibility.email && <InfoField label="Email" value={user.email} />}
  </CardContent>
</Card>
```

---

## List Page Standards

All list pages must adhere to the following architecture and behavior:

### Required Libraries
- Use [`@tanstack/react-table`](https://tanstack.com/table) for table logic.
- Use `Table`, `TableHead`, `TableBody`, `TableRow`, etc. from `@/components/ui/table` (shadcn).

### Feature Requirements
- **Column visibility control** using a dropdown and `column.getCanHide()` logic. Do this for all the columns imperatively.
- **Multi-column filtering**: text, dropdown, or combined.
- **Client-side pagination** using `getPaginationRowModel()`.
- **Global search** and composable filters (status, role, etc.).
- **Row selection** with bulk actions (e.g., delete, export).
- **Responsive design** with scrollable container on small viewports.
- **Dynamic data loading** via server actions (e.g., `getUsersForBank()`).
- **Pagination, sorting, and filtering state management** using `useReactTable()` state handlers.
- **Stable column keys** (via `accessorKey` or `id`) for toggling visibility.

### Developer Guidelines
- Column definitions must support `enableSorting`, `enableHiding`, and `column.getToggleSortingHandler()`.
- Column headers should render sort indicators (asc/desc chevrons).
- Avoid duplicating actions inline — use dropdown actions per row.
- Stats and card summaries (e.g., Active, Pending, Locked) should be computed from the filtered data.
- `Select` and `Input` components from `@/components/ui` must be used for filter controls.
- 🔐 Use define<FieldName>FieldVisibility(ability) to include/exclude columns:
```ts
const visibility = defineGuarantorFieldVisibility(ability);

const columns = [
  visibility.firstName && { accessorKey: "firstName", header: "First Name" },
  visibility.email && { accessorKey: "email", header: "Email" }
].filter(Boolean);
```

> 🧠 Always build lists as a **single source of truth**, combining table state with UI filters and global search.

---

## Server Actions

Server actions. Always `async`, `use server`.

- `createUser.ts`
- `updateUser.ts`
- Return typed `ActionResponse<T>`
- Use `getTranslations()` and validate with schema
- Can use CASL ability checks
- Must use the shared Prisma instance:

```ts
import { prisma } from "@/lib/prisma";
```

> ❌ Never instantiate a new `PrismaClient`. Always import the singleton.

### Server Action Response Contract

To ensure all server actions return a consistent format, always use the following types:

```ts
export type SuccessResponse<T> = {
  success: true;
  message: string;
  data?: T;
  meta?: Record<string, any>; // Optional contextual info (e.g., pagination, flags)
};

export type ErrorResponse = {
  success: false;
  message: string; // Use a translation key (e.g. "errors.validation")
  code?: string;   // Optional error identifier for branching logic
  errors?: Record<string, string>; // Field-specific error keys (e.g. "email.invalid")
};

export type ActionResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export function isSuccess<T>(res: ActionResponse<T>): res is SuccessResponse<T> {
  return res.success === true;
}
```

#### Use `meta` for:
- Pagination details (`page`, `totalCount`)
- Conditional flags (`isFirstLogin`, `isVerified`)
- Diagnostics (`durationMs`, `quotaRemaining`)

---

## Field-Level Permissions

### Define Field Visibility with `defineFieldVisibility()`
Each model should include a utility (`define<FieldName>FieldVisibility.ts`) that defines which fields are visible or editable to each role. This utility is backed by **CASL's `can()` logic**, but presents the result in a clean, static object for UI rendering.

This enables:
- Clean **form rendering** with only permitted fields
- Secure **data masking** in lists or views
- Seamless integration with CASL for authorization decisions

#### File Placement
```bash
/src/app/[locale]/saas/(private)/guarantors/lib/defineGuarantorFieldVisibility.ts
```

#### CASL-backed Field Visibility
```ts
import { AppAbility } from "@/lib/ability";

export function defineGuarantorFieldVisibility(ability: AppAbility) {
  return {
    firstName: ability.can("read", "Guarantor", "firstName"),
    lastName: ability.can("read", "Guarantor", "lastName"),
    email: ability.can("read", "Guarantor", "email"),
    mobileNumber: ability.can("read", "Guarantor", "mobileNumber"),
    documents: ability.can("read", "Guarantor", "documents"),
  };
}
```

#### In Form UI
```tsx
const visible = defineGuarantorFieldVisibility(ability);

{visible.firstName && <FormField name="firstName" />}
{visible.email && <FormField name="email" />}
```

#### Why not just use `ability.can()` inline?
- It's **verbose**: calling `.can(...)` for each field
- It's **repetitive**: pollutes JSX with logic
- It's **unscalable**: hard to reuse or loop over fields

Instead:
- Call `defineFieldVisibility(ability)` once
- Use the returned object to control visibility declaratively
- Centralize visibility logic for each model

### Sample Access Matrix (Best Guess)

| Field            | CLERK | INSPECTOR | LOAN_OFFICER | CEO | COMMITTEE | BOARD | BANK_ADMIN | SAAS_ADMIN | APPLICANT |
|------------------|-------|-----------|---------------|-----|-----------|--------|-------------|-------------|-----------|
| firstName        | ✅    | ✅        | ✅            | ✅  | ✅        | ✅     | ✅          | ✅          | ❌        |
| lastName         | ✅    | ✅        | ✅            | ✅  | ✅        | ✅     | ✅          | ✅          | ❌        |
| email            | ❌     | ❌         | ✅            | ✅  | ✅        | ✅     | ✅          | ✅          | ❌        |
| mobileNumber     | ✅    | ✅        | ✅            | ✅  | ✅        | ✅     | ✅          | ✅          | ❌        |
| documents        | ❌     | ✅        | ✅            | ✅  | ✅        | ✅     | ✅          | ✅          | ❌        |
| loanApplicationId| ✅    | ✅        | ✅            | ✅  | ✅        | ✅     | ✅          | ✅          | ❌        |

> ❗ APPLICANTs are never allowed to see internal data unless explicitly permitted for onboarding use-cases.

> 💡 Use these as defaults; override per model as needed.

---

## Translation Standards

### Per-Model Translation Namespace

Every model must use its own i18n namespace:

```
{
  "Guarantors": {
    "form": {},
    "validation": {},
    "errors": {},
    "toast": {},
    "list": {}
  }
}
```

### Section Breakdown

| Section | Purpose |
|---------|---------|
| `form` | Labels, placeholders, button text |
| `validation` | Field-level Zod validation messages |
| `errors` | Server error messages (e.g., from database or logic) |
| `toast` | Success/failure messages |
| `list` | Column headers, filter labels, tab headings |

### Usage Examples

```
const { page: t } = useFormTranslation("Guarantors");

t("form.firstName.label")
t("form.submit.loading")
t("validation.email.invalid")
t("toast.created")
t("errors.notFound")
t("list.columns.email")
```

> 🔁 Zod schemas use only translation **keys**, never hardcoded strings 🔁 Server actions return error keys → translated on server via `getTranslations()`

### Always Generate Hindi Strings Alongside English

Every translation key added to the English `en.json` must also be added to the Hindi `hi.json` file with an appropriate localized equivalent. This ensures:

- Complete bilingual coverage
- No runtime fallback issues
- Smooth language switching experience

### Handling Translations for Server Errors

To support localized error messages:

1. `handleActionError()` should return **message keys**, not raw strings:

```ts
return {
  success: false,
  message: "errors.duplicate",
  errors: {
    root: "errors.user.exists"
  }
};
```

2. The **server action** should translate them using `getTranslations()`:

```ts
const t = await getTranslations({ locale, namespace: "Users" });

const rawError = handleActionError(err);

return {
  ...rawError,
  message: t(rawError.message),
  errors: rawError.errors
    ? Object.fromEntries(
        Object.entries(rawError.errors).map(([key, msg]) => [key, t(msg)])
      )
    : undefined,
};
```

3. Client will receive fully translated `ActionResponse` and just render the messages.

---

## Error Handling

### Form Error Handling & Toasting Pattern

#### Utility to map `ActionResponse` errors to RHF

```ts
import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toastErrorFromResponse } from "@/lib/toastUtils";
import { ActionResponse } from "@/types/globalTypes";

export function handleFormErrors<T extends FieldValues>(
  response: ActionResponse<any>,
  setError: UseFormSetError<T>
): void {
  if (response.success) return;

  const { errors, message } = response;

  if (errors) {
    Object.entries(errors).forEach(([key, msg]) => {
      if (key !== "root") {
        setError(key as Path<T>, {
          type: "manual",
          message: String(msg),
        });
      }
    });
  }

  toastErrorFromResponse({ message, errors });
}
```

#### Toast error adapter:

```ts
export function toastErrorFromResponse(response: Pick<ErrorResponse, "message" | "errors">) {
  if (process.env.NODE_ENV === "development") {
    console.error("[toastErrorFromResponse]", response);
  }

  if (response.errors?.root) {
    toastError({
      title: "Something went wrong",
      description: response.errors.root,
    });
  } else {
    toastError({
      title: "Error",
      description: response.message || "An unexpected error occurred",
    });
  }
}
```

### Common Error Handling Anti-Patterns to Avoid

| Violation | Fix |
|-----------|-----|
| Hardcoding error messages | Use translation keys |
| Using try/catch without proper error typing | Cast errors or use error factories |
| Inconsistent error response formats | Always use `ActionResponse<T>` |
| Missing field-level error mapping | Use `handleFormErrors()` |
| Using `alert()` or raw `console.error()` | Use toast notifications |

---

## Documentation Standards

Comprehensive documentation is essential for the maintainability and scalability of the CreditIQ application. This section outlines the documentation requirements and standards to ensure consistency and clarity across the codebase.

### JSDoc Standards

All functions, hooks, and components must be documented using JSDoc comments. This includes server actions, utility functions, hooks, and React components. Always use multiline or block comments. No single line comment.

#### Function and Method Documentation

```typescript
/**
 * Creates a new guarantor in the database
 *
 * @param {CreateGuarantorInput} data - The validated guarantor data
 * @returns {Promise<ActionResponse<Guarantor>>} Response with created guarantor or error
 * @throws Will throw an error if user lacks permission to create guarantors
 */
export async function createGuarantor(
  data: CreateGuarantorInput
): Promise<ActionResponse<Guarantor>> {
  // Implementation...
}
```

#### React Component Documentation

```typescript
/**
 * Displays a form for creating or editing a guarantor
 *
 * @param {object} props - Component props
 * @param {Guarantor} [props.initialData] - Initial data for edit mode (optional)
 * @param {string} props.loanApplicationId - ID of the related loan application
 * @param {boolean} [props.readOnly=false] - Whether the form is in read-only mode
 * @returns {JSX.Element} Guarantor form component
 */
export function GuarantorForm({
  initialData,
  loanApplicationId,
  readOnly = false
}: GuarantorFormProps): JSX.Element {
  // Implementation...
}
```

#### Hook Documentation

```typescript
/**
 * Custom hook to manage guarantor form state and submission
 *
 * @param {object} options - Hook options
 * @param {Guarantor} [options.initialData] - Initial guarantor data for edit mode
 * @param {string} options.loanApplicationId - ID of the associated loan application
 * @returns {GuarantorFormHookReturn} Form state and handlers
 */
export function useGuarantorForm({
  initialData,
  loanApplicationId
}: UseGuarantorFormOptions): GuarantorFormHookReturn {
  // Implementation...
}
```

#### Type Definitions Documentation

```typescript
/**
 * Response from a guarantor creation or update operation
 *
 * @typedef {object} GuarantorActionResponse
 * @property {boolean} success - Whether the operation was successful
 * @property {string} message - Message describing the result
 * @property {Guarantor} [data] - The created or updated guarantor data (if successful)
 * @property {Record<string, string>} [errors] - Field-specific error messages (if unsuccessful)
 */
```

### README Requirements for Model Folders

Each model folder must include a README.md file that explains the model's purpose, structure, and usage. The README should follow this structure:

#### Model README Template

```markdown
# Guarantor Model

## Overview
Brief description of what the guarantor model represents in the system and its business purpose.

## Model Schema
```typescript
model Guarantor {
  id              String   @id @default(cuid())
  firstName       String
  lastName        String
  email           String   @unique
  // ... other fields
}
```

## Key Relationships
- Belongs to a LoanApplication (many-to-one)
- ... other relationships

## Business Rules
1. A guarantor must have a valid email address
2. A guarantor must be associated with exactly one loan application
3. ... other business rules

## Permission Matrix
| Field        | CLERK | INSPECTOR | LOAN_OFFICER | CEO | COMMITTEE | BANK_ADMIN |
|--------------|-------|-----------|--------------|-----|-----------|------------|
| firstName    | R/W   | R         | R/W          | R   | R         | R/W        |
| lastName     | R/W   | R         | R/W          | R   | R         | R/W        |
| ... other fields

## API Endpoints
- `POST /api/guarantors` - Create a new guarantor
- `GET /api/guarantors/:id` - Get guarantor details
- ... other endpoints

## UI Components
- `/guarantors/create` - Form to create a new guarantor
- `/guarantors/[id]/edit` - Form to edit an existing guarantor
- ... other components
```

### API Documentation Standards

Server actions and API endpoints should be thoroughly documented with request/response examples, validation rules, and error scenarios.

#### Server Action Documentation

Each server action file should include:

```typescript
/**
 * @fileoverview
 * Server action to create a new guarantor in the system.
 * Validates the input data, checks user permissions, and inserts the guarantor into the database.
 */

/**
 * Creates a new guarantor
 *
 * @example
 * // Success case
 * const response = await createGuarantor({
 *   firstName: "John",
 *   lastName: "Doe",
 *   email: "john.doe@example.com",
 *   loanApplicationId: "clq1234abcdef"
 * });
 * // => { success: true, message: "Guarantor created", data: { id: "clq..." } }
 *
 * @example
 * // Error case - validation failure
 * const response = await createGuarantor({
 *   firstName: "",  // empty first name
 *   lastName: "Doe",
 *   email: "invalid-email",
 *   loanApplicationId: "clq1234abcdef"
 * });
 * // => {
 * //      success: false,
 * //      message: "Validation failed",
 * //      errors: {
 * //        firstName: "First name is required",
 * //        email: "Invalid email format"
 * //      }
 * //    }
 *
 * @param {CreateGuarantorInput} data - Validated guarantor data
 * @returns {Promise<ActionResponse<Guarantor>>} Response with created guarantor or error details
 */
```

#### API Response Standards

Document expected response formats with examples:

```typescript
/**
 * Standard success response format
 *
 * @example
 * // Success response
 * {
 *   "success": true,
 *   "message": "Operation completed successfully",
 *   "data": {
 *     "id": "clq1234abcdef",
 *     "firstName": "John",
 *     "lastName": "Doe",
 *     // Other fields...
 *   },
 *   "meta": {
 *     "timestamp": "2023-04-01T12:00:00Z"
 *   }
 * }
 *
 * @example
 * // Error response
 * {
 *   "success": false,
 *   "message": "Operation failed",
 *   "code": "VALIDATION_ERROR",
 *   "errors": {
 *     "email": "Email already exists"
 *   }
 * }
 */
```

### Comment Styles and Conventions

#### Code Section Comments

Use block comments to separate logical sections within larger files:

```typescript
/*
 * Form Field Rendering
 * -----------------------------------------------------------------------------
 */

/* Field components go here... */

/*
 * Form Submission Handlers
 * -----------------------------------------------------------------------------
 */

/* Submission logic goes here... */
```

#### Implementation Notes

Explain complex algorithms or non-obvious code:

```typescript
/*
 * We're using a debounced callback here to prevent excessive API calls
 * during rapid user input while still maintaining responsiveness
 */
const debouncedSearch = useDebounce(handleSearch, 300);
```

#### Warning Comments

Highlight potential gotchas or edge cases:

```typescript
/*
 * WARNING: This function mutates the input array
 * Consider using [...array] if you need to preserve the original
 */
```

### Documentation Checklist

For each feature or model implementation, ensure the following documentation exists:

- [ ] All exported functions, hooks, and components have JSDoc comments
- [ ] The model folder contains a README.md with the required sections
- [ ] Server actions include usage examples with success and error cases
- [ ] Complex logic has explanatory comments
- [ ] Type definitions are documented
- [ ] Permission rules and field visibility are documented
- [ ] API endpoints list expected inputs and outputs

By following these documentation standards, the CreditIQ codebase will remain accessible to new team members and maintainable as it grows over time. Good documentation reduces onboarding friction, prevents knowledge silos, and promotes consistent implementation patterns across the application.

---

## Common Anti-Patterns

### Component Anti-Patterns

- ❌ Fetching data within component
- ❌ Including `useAbility` directly (pass `visibility` from hooks)
- ❌ Writing conditional logic inside UI files (move to hooks)
- ❌ Mixing forms and render-only blocks
- ❌ Defining types inline (use schema/inferred types)

### Common Violations to Avoid

| Violation | Fix |
|----------|-----|
| Calling `t()` inside schema | Use error keys and translate at point of display |
| Performing mutation in JSX | Move to hook or server action |
| Checking `ability.can()` in schema or util | Check in server action or hook |
| Defining RHF logic in component | Move to `useXYZForm()` hook |
| Mixing translation strings and data logic | Isolate in UI layer only |
| Creating a new PrismaClient manually | Always use `import { prisma } from "@/lib/prisma"` |

---
## Testing Standards

### Overview

The CreditIQ application follows a comprehensive testing strategy that aligns with its model-based architecture. This document outlines our testing approach, folder structure, and best practices for writing effective tests across all layers of the application.

### Testing Philosophy

Our testing approach is built on three main pillars:

1. **Unit Testing**: Test individual functions, hooks, utils, and schemas in isolation
2. **Component Testing**: Test UI components, form fields, and interactive elements with React Testing Library
3. **Integration Testing**: Test workflows that span multiple components and server actions

### Folder Structure

Tests are co-located with source code in dedicated `tests` folders within each model directory:

```
/src/app/[locale]/saas/(private)/guarantor/
├── /components/
│   ├── GuarantorForm.tsx
│   ├── GuarantorTable.tsx
├── /tests/                    # Tests folder within the model directory
│   ├── /components/
│   │   ├── GuarantorForm.test.tsx
│   │   ├── GuarantorTable.test.tsx
│   ├── /hooks/
│   │   ├── useGuarantorForm.test.ts
│   ├── /schemas/
│   │   └── guarantorSchema.test.ts
│   ├── /actions/
│   │   ├── createGuarantor.test.ts
│   └── /lib/
│       └── defineGuarantorFieldVisibility.test.ts
```

Global test utilities and setup files are located in the following folders:

```
/src/
├── /jest/
│   ├── setup.ts              # Jest setup file with global mocks
│   └── mocks.ts              # Global mock setup including Prisma
├── /test-utils/              # Shared test utilities
│   ├── ability-setup.ts      # CASL ability testing utilities
│   ├── form-helpers.ts       # React Hook Form testing helpers
│   └── render-helpers.ts     # Custom render with providers
```

### Testing Tools

- **Jest**: Core testing framework and test runner
- **React Testing Library**: For testing React components
- **User-Event**: For simulating user interactions
- **MSW**: For mocking server actions and API requests
- **jest-mock-extended**: For mocking Prisma and other dependencies

### Setup and Configuration

### Jest Configuration

```typescript
// jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig: Config = {
  setupFilesAfterEnv: ['<rootDir>/src/jest/setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_mocks__/**',
    '!src/**/node_modules/**',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],
};

export default createJestConfig(customJestConfig);
```

### Global Mocks

Jest setup includes mocks for:
- Next.js navigation
- next-intl translations
- Server actions
- ResizeObserver

### Testing Each Layer

### 1. Schema Testing

Test Zod schemas for validation rules, error messages, and type inference.

```typescript
import { createGuarantorSchema } from '@/app/[locale]/saas/(private)/guarantor/schemas/guarantorSchema';

describe('Guarantor Schema', () => {
  it('should validate a valid guarantor', () => {
    const validGuarantor = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      loanApplicationId: 'loan123'
    };

    const result = createGuarantorSchema.safeParse(validGuarantor);
    expect(result.success).toBe(true);
  });

  it('should return validation errors for invalid data', () => {
    const invalidGuarantor = {
      firstName: '',
      lastName: 'Doe',
      email: 'invalid-email',
      loanApplicationId: 'loan123'
    };

    const result = createGuarantorSchema.safeParse(invalidGuarantor);
    expect(result.success).toBe(false);

    if (!result.success) {
      const formattedErrors = result.error.format();
      expect(formattedErrors.firstName?._errors).toContain('validation.firstName.required');
      expect(formattedErrors.email?._errors).toContain('validation.email.invalid');
    }
  });
});
```

### 2. Hook Testing

Test custom hooks for form logic, data transformations, and field visibility.

```typescript
import { renderHook, act } from '@testing-library/react';
import { useGuarantorForm } from '@/app/[locale]/saas/(private)/guarantor/hooks/useGuarantorForm';
import { createTestAbility } from '@/test-utils/ability-setup';

// Wrap with necessary providers
const wrapper = ({ children }) => {
  const ability = createTestAbility([
    { action: 'read', subject: 'Guarantor' }
  ]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};

describe('useGuarantorForm', () => {
  it('should initialize form with default values', () => {
    const { result } = renderHook(
      () => useGuarantorForm({ loanApplicationId: 'loan123' }),
      { wrapper }
    );

    expect(result.current.form).toBeDefined();
    expect(result.current.visibility).toBeDefined();
    expect(result.current.isEditMode).toBe(false);
  });

  it('should compute field visibility based on ability', () => {
    const { result } = renderHook(
      () => useGuarantorForm({ loanApplicationId: 'loan123' }),
      { wrapper }
    );

    expect(result.current.visibility.firstName).toBe(true);
    expect(result.current.visibility.lastName).toBe(true);
  });
});
```

### 3. Component Testing

Test components for rendering, interactions, and conditionally displayed elements.

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuarantorForm } from '@/app/[locale]/saas/(private)/guarantor/components/GuarantorForm';
import { renderWithProviders } from '@/test-utils/render-helpers';
import { testAbilities } from '@/test-utils/ability-setup';

describe('GuarantorForm', () => {
  it('should render all fields for LOAN_OFFICER role', () => {
    renderWithProviders(
      <GuarantorForm loanApplicationId="loan123" />,
      { ability: testAbilities.LOAN_OFFICER }
    );

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
  });

  it('should hide email field for CLERK role', () => {
    renderWithProviders(
      <GuarantorForm loanApplicationId="loan123" />,
      { ability: testAbilities.CLERK }
    );

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const mockSubmit = jest.fn();

    // Render with act
    await act(async () => {
      renderWithProviders(
        <GuarantorForm loanApplicationId="loan123" onSubmit={mockSubmit} />,
        { ability: testAbilities.LOAN_OFFICER }
      );
    });

    // Fill form
    await userEvent.type(screen.getByLabelText(/first name/i), 'John');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john.doe@example.com');

    // Submit with act to handle async updates
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    // Wait for submission to complete
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        })
      );
    });
  });
});
```

### 4. Server Action Testing

Test server actions for validation, permission checks, and error handling.

```typescript
import { createGuarantor } from '@/app/[locale]/saas/(private)/guarantor/actions/createGuarantor';
import { prisma } from '@/jest/mocks';
import { mockSession } from '@/test-utils/session-helpers';

// Mock abilities
jest.mock('@/lib/ability', () => ({
  defineAbilityFor: jest.fn().mockReturnValue({
    can: jest.fn().mockReturnValue(true)
  })
}));

// Mock getTranslations
jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn().mockResolvedValue((key) => key)
}));

describe('createGuarantor', () => {
  it('should create a guarantor with valid data', async () => {
    // Setup mocks
    prisma.guarantor.create.mockResolvedValue({
      id: 'guarantor123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      loanApplicationId: 'loan123',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Mock session
    mockSession({ role: 'LOAN_OFFICER' });

    // Call the server action
    const result = await createGuarantor({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      loanApplicationId: 'loan123'
    });

    // Verify results
    expect(result.success).toBe(true);
    expect(result.data).toEqual(expect.objectContaining({
      id: 'guarantor123',
      firstName: 'John'
    }));
    expect(prisma.guarantor.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        loanApplicationId: 'loan123'
      })
    });
  });

  it('should return validation errors for invalid data', async () => {
    // Mock session
    mockSession({ role: 'LOAN_OFFICER' });

    // Call the server action with invalid data
    const result = await createGuarantor({
      firstName: '',
      lastName: 'Doe',
      email: 'invalid-email',
      loanApplicationId: 'loan123'
    });

    // Verify validation fails
    expect(result.success).toBe(false);
    expect(result.message).toContain('validation');
    expect(result.errors).toBeDefined();
    expect(prisma.guarantor.create).not.toHaveBeenCalled();
  });
});
```

### 5. Field Visibility Testing

Test that CASL permissions correctly control field visibility.

```typescript
import { defineGuarantorFieldVisibility } from '@/app/[locale]/saas/(private)/guarantor/lib/defineGuarantorFieldVisibility';
import { createTestAbility, testAbilities } from '@/test-utils/ability-setup';

describe('defineGuarantorFieldVisibility', () => {
  it('should show all fields for LOAN_OFFICER', () => {
    const visibility = defineGuarantorFieldVisibility(testAbilities.LOAN_OFFICER);

    expect(visibility.firstName).toBe(true);
    expect(visibility.lastName).toBe(true);
    expect(visibility.email).toBe(true);
    expect(visibility.mobileNumber).toBe(true);
    expect(visibility.documents).toBe(true);
  });

  it('should hide sensitive fields for CLERK', () => {
    const visibility = defineGuarantorFieldVisibility(testAbilities.CLERK);

    expect(visibility.firstName).toBe(true);
    expect(visibility.lastName).toBe(true);
    expect(visibility.email).toBe(false);
    expect(visibility.mobileNumber).toBe(true);
    expect(visibility.documents).toBe(false);
  });

  it('should allow only view access for COMMITTEE', () => {
    const ability = createTestAbility([
      { action: 'read', subject: 'Guarantor' },
      { action: 'read', subject: 'Guarantor', fields: ['firstName', 'lastName', 'email'] }
    ]);

    const visibility = defineGuarantorFieldVisibility(ability);

    expect(visibility.firstName).toBe(true);
    expect(visibility.email).toBe(true);
    expect(visibility.documents).toBe(false);
  });
});
```

### Testing Utilities

### Custom Render

Use `renderWithProviders` to render components with the necessary providers:

```typescript
import { renderWithProviders } from '@/test-utils/render-helpers';
import { testAbilities } from '@/test-utils/ability-setup';

// Render with LOAN_OFFICER permissions
renderWithProviders(<YourComponent />, {
  ability: testAbilities.LOAN_OFFICER
});

// Render with custom permissions
renderWithProviders(<YourComponent />, {
  ability: createTestAbility([
    { action: 'read', subject: 'Guarantor', fields: ['firstName'] }
  ])
});
```

### Form Testing

Use form testing helpers to simplify testing forms:

```typescript
import { setupTestForm, generateMockFormData } from '@/test-utils/form-helpers';
import { createGuarantorSchema } from '@/app/[locale]/saas/(private)/guarantor/schemas/guarantorSchema';

// Generate test data based on the schema
const mockData = generateMockFormData(createGuarantorSchema);

// Setup a test form
const { result } = setupTestForm(createGuarantorSchema);
const form = result.current;

// Submit with test data
await submitForm(form, mockData);
```

### Mocking Prisma

Use the mocked Prisma client in tests:

```typescript
import { prisma } from '@/jest/mocks';

// Setup mock responses
prisma.guarantor.findMany.mockResolvedValue([
  { id: '1', firstName: 'John', lastName: 'Doe' }
]);

// Verify calls
expect(prisma.guarantor.create).toHaveBeenCalledWith({
  data: expect.objectContaining({ firstName: 'John' })
});
```

### Best Practices

### 1. Test Structure

Follow the AAA pattern (Arrange, Act, Assert):

```typescript
it('should do something', () => {
  // Arrange - set up test data and conditions
  const testData = { /* ... */ };

  // Act - perform the action being tested
  const result = functionUnderTest(testData);

  // Assert - verify the expected outcome
  expect(result).toEqual(expectedOutput);
});
```

### 2. Use Descriptive Test Names

Name tests clearly to describe expected behavior:

```typescript
// Good
it('should hide email field for users without read permissions', () => {});

// Bad
it('test email visibility', () => {});
```

### 3. Mock External Dependencies

Always mock external services, APIs, and databases:

```typescript
// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: '1', name: 'Test User' })
    }
  }
}));

// Mock server action
jest.mock('@/app/[locale]/saas/(private)/guarantor/actions/createGuarantor', () => ({
  createGuarantor: jest.fn().mockResolvedValue({
    success: true,
    data: { id: '1' }
  })
}));
```

### 4. Testing Translations

For components using internationalization:

```typescript
// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key // Returns the key as the translation
}));

// Verify translation keys
expect(screen.getByText('Guarantors.form.firstName.label')).toBeInTheDocument();
```

### 5. Testing Form Validation

Test both valid and invalid form submissions:

```typescript
// Valid submission
await userEvent.type(screen.getByLabelText(/email/i), 'valid@example.com');
await userEvent.click(screen.getByRole('button', { name: /submit/i }));
expect(mockSubmit).toHaveBeenCalled();

// Invalid submission
await userEvent.type(screen.getByLabelText(/email/i), 'invalid-email');
await userEvent.click(screen.getByRole('button', { name: /submit/i }));
expect(screen.getByText('validation.email.invalid')).toBeInTheDocument();
expect(mockSubmit).not.toHaveBeenCalled();
```

### 6. Field Visibility Testing

Always test that field visibility respects CASL permissions:

```typescript
// Test with CLERK role (limited permissions)
renderWithProviders(<GuarantorForm />, { ability: testAbilities.CLERK });
expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();

// Test with ADMIN role (full permissions)
renderWithProviders(<GuarantorForm />, { ability: testAbilities.ADMIN });
expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
```

### 7. Test Documentation

Always Ensure that you are writing detailed jsdoc in the test files to capture what is being tested.


### 8. Handling Asynchronous Operations

When testing components with asynchronous operations (data fetching, state updates, etc.), wrap these operations in `act()` and use `waitFor()` to ensure your tests reflect user experience accurately:

```typescript
import { act } from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';

// For components with useEffect data fetching
it('should fetch and display data', async () => {
  // Mock data fetching
  jest.spyOn(actions, 'getData').mockResolvedValue({
    success: true,
    data: [{ id: 'item1', name: 'Test Item' }]
  });

  // Render with act to handle useEffect
  await act(async () => {
    renderWithProviders(<DataComponent />);
  });

  // Wait for data to be displayed
  await waitFor(() => {
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });
});
```

Common scenarios requiring act() and waitFor():

-- Components with useEffect hooks that fetch data
-- Form submissions with async validation or server calls
-- Components with delayed state updates (timers, animations)
-- User interactions that trigger async state changes

Always make test functions async when dealing with asynchronous operations, and prefer userEvent over fireEvent for better simulation of real user interactions.


### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode during development
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run tests for a specific file
pnpm test -t "GuarantorForm"
```

### Coverage Requirements

- **Unit Tests**: Aim for 80%+ coverage of utility functions, schemas, and hooks
- **Component Tests**: Cover all conditional rendering paths and user interactions
- **Integration Tests**: Focus on critical user flows rather than complete coverage

### Continuous Integration

Tests are automatically run in the CI pipeline for:
- Pull requests
- Merges to main branch
- Nightly builds

### Conclusion

Following these testing guidelines ensures that the CreditIQ application maintains high quality, reliability, and consistency across its model-based architecture. Tests should focus on validating business rules, permissions, and user interactions to create a robust application that meets the needs of all stakeholders.

---
# Prisma Model to CreditIQ Architecture Prompt

## Task Description
Generate a complete set of files for a Next.js CreditIQ application based on the provided Prisma model. Follow the CreditIQ Architecture Guidelines to create a fully functional, permission-aware, internationalized feature set that includes:

1. Server actions for CRUD operations
2. Form components with field-level permissions
3. List views with filtering, sorting, and pagination
4. Zod schemas for validation
5. React Hook Form integrations
6. CASL-based permission controls
7. Translation schemas for English and Hindi

## Input Instructions
Provide the following:

1. Prisma model definition (required)
2. Specific roles that can access this model (optional, defaults to all roles)
3. Any special validation or business logic requirements (optional)

## Prisma Model Input

```prisma
// Paste your Prisma model here, for example:
model YourModel {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  // Add other fields...
}
```

## Expected Output

I need complete code for all files in the following structure, with no placeholders or "to be implemented" sections:

```
/src/app/[locale]/saas/(private)/{modelName}/
├── [id]/
│   ├── view/
│   │   └── page.tsx           # Detailed view page
│   └── edit/
│       └── page.tsx           # Edit form page
├── create/
│   └── page.tsx               # Creation form page
├── list/
│   └── page.tsx               # List page with table
├── schemas/
│   ├── {modelName}Schema.ts   # Zod validation schemas
├── hooks/
│   ├── use{ModelName}Form.ts  # Form logic hook
│   └── use{ModelName}Table.ts # Table logic hook
├── components/
│   ├── {ModelName}Form/
│   │   ├── FormFields.tsx     # Form fields component
│   ├── {ModelName}Table.tsx   # Table component
│   └── {ModelName}View.tsx    # View component
├── actions/
│   ├── create{ModelName}.ts   # Create server action
│   ├── update{ModelName}.ts   # Update server action
│   ├── delete{ModelName}.ts   # Delete server action
│   └── get{ModelName}s.ts     # Get list server action
├── lib/
│   ├── ability.ts             # CASL ability definitions
│   ├── helpers.ts             # Helper functions
│   └── define{ModelName}FieldVisibility.ts # Field visibility
└── tests/                     # Tests folder within the model directory
    ├── components/
    │   ├── {ModelName}Form.test.tsx
    │   ├── {ModelName}Table.test.tsx
    │   └── {ModelName}View.test.tsx
    ├── hooks/
    │   ├── use{ModelName}Form.test.ts
    │   └── use{ModelName}Table.test.ts
    ├── schemas/
    │   └── {modelName}Schema.test.ts
    ├── actions/
    │   ├── create{ModelName}.test.ts
    │   ├── update{ModelName}.test.ts
    │   ├── delete{ModelName}.test.ts
    │   └── get{ModelName}s.test.ts
    └── lib/
        └── define{ModelName}FieldVisibility.test.ts
```

## Additional requirements

1. All UI must respect field-level permissions based on user roles
2. All forms must validate using Zod schemas
3. All server actions must return the standardized ActionResponse type
4. All components must use internationalization with both English and Hindi translations
5. Table views must include filtering, sorting, and pagination functionality

## Example Usage

This is just an example. do not start generating code wildly assuming this is the input model. Assume I provide this Prisma model:

```prisma
model Guarantor {
  id              String   @id @default(cuid())
  firstName       String
  lastName        String
  email           String   @unique
  mobileNumber    String?
  documents       Json?
  loanApplication LoanApplication @relation(fields: [loanApplicationId], references: [id])
  loanApplicationId String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

Then I need you to generate complete code for all the files in the structure above, specifically for the model, including full implementations of each component, action, schema, and hook, tests everything.

In your implementation:
- Ensure all server actions properly validate input and return typed responses
- Implement proper field visibility based on roles (CLERK, INSPECTOR, LOAN_OFFICER, CEO, COMMITTEE, BOARD, BANK_ADMIN, SAAS_ADMIN, APPLICANT)
- Include complete translations for English and Hindi
- Implement working table features (sorting, filtering, pagination)
- Use shadcn components for the UI

## Key Architecture Rules to Follow

1. Schema files should contain pure Zod schemas with no side effects
2. Hooks should encapsulate form and logic orchestration without JSX
3. Components should be render-only and use field visibility patterns
4. Server actions should validate data, implement CASL checks, and return typed responses
5. All files must follow the naming conventions exactly
6. Schema files should imperatively have translation keys for all fields.
7. Jsdoc instructions must be properly followed to the smallest detail.
8. Well documented test files with comprehensive coverage. if you are not sure if something is mocked, add mock code in the test file itself.

Remember: Do not truncate any implementations. Provide complete, functioning code that would actually work in a production environment without any bugs or TypeScript errors.
