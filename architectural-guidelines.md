# CreditIQ Architecture Guidelines

## Executive Summary

The CreditIQ App Architecture provides a structured, maintainable approach to building a full-stack financial application using Next.js, Prisma, and React. Built on the principles of separation of concerns, field-level security, and internationalization, this architecture creates clear boundaries between data validation, business logic, UI presentation, and server operations.

At its core, the architecture organizes code by domain model, with each Prisma entity having a dedicated folder structure that encapsulates all related functionality. This model-first approach ensures high cohesion and appropriate coupling between related components while enforcing consistent patterns for schemas, hooks, components, and server actions. The architecture prioritizes strong typing with Zod schemas, permission-aware UI with CASL (managed via utilities in `/src/lib/casl`), and comprehensive internationalization with next-intl (potentially aided by helpers like `/src/lib/serverTranslationUtil.ts`), creating a robust foundation for building complex financial workflows that meet the demanding requirements of the lending industry. By following these guidelines, developers can create features that are secure, accessible, and maintainable across the application lifecycle.

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
│   ├── ability.ts             # Model-specific CASL subjects/actions, imports from @/lib/casl
│   ├── helpers.ts             # General model-specific helpers
│   └── defineGuarantorFieldVisibility.ts # Uses CASL ability from @/lib/casl
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
> 🔐 All forms and list tables must enforce field-level permissions via define{ModelName}FieldVisibility(ability) which uses the core ability setup from `/src/lib/casl`.

---

## Layer Responsibilities

| Layer             | Responsibility                                            | Relevant `/src/lib` Utilities                                                                                                              |
| ----------------- | --------------------------------------------------------- |--------------------------------------------------------------------------------------------------------------------------------------------|
| **Schema**        | Define validation and types, no side effects              | `zodUtils.ts` (potentially for common validators and common zod code if any)                                                               |
| **Hook**          | Orchestrate logic, data flow, form handlers               | `casl/` (for `useAbility`), `useMobile.tsx`, `useOnWindowResize.tsx`                                                                       |
| **Component**     | Render UI, handle presentation, translate messages        | `displayUtils.ts`, `chartUtils.ts`                                                                                                         |
| **Server Action** | Execute business logic, validate data, authorize, respond | `prisma/`, `supabase/`, `casl/`, `getServerUser.ts`, `actionErrorHelpers.ts`, `serverTranslationUtil.ts`                                   |
| **Utility**       | Shared helpers, CASL rules, formatting, uploads           | `utils.ts`, `casl/`, `displayUtils.ts`, `constants.ts`, `backblaze/` (for uploads), `toastUtils.ts`, `formErrorHelper.ts`, `chartUtils.ts` |

---

## Schemas

Pure Zod schemas. No side effects, no imports from `next`, `react`, or `t()`.

- Reusable validators (`phoneValidator`, `emailValidator`, etc.) can be potentially stored in `src/lib/zodUtils.ts` if they are generic enough or within the model's `/lib/helpers.ts`.
- Export inferred types using `z.infer<typeof schema>`
- 🔁 ALL Zod schemas use only translation **keys**, never hardcoded strings. All fields must have a translation key.
- Every model must use its own i18n namespace inside `/messages/en.json` and `/messages/hi.json`:

```json
{
  "<ModelName>": {
    "form": {},
    "validation": {},
    "errors": {},
    "toast": {},
    "list": {}
  }
}
```

- Inject the key for translation accordingly. Server-side translation might use helpers from `src/lib/serverTranslationUtil.ts`.

### File Structure

Each schema file should contain **at least 4** exports:

| Use Case                 | Schema Name         | Purpose                           |
| ------------------------ | ------------------- | --------------------------------- |
| ✅ Create form           | `createModelSchema` | For form inputs or create APIs    |
| ✅ Update form (partial) | `updateModelSchema` | For PATCH updates or step forms   |
| ✅ API validation        | `modelApiSchema`    | Full validation with `.strict()`  |
| ✅ View-only typing      | `modelViewSchema`   | Includes derived/read-only fields |

### Example: `userSchema.ts`

```ts
import { z } from "zod";
// Potentially import shared validators
// import { phoneValidator } from "src/lib/zodUtils";

// 🟩 CREATE
export const createUserSchema = z.object({
  firstName: z.string().min(1, { message: "validation.firstName.required" }),
  lastName: z.string().min(1, { message: "validation.lastName.required" }),
  email: z.string().email({ message: "validation.email.invalid" }),
  addressState: z.string().min(1, { message: "validation.addressState.required" }),
  role: z.enum(["USER", "ADMIN"]),
});

// 🟧 UPDATE (Partial)
export const updateUserSchema = createUserSchema
  .extend({
    id: z.string().uuid(),
  })
  .partial();

// 🟥 API (Strict)
export const userApiSchema = createUserSchema.strict();

// 🔵 VIEW SCHEMA
export const userViewSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  addressState: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  createdAt: z.date(),
  formattedCreatedAt: z.string(), // derived field - formatting might use "@/lib/displayUtils"
});

// 💡 Inferred types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserView = z.infer<typeof userViewSchema>;
```

### Design Rationale

| Pattern                      | Why                                  |
| ---------------------------- | ------------------------------------ |
| Split schemas per use case   | Prevents monolithic validation logic |
| Use .partial() for updates   | PATCH-friendly, form step-friendly   |
| .strict() in API schemas     | Blocks unknown/injected fields       |
| Add computed fields in views | Keeps UI types clean                 |
| Infer types using z.infer    | No duplicated TypeScript interfaces  |

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
import { useAbility } from "@/lib/casl/caslProvider"; 
import { useMemo } from "react";
import { defineGuarantorFieldVisibility } from "../lib/defineGuarantorFieldVisibility"; // Model-specific visibility definition

// ...

const ability = useAbility();
const visibility = useMemo(() => defineGuarantorFieldVisibility(ability), [ability]);
```

### Naming Convention

| Hook File      | Purpose                                            | Potential `/src/lib` Hooks Used |
| -------------- | -------------------------------------------------- | ------------------------------- |
| `useXForm.ts`  | Form creation/edit logic (RHF + Zod + CASL)        | `useMobile.tsx`                 |
| `useXTable.ts` | Table filters, pagination, column visibility       | `useOnWindowResize.tsx`         |
| `useXView.ts`  | Derived state for read-only model views (optional) |                                 |

> ❗ Do not include JSX or translations inside hooks — these are logic-only.

### Responsibilities Per Hook

#### `useXForm()`

Handles:

- `useForm()` initialization with Zod resolver
- Default values (create vs edit)
- `useAbility()` (from `src/lib/casl`) + `define<Field>FieldVisibility()` (from model's `lib`)
- Optional dynamic field computation
- Controlled field visibility map

- All fields must use `FormField` from `shadcn/ui`, bound via `form.control`
- Avoid using `register()` directly — always use `Controller`/`FormField` abstraction

Example `FormField` usage (in the component, not the hook):

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

Example Hook Logic:

```ts
import { useAbility } from "@/lib/casl/caslProvider";
import { useMemo } from "react";
import { defineGuarantorFieldVisibility } from "../lib/defineGuarantorFieldVisibility";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGuarantorSchema, CreateGuarantorInput } from "../schemas/guarantorSchema";

// ... inside useGuarantorForm hook ...
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
  form, visibility, isEditMode, defaultValues;
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
import { useAbility } from "@/lib/casl/caslProvider";
import { useMemo } from "react";
import { defineGuarantorFieldVisibility } from "../lib/defineGuarantorFieldVisibility";
import { useReactTable } from "@tanstack/react-table";
// import { generateColumns } from './tableColumnsDefinition'; // Example helper

// ... inside useGuarantorTable hook ...
const ability = useAbility();
const visibility = useMemo(() => defineGuarantorFieldVisibility(ability), [ability]);

const columns = useMemo(() => generateColumns(visibility), [visibility]);

const table = useReactTable({ data, columns, ... });
```

**Returns:**

```ts
{
  table, filters, pagination, sorting, visibility; // Pass visibility for conditional rendering in the Table component
}
```

#### `useXView()` _(optional)_

Used in:

- View pages (`/view/page.tsx`)
- Displays fields dynamically based on CASL and field formatting (formatting might use `src/lib/displayUtils.ts`)
- Can include derived state (e.g., `isFullyVerified`)

**Returns:**

```ts
{
  visibility, // computed using defineXFieldVisibility and ability from @/lib/casl
    derivedFields,
    formattedValues; // potentially using functions from @/lib/displayUtils.ts
}
```

### CASL Integration Pattern

Always compute field visibility using the model-specific definition function, which internally uses the `AppAbility` instance derived from `/src/lib/casl`:

```ts
import { useAbility } from "@/lib/casl/caslProvider";
import { useMemo } from "react";
import { defineModelFieldVisibility } from "../lib/defineModelFieldVisibility"; // Path relative to hook

// ...
const ability = useAbility();
const visibility = useMemo(() => defineModelFieldVisibility(ability), [ability]);
```

### Testable Returns

| Hook                  | Key Return                                       |
| --------------------- | ------------------------------------------------ |
| `useGuarantorForm()`  | `form`, `visibility`, `isEditMode`               |
| `useGuarantorTable()` | `filters`, `pagination`, `columns`, `visibility` |
| `useGuarantorView()`  | `visibility`, `derivedFields`, `formattedValues` |

---

## Components

Render-only logic. Stateless and presentation-focused.
All components are designed to be **pure**, **stateless**, and **style-consistent**, built with **shadcn/ui** and **Tailwind CSS**. Formatting data for display might involve helpers from `src/lib/displayUtils.ts`. Charts would use `src/lib/chartUtils.ts`.

- `UserForm.tsx`
- `UserStatusBadge.tsx`
- Use `useTranslations("Component")` for i18n
- Conditionally render based on Visibility map passed from the hook:

```tsx
{
  visibility.firstName && <FormField name="firstName" /* ...other props... */ />;
}
```

### Responsibilities

✅ Accept props only — do not fetch data
✅ Accept visibility map if needed (from hook)
✅ Stateless except for UI toggles (accordion, expand/collapse)
✅ Use composition: avoid nesting too much logic
✅ Style using Tailwind utility classes + `shadcn` slots
✅ Use display helpers (e.g., from `src/lib/displayUtils.ts`) for formatting data passed via props.

### Testing Philosophy

These components should be:

- 🧼 Easy to snapshot test
- 🎯 Driven by props and layout logic
- 🔍 Consistent across pages (e.g., `ViewUser`, `ViewGuarantor`)

### Suggested Composition

Example View Section:

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { InfoField } from "@/components/ui/info-field"; // Assuming a shared InfoField component
import { formatDate } from "@/lib/displayUtils"; // Example usage of display util
// first get the visibility map from the hook
const ability = useAbility();
const visibility = useMemo(() => defineModelFieldVisibility(ability), [ability]);

// ...then inside component ...
<Card>
  <CardHeader>
    <CardTitle>Basic Details</CardTitle>
  </CardHeader>
  <CardContent className="grid grid-cols-2 gap-4">
    {visibility.firstName && <InfoField label="First Name" value={user.firstName} />}
    {visibility.lastName && <InfoField label="Last Name" value={user.lastName} />}
    {visibility.email && <InfoField label="Email" value={user.email} />}
    {/* Example using a display util */}
    {visibility.createdAt && <InfoField label="Created At" value={formatDate(user.createdAt)} />}
  </CardContent>
</Card>;
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
- 🔐 Use `define<FieldName>FieldVisibility(ability)` (from model's `/lib`, using core ability from `src/lib/casl`) to include/exclude columns:

```ts
// Inside useXTable.ts or a helper function it calls
import { defineGuarantorFieldVisibility } from "../lib/defineGuarantorFieldVisibility";
import { useAbility } from "@/lib/casl/caslProvider";

const ability = useAbility();
const visibility = defineGuarantorFieldVisibility(ability);

const columns = [
  visibility.firstName && { accessorKey: "firstName", header: "First Name" /* ... */ },
  visibility.lastName && { accessorKey: "lastName", header: "Last Name" /* ... */ },
  visibility.email && { accessorKey: "email", header: "Email" /* ... */ },
  // Filter out columns where visibility is false
].filter(Boolean);
```

> 🧠 Always build lists as a **single source of truth**, combining table state with UI filters and global search.

---

## Server Actions

Server actions. Always `async`, `use server`.

- `createUser.ts`
- `updateUser.ts`
- Return typed `ActionResponse<T>` (defined in `@/types/globalTypes.ts`)
- Use `getTranslations()` (from `next-intl/server`, potentially using helpers from `src/lib/serverTranslationUtil.ts`) and validate with schema
- Can use CASL ability checks (using helpers/ability instance from `src/lib/casl`)
- Must use the shared Prisma instance from `src/lib/prisma`:
- Use `getServerSessionUser` from `src/lib/getServerUser.ts` to identify the user in server components:

```ts
"use server";

import { getServerSessionUser } from "@/lib/getServerUser";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getUserRoles } from "@/contexts/actions/user-actions";

export async function getServerSessionUser() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user) {
    const { success, data: roles } = await getUserRoles(user.id);

    if (success && roles && roles.length > 0) {
      // Filter out roles with null bankId and exclude "APPLICANT" role. What remains should be the employee role
      // TODO this needs to be worked out when we have Applicant logins
      let currentRole = roles.filter((r) => r.bankId !== null && r.role !== "APPLICANT")[0];

      console.log("Current Role:", currentRole, roles);

      return {
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        email: user.email,
        phoneNumber: user.phone,
        id: user.id,
        roles: roles,
        currentRole: currentRole,
      };
    }
  }

  if (error || !user) return null;
}
```

Using Prisma:

```ts
import { prisma } from "@/lib/prisma";
```

> ❌ Never instantiate a new `PrismaClient`. Always import the singleton.

### Server Action Response Contract

To ensure all server actions return a consistent format, always use the following types (defined in `/src/types/globalTypes.ts`):

```ts
export type SuccessResponse<T> = {
  success: true;
  message: string;
  data?: T;
  meta?: Record<string, any>;
};

export type ErrorResponse = {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string>;
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

Each model should include a utility (`define<FieldName>FieldVisibility.ts` in its own `lib` folder) that defines which fields are visible or editable to each role. This utility is backed by **CASL's `can()` logic** (using the `AppAbility` type and potentially helpers from `src/lib/casl`), but presents the result in a clean, static object for UI rendering.

This enables:

- Clean **form rendering** with only permitted fields
- Secure **data masking** in lists or views
- Seamless integration with CASL for authorization decisions

#### File Placement

```bash
/src/app/[locale]/saas/(private)/{modelName}/lib/defineGuarantorFieldVisibility.ts
```

#### CASL-backed Field Visibility

```ts
// Inside /src/app/[locale]/saas/(private)/{modelName}/lib/defineGuarantorFieldVisibility.ts
import { AppAbility } from "@/lib/casl/ability";

export function define{ModelName}FieldVisibility(ability: AppAbility) {
  return {
    firstName: ability.can("read", "Guarantor", "firstName"),
    lastName: ability.can("read", "Guarantor", "lastName"),
    email: ability.can("read", "Guarantor", "email"),
    mobileNumber: ability.can("read", "Guarantor", "mobileNumber"),
    documents: ability.can("read", "Guarantor", "documents"),
    canUpdateFirstName: ability.can("update", "Guarantor", "firstName"),
  };
}

export type {ModelName}FieldVisibility = ReturnType<typeof define{modelName}FieldVisibility>;
```

#### In Form UI (Component receiving visibility map from hook)

```tsx
// Inside GuarantorForm.tsx or similar
// Props include: visibility: GuarantorFieldVisibility

{
  visibility.firstName && <FormField name="firstName" disabled={!visibility.canUpdateFirstName} /* ... */ />;
}
{
  visibility.email && <FormField name="email" disabled={!visibility.canUpdateEmail} /* ... */ />;
}
```

#### Why not just use `ability.can()` inline?

- It's **verbose**: calling `.can(...)` for each field
- It's **repetitive**: pollutes JSX with logic
- It's **unscalable**: hard to reuse or loop over fields

Instead:

- Call `defineFieldVisibility(ability)` once in the hook
- Pass the returned object (`visibility`) as a prop to the component
- Use the `visibility` object in the component to control rendering and disabling declaratively
- Centralize visibility logic for each model in its `lib` folder (using the core `AppAbility` from `src/lib/casl`)

### Sample Access Matrix (Best Guess)

| Field             | CLERK | INSPECTOR | LOAN_OFFICER | CEO | COMMITTEE | BOARD | BANK_ADMIN | SAAS_ADMIN | APPLICANT |
| ----------------- | ----- | --------- | ------------ | --- | --------- | ----- | ---------- | ---------- | --------- |
| firstName         | ✅    | ✅        | ✅           | ✅  | ✅        | ✅    | ✅         | ✅         | ❌        |
| lastName          | ✅    | ✅        | ✅           | ✅  | ✅        | ✅    | ✅         | ✅         | ❌        |
| email             | ❌    | ❌        | ✅           | ✅  | ✅        | ✅    | ✅         | ✅         | ❌        |
| mobileNumber      | ✅    | ✅        | ✅           | ✅  | ✅        | ✅    | ✅         | ✅         | ❌        |
| documents         | ❌    | ✅        | ✅           | ✅  | ✅        | ✅    | ✅         | ✅         | ❌        |
| loanApplicationId | ✅    | ✅        | ✅           | ✅  | ✅        | ✅    | ✅         | ✅         | ❌        |

> ❗ APPLICANTs are never allowed to see internal data unless explicitly permitted for onboarding use-cases.

> 💡 Use these as defaults; override per model as needed within the CASL ability definitions (`src/lib/casl/ability.ts` or similar).

---

## Translation Standards

### Per-Model Translation Namespace

Every model must use its own namespace inside `/messages/en.json` and `/messages/hi.json`:

```json
{
  "<ModelName>": {
    "form": {},
    "validation": {},
    "errors": {},
    "toast": {},
    "list": {}
  }
}
```

### Section Breakdown

| Section      | Purpose                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| `form`       | Labels, placeholders, button text                                                                          |
| `validation` | Field-level Zod validation messages (keys used in schema definitions)                                      |
| `errors`     | Server error messages (keys returned by server actions, potentially using `src/lib/actionErrorHelpers.ts`) |
| `toast`      | Success/failure messages (keys used with `src/lib/toastUtils.ts`)                                          |
| `list`       | Column headers, filter labels, tab headings                                                                |

### Usage Examples

Client-side (Component/Hook):

```ts
import { useTranslations } from "next-intl";

const t = useTranslations("Guarantors");

t("form.firstName.label");
t("form.submit.loading");
```

Zod Schema:

```ts
z.string().min(1, { message: "validation.firstName.required" });
```

Server Action (Returning error key):

```ts
return { success: false, message: "errors.notFound" };
```

Server Action (Translating error key before sending):

```ts
import { getTranslations } from "next-intl/server";

const t = await getTranslations({ locale, namespace: "Guarantors" });

const rawError = handleActionError(err);

return {
  ...rawError,
  message: t(rawError.message),
  errors: rawError.errors
    ? Object.fromEntries(Object.entries(rawError.errors).map(([key, msg]) => [key, t(msg)]))
    : undefined,
};
```

> 🔁 Zod schemas use only translation **keys**, never hardcoded strings 🔁 Server actions return error keys → translated on server via `getTranslations()` or on the client via `useTranslations()`.

### Always Generate Hindi Strings Alongside English

Every translation key added to the English `en.json` must also be added to the Hindi `hi.json` file with an appropriate localized equivalent. This ensures:

- Complete bilingual coverage
- No runtime fallback issues
- Smooth language switching experience

### Handling Translations for Server Errors

To support localized error messages returned from server actions:

1.  Server actions should ideally return **message keys** (using helpers like `src/lib/actionErrorHelpers.ts` might standardize this):

```ts
// Inside a server action using a helper from @/lib/actionErrorHelpers.ts
import { createActionError } from "@/lib/actionErrorHelpers";

// ... some error condition ...
// Return the keys directly
return createActionError({ type: "validation", error: validation.error });
// This might produce:
// {
//   success: false,
//   message: "errors.validationFailed", // Key
//   errors: { // Optional field-specific keys
//     email: "validation.email.invalid"
//   }
// };
```

2.  Translate these keys before displaying them to the user. This can happen either:
    - **On the Server**: Before returning the `ActionResponse`, translate the keys using `getTranslations()` (potentially wrapped in a helper from `src/lib/serverTranslationUtil.ts`). This sends fully translated messages to the client.
    - **On the Client**: The client receives the `ActionResponse` with keys and uses `useTranslations()` to look up the localized strings before rendering them (e.g., inside `handleFormErrors` or `toastErrorFromResponse`).

**Client-Side Translation Example (within error handling utils):**

```ts
// Example modification to handleFormErrors in @/lib/formErrorHelper.ts
import { useTranslations } from "next-intl";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toastErrorFromResponse } from "@/lib/toastUtils";
import { ActionResponse } from "@/types/globalTypes";

// Assume the component calling this passes the 't' function
export function handleFormErrors<T extends FieldValues>(
  response: ActionResponse<any>,
  setError: UseFormSetError<T>,
  t?: (key: string) => string, // Optional translation function
): void {
  if (response.success) return;

  const { errors, message } = response;

  // Map field-specific errors to the form
  if (errors) {
    Object.entries(errors).forEach(([key, msgKey]) => {
      // 'root' errors are typically for toast messages, not specific fields
      if (key !== "root") {
        setError(key as Path<T>, {
          type: "manual",
          // Translate here if 't' is provided and msgKey is a key, otherwise use msgKey directly
          message: t ? t(String(msgKey)) : String(msgKey),
        });
      }
    });
  }

  // Trigger toast notification
  toastErrorFromResponse({ message, errors }, t); // Pass 't' if needed
}
```

Choose one approach (server-side or client-side translation of action responses) and apply it consistently. Client-side translation might be simpler if `useTranslations` is readily available where errors are handled.

---

## Error Handling

### Form Error Handling & Toasting Pattern

Use utilities from `src/lib/formErrorHelper.ts` and `src/lib/toastUtils.ts` to map `ActionResponse` errors to React Hook Form and display toast notifications.

#### Utility to map `ActionResponse` errors to RHF (`src/lib/formErrorHelper.ts`)

```ts
// src/lib/formErrorHelper.ts
import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toastErrorFromResponse } from "@/lib/toastUtils";
import { ActionResponse } from "@/types/globalTypes";

/**
 * Maps errors from an ActionResponse to react-hook-form and displays toasts.
 * Assumes translation happens either before this call (server-side)
 * or within toastErrorFromResponse (client-side).
 *
 * @param response The ActionResponse from the server action.
 * @param setError The setError function from react-hook-form's useForm.
 * @param t Optional translation function.
 */
export function handleFormErrors<T extends FieldValues>(
  response: ActionResponse<any>,
  setError: UseFormSetError<T>,
  t?: (key: string) => string, // Optional translation function
): void {
  if (response.success) return;

  const { errors, message } = response;

  // Map field-specific errors to the form
  if (errors) {
    Object.entries(errors).forEach(([key, msg]) => {
      // 'root' errors are typically for toast messages, not specific fields
      if (key !== "root") {
        setError(key as Path<T>, {
          type: "manual",
          // Translate here if 't' is provided and msg is a key, otherwise use msg directly
          message: t ? t(String(msg)) : String(msg),
        });
      }
    });
  }

  // Trigger toast notification
  toastErrorFromResponse({ message, errors }, t); // Pass 't' if needed
}
```

#### Toast error adapter (`src/lib/toastUtils.ts`):

```ts
// src/lib/toastUtils.ts
import { toast } from "sonner"; // Assuming sonner is used for toasts
import { ErrorResponse } from "@/types/globalTypes";

// Basic toast functions (can be customized)
export function toastSuccess(options: { title: string; description?: string }) {
  toast.success(options.title, { description: options.description });
}

export function toastError(options: { title: string; description?: string }) {
  toast.error(options.title, { description: options.description });
}

/**
 * Displays an error toast based on an ErrorResponse structure.
 * Handles translation if 't' function is provided.
 *
 * @param response Part of the ErrorResponse containing message and errors.
 * @param t Optional translation function.
 */
export function toastErrorFromResponse(
  response: Pick<ErrorResponse, "message" | "errors">,
  t?: (key: string) => string, // Optional translation function
) {
  if (process.env.NODE_ENV === "development") {
    console.error("[toastErrorFromResponse]", response);
  }

  let title = "Error"; // Default title
  let description = response.message || "An unexpected error occurred"; // Default description

  // Prefer root error if available
  if (response.errors?.root) {
    title = "Something went wrong"; // Or use a translatable key
    description = response.errors.root;
  }

  // Translate title and description if 't' is available and messages are keys
  if (t) {
    // Attempt to translate - assumes 'message' and 'errors.root' are keys
    // You might need a more robust way to know if a string is a key
    title = t(title); // Translate default title if needed
    description = t(description);
  }

  toastError({ title, description });
}

// You might also export other helpers like toastInfo, toastWarning etc.
```

### Common Error Handling Anti-Patterns to Avoid

| Violation                                | Fix                                                                                            | Relevant `/src/lib` Utility/Concept                            |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Hardcoding error messages in code        | Use translation keys; translate at display point (client) or before response (server)          | `serverTranslationUtil.ts`                                     |
| Using try/catch without proper typing    | Cast errors, use error factories, or use helpers                                               | `actionErrorHelpers.ts`                                        |
| Inconsistent error response formats      | Always use `ActionResponse`, `handleActionError`, `handleFormErrors`, `toastErrorFromResponse` | `actionErrorHelpers.ts`, `formErrorHelper.ts`, `toastUtils.ts` |
| Missing field-level error mapping        | Use `handleFormErrors` utility                                                                 | `formErrorHelper.ts`                                           |
| Using `alert()` or raw `console.error()` | Use toast notifications via helper functions                                                   | `toastUtils.ts`                                                |
| Returning raw Prisma/DB errors to client | Catch specific errors, map to user-friendly translation keys using `actionErrorHelpers.ts`     | `actionErrorHelpers.ts`                                        |

---

## Documentation Standards

Comprehensive documentation is essential for the maintainability and scalability of the CreditIQ application. This section outlines the documentation requirements and standards to ensure consistency and clarity across the codebase. Utilities from `/src/lib` should also adhere to these standards.

### JSDoc Standards

All functions, hooks, and components must be documented using JSDoc comments. This includes server actions, utility functions (including those in `/src/lib`), hooks, and React components. Always use multiline or block comments. No single line comment.

#### Function and Method Documentation

```typescript
/**
 * Creates a new guarantor in the database
 *
 * @param {CreateGuarantorInput} data - The validated guarantor data
 * @returns {Promise<ActionResponse<Guarantor>>} Response with created guarantor or error
 * @throws Will throw an error if user lacks permission to create guarantors
 */
export async function createGuarantor(data: CreateGuarantorInput): Promise<ActionResponse<Guarantor>> {
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
export function GuarantorForm({ initialData, loanApplicationId, readOnly = false }: GuarantorFormProps): JSX.Element {
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
export function useGuarantorForm({ initialData, loanApplicationId }: UseGuarantorFormOptions): GuarantorFormHookReturn {
  // Implementation...
}
```

#### Type Definitions Documentation

```typescript
/**
 * Defines the structure for field visibility and editability for the Guarantor model.
 * Generated by `defineGuarantorFieldVisibility` using `AppAbility` from `/src/lib/casl`.
 *
 * @typedef {object} GuarantorFieldVisibility
 * @property {boolean} firstName - True if user can read the first name field.
 * @property {boolean} lastName - True if user can read the last name field.
 * @property {boolean} email - True if user can read the email field.
 * @property {boolean} canUpdateFirstName - True if user can update the first name field.
 * // ... other fields for read/update permissions
 */
```

### README Requirements for Model Folders

Each model folder must include a README.md file that explains the model's purpose, structure, and usage. The README should reference relevant `/src/lib` utilities where applicable (e.g., CASL setup, display formatting).

#### Model README Template

````markdown
# Guarantor Model

## Overview

Brief description of what the guarantor model represents in the system and its business purpose. It utilizes core architecture components like Prisma (`@/lib/prisma`), CASL (`@/lib/casl`), and shared utilities (`@/lib/utils`, `@/lib/displayUtils`).

## Model Schema

```typescript
// Defined in /schemas/guarantorSchema.ts
model Guarantor {
  id              String   @id @default(cuid())
  firstName       String
  lastName        String
  email           String   @unique
  // ... other fields
}
```
````

## Key Relationships

- Belongs to a LoanApplication (many-to-one)
- ... other relationships

## Business Rules

1. A guarantor must have a valid email address (enforced by `guarantorSchema.ts`).
2. A guarantor must be associated with exactly one loan application.
3. Field access is controlled by CASL rules defined in `@/lib/casl`.
4. ... other business rules

## Permission Matrix (Controlled by `@/lib/casl`)

| Field     | CLERK | INSPECTOR | LOAN_OFFICER | CEO | COMMITTEE | BANK_ADMIN | Notes                                            |
| --------- | ----- | --------- | ------------ | --- | --------- | ---------- | ------------------------------------------------ |
| firstName | R/W   | R         | R/W          | R   | R         | R/W        | Read/Write based on `ability.can('update', ...)` |
| lastName  | R/W   | R         | R/W          | R   | R         | R/W        | Read/Write based on `ability.can('update', ...)  |

| ... other fields

## API Endpoints (Server Actions)

- `createGuarantor` - Creates a new guarantor (`/actions/createGuarantor.ts`)
- `getGuarantors` - Retrieves guarantors (`/actions/getGuarantors.ts`)
- ... other actions

## UI Components

- `/guarantors/create/page.tsx` - Form to create a new guarantor. Uses `GuarantorForm`, `useGuarantorForm`.
- `/guarantors/[id]/edit/page.tsx` - Form to edit an existing guarantor. Uses `GuarantorForm`, `useGuarantorForm`.
- `/guarantors/list/page.tsx` - Table view. Uses `GuarantorTable`, `useGuarantorTable`.
- Data display uses formatting from `@/lib/displayUtils`.

## Key Utilities Used

- `@/lib/prisma`: Database access.
- `@/lib/casl`: Permissions definition and checking.
- `@/lib/getServerUser`: Authenticated user retrieval in actions.
- `@/lib/toastUtils`: User feedback notifications.
- `@/lib/actionErrorHelpers`: Standardizing server action errors.
- `@/lib/formErrorHelper`: Mapping action errors to forms.

````

### API Documentation Standards

Server actions and API endpoints should be thoroughly documented with request/response examples, validation rules, and error scenarios. Mention relevant `/src/lib` utilities used (e.g., `getServerUser`, `prisma`, `actionErrorHelpers`).

#### Server Action Documentation

Each server action file should include:

```typescript
/**
 * @fileoverview
 * Server action to create a new guarantor in the system.
 * Validates the input data, checks user permissions via CASL
 * (using ability from `@/lib/casl`), inserts the guarantor into the database,
 * and returns a standardized `ActionResponse` (potentially using `@/lib/actionErrorHelpers`).
 */

import { prisma } from "@/lib/prisma";
import { getServerSessionUser } from "@/lib/getServerUser";
import { createGuarantorSchema, CreateGuarantorInput } from "../schemas/guarantorSchema";
import { ActionResponse } from "@/types/globalTypes";
import { getAbility } from "@/lib/casl/getAbility"; // Helper to get ability on server
import { handleActionError } from "@/lib/actionErrorHelpers"; // Error handling helper
import { getTranslations } from "next-intl/server";
// Assume Guarantor type is imported from Prisma client

/**
 * Creates a new guarantor
 *
 * @param {CreateGuarantorInput} data - The guarantor data (pre-validation recommended but action should re-validate).
 * @returns {Promise<ActionResponse<Guarantor>>} Response with created guarantor or error details.
 * @throws Will throw if fundamental issues occur (e.g., DB connection), but returns ActionResponse for permission/validation errors.
 *
 * @example
 * // Success case
 * const response = await createGuarantor({ // Valid input data });
 * // => { success: true, message: "Guarantors.toast.created", data: { id: "clq...", ... } } // Message is key
 *
 * @example
 * // Error case - validation failure
 * const response = await createGuarantor({ firstName: "", /* ... other invalid data ... */ });
 * // => { success: false, message: "errors.validationFailed", errors: { firstName: "First name is required" } } // Keys
 */
export async function createGuarantor(
  rawData: CreateGuarantorInput // Ideally validated on client, but re-validate here
): Promise<ActionResponse<Guarantor>> { // Guarantor type from Prisma
  try {
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" }; // Use key
    }

    const ability = await getAbility(user); // Get ability using helper from @/lib/casl
    if (!ability.can('create', 'Guarantor')) {
      return { success: false, message: "errors.unauthorized" }; // Use key
    }

    const validation = createGuarantorSchema.safeParse(rawData);
    if (!validation.success) {
      // Use helper to format validation errors with keys
      return handleActionError({ type: "validation", error: validation.error });
      // Example output: { success: false, message: "errors.validationFailed", errors: { firstName: "First name is required" } }
    }

    const validatedData = validation.data;

    const newGuarantor = await prisma.guarantor.create({
      data: {
        ...validatedData,
        // Add createdById, bankId etc. based on user/context if needed
      },
    });

    // Use a standard success key
    return { success: true, message: "Guarantors.toast.created", data: newGuarantor };

  } catch (error) {
    // Use helper to handle unexpected errors, logging, and return generic error key
    return handleActionError({ type: "unexpected", error });
    // Example output: { success: false, message: "errors.unexpected" }
  }
}
````

#### API Response Standards

Document expected response formats with examples, emphasizing the use of translation keys for messages.

```typescript
/**
 * Standard ActionResponse format (defined in `/src/types/globalTypes.ts`)
 * Messages and errors should contain translation keys.
 *
 * @example
 * // Success response
 * {
 *   "success": true,
 *   "message": "Guarantors.toast.created", // Translation key
 *   "data": { // Prisma Guarantor model
 *     "id": "clq1234abcdef",
 *     "firstName": "John",
 *     "lastName": "Doe",
 *     // Other fields...
 *   },
 *   "meta": { // Optional metadata
 *     "timestamp": "2023-04-01T12:00:00Z"
 *   }
 * }
 *
 * @example
 * // Error response
 * {
 *   "success": false,
 *   "message": "errors.validationFailed", // General validation error key
 *   "code": "VALIDATION_ERROR", // Optional code from actionErrorHelpers
 *   "errors": { // Field-specific error keys
 *     "email": "Email already exists"
 *   }
 * }
 */
```

### Comment Styles and Conventions

#### Code Section Comments

Use block comments to separate logical sections within larger files, including in `/src/lib` utilities.

```typescript
// src/lib/displayUtils.ts

/*
 * String Manipulation Utilities
 * -----------------------------------------------------------------------------
 */

export function capitalizeWords(str: string | undefined | null): string  {
  /* ... */
}

/*
 * Number Formatting Utilities
 * -----------------------------------------------------------------------------
 */

export function formatCurrency(amount: number): string {
  /* ... */
}

/*
 * Validation Helpers
 * -----------------------------------------------------------------------------
 */
```

#### Implementation Notes

Explain complex algorithms or non-obvious code, especially in shared `/src/lib` files.

```typescript
// src/lib/chartUtils.ts

/*
 * This function aggregates data points by month.
 * It handles sparse data by ensuring all months in the range are present,
 * filling missing months with a value of 0.
 * This prevents gaps in the time-series chart presentation.
 */
export function aggregateDataByMonth(data: DataPoint[]): MonthlyData[] {
  // Implementation...
}
```

#### Warning Comments

Highlight potential gotchas or edge cases in `/src/lib` utilities that consumers should be aware of.

```typescript
/*
 * WARNING: This utility performs a shallow merge. Nested objects will be
 * overwritten, not merged. Use deepMerge utility for nested structures.
 * Consider library like lodash/merge for robust deep merging.
 */
export function shallowMerge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}
```

### Documentation Checklist

For each feature or model implementation, ensure the following documentation exists:

- [ ] All exported functions, hooks, and components have JSDoc comments
- [ ] The model folder contains a README.md with the required sections
- [ ] Server actions include usage examples with success/error cases
- [ ] Complex logic has explanatory comments
- [ ] Type definitions are documented
- [ ] Permission rules and field visibility are documented
- [ ] API endpoints list expected inputs and outputs

By following these documentation standards, the CreditIQ codebase, including its foundational `/src/lib` utilities, will remain accessible to new team members and maintainable as it grows over time. Good documentation reduces onboarding friction, prevents knowledge silos, and promotes consistent implementation patterns across the application.

---

## Common Anti-Patterns

### Component Anti-Patterns

- ❌ Fetching data within component (use hooks/server actions)
- ❌ Including `useAbility` directly (pass `visibility` map from hooks, which get ability from `src/lib/casl`)
- ❌ Writing conditional logic inside UI files (move to hooks)
- ❌ Mixing forms and render-only blocks (separate concerns)
- ❌ Defining types inline (use schema/inferred types)
- ❌ Directly using Prisma Client (only in server actions, importing from `src/lib/prisma`)
- ❌ Manual data formatting (use helpers from `src/lib/displayUtils.ts`)

### Common Violations to Avoid

| Violation                               | Fix                                                                                     | Relevant `/src/lib` Utility/Concept                            |
| --------------------------------------- | --------------------------------------------------------------------------------------- |----------------------------------------------------------------|
| Calling `t()` inside schema             | Use error keys; translate at display point (client) or before response (server)         | `serverTranslationUtil.ts` (for server)                        |
| Performing mutation in JSX `onClick`    | Move logic to hook handler, which calls server action                                   | N/A (Architecture pattern)                                     |
| Checking `ability.can()` in schema/util | Check permissions in server action or hook using ability instance                       | `casl/`                                                        |
| Defining RHF logic in component         | Move to `useXYZForm()` hook                                                             | N/A (Architecture pattern)                                     |
| Mixing translation strings & data logic | Isolate translations to UI layer or server response formatting                          | `serverTranslationUtil.ts`                                     |
| Creating `new PrismaClient()` manually  | Always use singleton `import { prisma } from "@/lib/prisma"`                            | `prisma/`                                                      |
| Inconsistent error handling/formats     | Use `ActionResponse`, `handleActionError`, `handleFormErrors`, `toastErrorFromResponse` | `actionErrorHelpers.ts`, `formErrorHelper.ts`, `toastUtils.ts` |
| Hardcoding Supabase/Backblaze clients   | Use shared clients/helpers                                                              | `supabase/`, `backblaze/`                                      |

---

## Testing Standards

### Overview

The CreditIQ application follows a comprehensive testing strategy that aligns with its model-based architecture. This document outlines our testing approach, folder structure, and best practices for writing effective tests across all layers of the application, including interactions with `/src/lib` utilities.

### Testing Philosophy

Our testing approach is built on three main pillars:

1.  **Unit Testing**: Test individual functions, hooks, utils (including those in `/src/lib`), and schemas in isolation
2.  **Component Testing**: Test UI components, form fields, and interactive elements with React Testing Library
3.  **Integration Testing**: Test workflows that span multiple components and server actions

### Folder Structure

Tests are co-located with source code in dedicated `tests` folders within each model directory. Tests for `/src/lib` utilities should reside within `/src/lib` itself, possibly in a `__tests__` subdirectory or alongside the file (e.g., `utils.test.ts`).

```
/src/app/[locale]/saas/(private)/guarantor/
├── /tests/                    # Model-specific tests
│   ├── /components/
│   │   └── GuarantorForm.test.tsx
│   ├── /hooks/
│   │   └── useGuarantorForm.test.ts
│   ├── /schemas/
│   │   └── guarantorSchema.test.ts
│   ├── /actions/
│   │   ├── createGuarantor.test.ts
│   └── /lib/
│       └── defineGuarantorFieldVisibility.test.ts
```

Global test utilities and setup files are located in the following folders (outside `/src/lib`):

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
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig: Config = {
  setupFilesAfterEnv: ["<rootDir>/src/jest/setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}", "!src/**/*.d.ts", "!src/**/_mocks__/**", "!src/**/node_modules/**"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
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

Test Zod schemas for validation rules, error messages, and type inference. Following is an example of a schema test for the `createGuarantorSchema`:

```typescript
import { createGuarantorSchema } from "@/app/[locale]/saas/(private)/guarantor/schemas/guarantorSchema";

describe("Guarantor Schema", () => {
  it("should validate a valid guarantor", () => {
    const validGuarantor = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      loanApplicationId: "loan123",
    };

    const result = createGuarantorSchema.safeParse(validGuarantor);
    expect(result.success).toBe(true);
  });

  it("should return validation errors for invalid data", () => {
    const invalidGuarantor = {
      firstName: "",
      lastName: "Doe",
      email: "invalid-email",
      loanApplicationId: "loan123",
    };

    const result = createGuarantorSchema.safeParse(invalidGuarantor);
    expect(result.success).toBe(false);

    if (!result.success) {
      const formattedErrors = result.error.format();
      expect(formattedErrors.firstName?._errors).toContain("validation.firstName.required");
      expect(formattedErrors.email?._errors).toContain("validation.email.invalid");
    }
  });
});
```

### 2. Hook Testing

Test custom hooks for logic, state management, and interaction with `/src/lib` utilities (like CASL).

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
    <AbilityProvider ability={ability}>
      {children}
    </AbilityProvider>
  );
};

describe('useGuarantorForm', () => {
  it('should initialize form with default values', () => {
    const { result } = renderHook(() => useGuarantorForm({ loanApplicationId: 'loan123' }), { wrapper });

    expect(result.current.form).toBeDefined();
    expect(result.current.visibility).toBeDefined();
    expect(result.current.isEditMode).toBe(false);
  });

  it('should compute field visibility based on ability', () => {
    const { result } = renderHook(() => useGuarantorForm({ loanApplicationId: 'loan123' }), { wrapper });

    expect(result.current.visibility.firstName).toBe(true);
    expect(result.current.visibility.lastName).toBe(true);
  });
});
```

### 3. Component Testing

Test components for rendering, interactions, and conditional display based on props (like `visibility` map).

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuarantorForm } from '@/app/[locale]/saas/(private)/guarantor/components/GuarantorForm/GuarantorForm';
import { renderWithProviders } from '@/test-utils/render-helpers';
import { testAbilities } from '@/test-utils/ability-setup';

describe('GuarantorForm', () => {
  it('should render fields based on visibility prop (LOAN_OFFICER)', () => {
    renderWithProviders(
      <GuarantorForm loanApplicationId="loan123" />,
      { ability: testAbilities.LOAN_OFFICER }
    );

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
  });

  it('should hide email field based on visibility prop (CLERK)', () => {
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

Test server actions for validation, permission checks (using mocked ability from `/src/lib/casl`), database interactions (using mocked Prisma from `/src/lib/prisma`), and error handling (using `@/lib/actionErrorHelpers`).

```typitten
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
import { defineGuarantorFieldVisibility } from "@/app/[locale]/saas/(private)/guarantor/lib/defineGuarantorFieldVisibility";
import { createTestAbility, testAbilities } from "@/test-utils/ability-setup";

describe("defineGuarantorFieldVisibility", () => {
  it("should show all fields for LOAN_OFFICER", () => {
    const visibility = defineGuarantorFieldVisibility(testAbilities.LOAN_OFFICER);

    expect(visibility.firstName).toBe(true);
    expect(visibility.lastName).toBe(true);
    expect(visibility.email).toBe(true);
    expect(visibility.mobileNumber).toBe(true);
    expect(visibility.documents).toBe(true);
  });

  it("should hide sensitive fields for CLERK", () => {
    const visibility = defineGuarantorFieldVisibility(testAbilities.CLERK);

    expect(visibility.firstName).toBe(true);
    expect(visibility.lastName).toBe(true);
    expect(visibility.email).toBe(false);
    expect(visibility.mobileNumber).toBe(true);
    expect(visibility.documents).toBe(false);
  });

  it("should allow only view access for COMMITTEE", () => {
    const ability = createTestAbility([
      { action: "read", subject: "Guarantor", fields: ["firstName", "lastName", "email"] },
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
import { setupTestForm, generateMockFormData } from "@/test-utils/form-helpers";
import { createGuarantorSchema } from "@/app/[locale]/saas/(private)/guarantor/schemas/guarantorSchema";

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
import { prisma } from "@/jest/mocks";

// Setup mock responses
prisma.guarantor.findMany.mockResolvedValue([{ id: "1", firstName: "John", lastName: "Doe" }]);

// Verify calls
expect(prisma.guarantor.create).toHaveBeenCalledWith({
  data: expect.objectContaining({ firstName: "John" }),
});
```

### Best Practices

### 1. Test Structure

Follow the AAA pattern (Arrange, Act, Assert):

```typescript
it("should do something", () => {
  // Arrange - set up test data and conditions
  const testData = {
    /* ... */
  };

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
it("should hide email field for users without read permissions", () => {});

// Bad
it("test email visibility", () => {});
```

### 3. Mock External Dependencies

Always mock external services, APIs, and databases:

```typescript
// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: "1", name: "Test User" }),
    },
  },
}));

// Mock server action
jest.mock("@/app/[locale]/saas/(private)/guarantor/actions/createGuarantor", () => ({
  createGuarantor: jest.fn().mockResolvedValue({
    success: true,
    data: { id: "1" },
  }),
}));
```

### 4. Testing Translations

For components using internationalization:

```typescript
// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key) => key, // Returns the key as the translation
}));

// Verify translation keys
expect(screen.getByText("Guarantors.form.firstName.label")).toBeInTheDocument();
```

### 5. Testing Form Validation

Test both valid and invalid form submissions:

```typescript
// Valid submission
await userEvent.type(screen.getByLabelText(/email/i), "valid@example.com");
await userEvent.click(screen.getByRole("button", { name: /submit/i }));
expect(mockSubmit).toHaveBeenCalled();

// Invalid submission
await userEvent.type(screen.getByLabelText(/email/i), "invalid-email");
await userEvent.click(screen.getByRole("button", { name: /submit/i }));
expect(screen.getByText("validation.email.invalid")).toBeInTheDocument();
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

# Run tests for a specific file or pattern
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

Following these testing guidelines ensures that the CreditIQ application maintains high quality, reliability, and consistency. Tests should focus on validating business rules, permissions, and user interactions to create a robust application.

---

# Prisma Model to CreditIQ Architecture Prompt

## Task Description

Generate a complete set of files for a Next.js CreditIQ application based on the provided Prisma model. Follow the CreditIQ Architecture Guidelines to create a fully functional, permission-aware, internationalized feature set that includes:

1.  Server actions for CRUD operations (using `@/lib/prisma`, `@/lib/casl`, `@/lib/actionErrorHelpers`)
2.  Form components with field-level permissions (using visibility map derived from `@/lib/casl`)
3.  List views with filtering, sorting, and pagination (using visibility map from `@/lib/casl`)
4.  Zod schemas for validation (potentially using helpers from `@/lib/utils`)
5.  React Hook Form integrations
6.  CASL-based permission controls
7.  Translation schemas for English and Hindi
8.  Toast notifications for user feedback (using `@/lib/toastUtils`)
9.  Form error handling connected to server responses (using `@/lib/formErrorHelper`)

## Input Instructions

Provide the following:

1.  Prisma model definition (required)
2.  Specific roles that can access this model (optional, defaults to all roles based on general rules in `@/lib/casl`)
3.  Any special validation or business logic requirements (optional)

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
│   ├── ability.ts             # Model-specific CASL subjects/actions
│   ├── helpers.ts             # Helper functions
│   └── define{ModelName}FieldVisibility.ts # Field visibility logic
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
        └── defineGuarantorFieldVisibility.test.ts
```

## Additional requirements

1.  All UI must respect field-level permissions based on user roles (using `visibility` map derived from `@/lib/casl`)
2.  All forms must validate using Zod schemas
3.  All server actions must return the standardized `ActionResponse` type
4.  All components must use internationalization with both English and Hindi translations
5.  Table views must include filtering, sorting, and pagination functionality

For the model, generate and apply all code, tests, translation keys, and documentation needed to fully comply with the CreditIQ Architecture Guidelines (as previously provided).

This includes:

- All Zod schemas (with JSDoc)
- All server actions (with JSDoc and usage examples)
- All hooks (with JSDoc)
- All components (with translation keys, no hardcoded text)
- All required test files (with realistic test cases, using translation keys)
- All i18n keys for both `en.json` and `hi.json`
- A model README.md following the template
- Any missing utility/lib files (e.g., `define{ModelName}FieldVisibility.ts`)
- All code applied directly to my codebase, not just as output
- Do not omit any section.
- Before outputting, verify that every file complies fully with the guidelines, and that all UI text uses translation keys.
- At the end, provide a summary table showing which guideline sections are satisfied by which files

In your implementation:

- Ensure all server actions properly validate input, check permissions using `@/lib/casl`, interact with DB via `@/lib/prisma`, and return typed responses using `@/lib/actionErrorHelpers`.
- Implement proper field visibility based on roles (using `define{ModelName}FieldVisibility` which relies on `@/lib/casl`).
- Include complete translations for English and Hindi.
- Implement working table features (sorting, filtering, pagination).
- Use shadcn components for the UI.
- Use `getServerSessionUser` from `@/lib/getServerUser` in actions needing user context.
- Use `toastUtils` and `formErrorHelper` from `/src/lib` for client-side error presentation.

## Key Architecture Rules to Follow

1.  Schema files should contain pure Zod schemas with no side effects
2.  Hooks should encapsulate logic, use `@/lib/casl`, don't contain JSX
3.  Components should be render-only, use field visibility patterns
4.  Server actions should validate data, implement CASL checks, and return typed responses
5.  All files must follow the naming conventions exactly
6.  Jsdoc instructions must be properly followed to the smallest detail
7.  Well-documented test files with comprehensive coverage

Remember: Do not truncate any implementations. Provide complete, functioning code that would actually work in a production environment without any bugs or TypeScript errors.
