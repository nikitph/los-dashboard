# Applicant Model

## Overview

The Applicant model represents individuals who apply for loans in the CreditIQ system. It stores personal information, identity details, address, and verification status for loan applicants. The Applicant model has relationships with multiple other entities such as LoanApplications, Documents, Dependents, Incomes, and LoanObligations. This module utilizes core architecture components like Prisma (`@/lib/prisma`), CASL (`@/lib/casl`), and shared utilities (`@/lib/utils`, `@/lib/displayUtils`).

## Model Schema

```typescript
model Applicant {
  id                       String            @id @default(dbgenerated("gen_random_uuid()"))
  userId                   String
  createdAt                DateTime          @default(now())
  updatedAt                DateTime          @updatedAt
  dateOfBirth              DateTime?
  addressState             String?
  addressCity              String?
  addressFull              String?
  addressPinCode           String?
  aadharNumber             String?
  panNumber                String?
  aadharVerificationStatus Boolean           @default(false)
  panVerificationStatus    Boolean           @default(false)
  photoUrl                 String?
  deletedAt                DateTime?
  bankId                   String
  bank                     Bank              @relation(fields: [bankId], references: [id])
  user                     UserProfile       @relation(fields: [userId], references: [id], onDelete: Cascade)
  dependents               Dependent[]
  documents                Document[]
  incomes                  Income[]
  loanApplications         LoanApplication[]
  loanObligations          LoanObligation[]
}
```

## Key Relationships

- Belongs to a Bank (many-to-one)
- Belongs to a UserProfile (many-to-one)
- Has many Dependents (one-to-many)
- Has many Documents (one-to-many)
- Has many Incomes (one-to-many)
- Has many LoanApplications (one-to-many)
- Has many LoanObligations (one-to-many)

## Business Rules

1. An applicant must have a valid user ID and bank ID.
2. Aadhar number must be a 12-digit number when provided.
3. PAN number must follow the format AAAAA9999A when provided.
4. Verification status flags track whether identity documents have been verified.
5. Applicants are never hard-deleted but soft-deleted via the `deletedAt` field.
6. Applicants with active loan applications cannot be deleted.
7. Field access is controlled by CASL rules defined in `@/lib/casl`.
8. Only users from the same bank can access/modify an applicant unless they have special permissions.

## Permission Matrix (Controlled by `@/lib/casl`)

| Field                   | CLERK | INSPECTOR | LOAN_OFFICER | CEO | COMMITTEE | BANK_ADMIN | Notes                                     |
| ----------------------- | ----- | --------- | ------------ | --- | --------- | ---------- | ----------------------------------------- |
| id                      | R     | R         | R            | R   | R         | R          | Read-only system field                    |
| userId                  | R     | R         | R            | R   | R         | R/W        | Typically set at creation                 |
| dateOfBirth             | R/W   | R         | R/W          | R   | R         | R/W        |                                           |
| address fields          | R/W   | R         | R/W          | R   | R         | R/W        | All address fields follow same pattern    |
| aadharNumber            | R/W   | R         | R/W          | R   | R         | R/W        |                                           |
| panNumber               | R/W   | R         | R/W          | R   | R         | R/W        |                                           |
| verification statuses   | -     | R/W       | R/W          | R   | R         | R/W        | Only inspectors+ can update verification  |
| bankId                  | R     | R         | R            | R   | R         | R/W        | Typically set at creation, rarely changes |
| related entities        | R     | R         | R            | R   | R         | R          | Access to lists of related entities       |
| create/delete applicant | -     | -         | R/W          | -   | -         | R/W        | Only loan officers and admins             |

## API Endpoints (Server Actions)

- `createApplicant` - Creates a new applicant (`/actions/createApplicant.ts`)
- `getApplicant` - Retrieves a single applicant by ID (`/actions/getApplicant.ts`)
- `getApplicants` - Retrieves a filtered list of applicants (`/actions/getApplicants.ts`)
- `updateApplicant` - Updates an existing applicant (`/actions/updateApplicant.ts`)
- `deleteApplicant` - Soft-deletes an applicant (`/actions/deleteApplicant.ts`)

## UI Components

- `/applicant/create/page.tsx` - Form to create a new applicant. Uses `CreateApplicantForm`, `useCreateApplicantForm`.
- `/applicant/[id]/edit/page.tsx` - Form to edit an existing applicant. Uses `UpdateApplicantForm`, `useUpdateApplicantForm`.
- `/applicant/[id]/view/page.tsx` - Detailed view of an applicant. Uses `ViewApplicantForm`, `useViewApplicantForm`.
- `/applicant/list/page.tsx` - Table view listing applicants. Uses `ApplicantTable`, `useApplicantTable`.
- Data display uses formatting from `@/lib/displayUtils`.

## Field Validation and Formatting

- **Aadhar Number**: Must be exactly 12 digits, displayed as masked format (XXXX-XXXX-1234).
- **PAN Number**: Must follow format AAAAA9999A, displayed as partially masked (AAAXX9999X).
- **Date of Birth**: Calendar picker with date range validation.
- **Address**: Combined and displayed as a single formatted address string.
- **Verification Status**: Computed based on both Aadhar and PAN verification statuses.

## Hooks

- `useCreateApplicantForm` - For creating new applicants.
- `useUpdateApplicantForm` - For updating existing applicants.
- `useViewApplicantForm` - For viewing applicant details with delete functionality.
- `useApplicantTable` - For listing, filtering, and searching applicants.

## Key Utilities Used

- `@/lib/prisma`: Database access.
- `@/lib/casl`: Permissions definition and checking.
- `@/lib/getServerUser`: Authenticated user retrieval in actions.
- `@/lib/toastUtils`: User feedback notifications.
- `@/lib/actionErrorHelpers`: Standardizing server action errors.
- `@/lib/formErrorHelper`: Mapping action errors to forms.
- `@/lib/displayUtils`: Formatting data for display.

## Internationalization

Translations are available in both English and Hindi for all UI elements, error messages, and notifications. Translations keys are organized in the following structure:

```
Applicant:
  form: {...}      # Form labels, placeholders, descriptions
  validation: {...} # Validation error messages
  errors: {...}    # Server-side error messages
  toast: {...}     # Toast notification messages
  list: {...}      # Table and list view labels
  view: {...}      # View/display labels
  edit: {...}      # Edit page specific labels
  create: {...}    # Create page specific labels
  delete: {...}    # Delete confirmation labels
```

## Error Handling

- Form validation errors use Zod schemas with user-friendly messages.
- Server actions return typed `ActionResponse<T>` with success/error information.
- Client-side error handling uses `handleFormErrors` from `@/lib/formErrorHelper`.
- Toast notifications provide user feedback using `@/lib/toastUtils`.

## Implementation Notes

- All forms use React Hook Form with Zod validation.
- Tables use TanStack Table with filtering, pagination, and sorting.
- CASL is used for field-level permission control.
- Soft-delete pattern is implemented for applicants.
- Related entities are accessible through the applicant interface.
