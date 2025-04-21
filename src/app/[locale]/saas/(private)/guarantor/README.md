# Guarantor Module

This module provides complete functionality for managing guarantors in the loan application process.

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Components](#components)
- [Hooks](#hooks)
- [Server Actions](#server-actions)
- [Schemas](#schemas)
- [Helpers](#helpers)
- [Internationalization](#internationalization)
- [Permission System](#permission-system)
- [Testing](#testing)
- [Usage Examples](#usage-examples)

## Overview

The Guarantor module allows bank employees to manage guarantors for loan applications. It provides features for:

- Viewing a list of guarantors with filtering and pagination
- Creating new guarantors
- Editing existing guarantor details
- Deleting guarantors (soft delete)
- Filtering guarantors by loan application

All functionality is integrated with the permission system to ensure users only have access to the operations they're authorized to perform.

## Directory Structure

```
guarantor/
├── README.md                               # Documentation
├── actions/                                # Server actions
│   ├── createGuarantor.ts                  # Create a new guarantor
│   ├── deleteGuarantor.ts                  # Delete a guarantor
│   ├── getGuarantor.ts                     # Get a single guarantor
│   ├── getGuarantors.ts                    # Get list of guarantors
│   └── updateGuarantor.ts                  # Update a guarantor
├── components/                             # UI components
│   ├── GuarantorForm/                      # Form components
│   │   ├── FormFields.tsx                  # Form fields component
│   │   └── GuarantorForm.tsx               # Form wrapper component
│   ├── GuarantorTable.tsx                  # Table component
│   └── __tests__/                          # Component tests
│       ├── GuarantorForm.test.tsx          # Form tests
│       └── GuarantorTable.test.tsx         # Table tests
├── hooks/                                  # Custom hooks
│   ├── useGuarantorForm.ts                 # Form state management
│   └── useGuarantorTable.ts                # Table state management
├── lib/                                    # Utility functions
│   ├── defineGuarantorFieldVisibility.ts   # Field visibility logic
│   ├── helpers.ts                          # Helper functions
│   └── __tests__/                          # Library tests
│       └── helpers.test.ts                 # Helper function tests
├── page.tsx                                # Main guarantor list page
├── [id]/                                   # Guarantor detail pages
│   └── page.tsx                            # Edit guarantor page
└── create/                                 # Create guarantor page
    └── page.tsx                            # Create guarantor page
├── schemas/                                # Data validation schemas
│   └── guarantorSchema.ts                  # Zod schemas
```

## Components

### GuarantorTable

The `GuarantorTable` component displays a list of guarantors with filtering, sorting, and pagination. It respects user permissions and only shows actions the user is authorized to perform.

**Props:**

- `initialData` - Array of guarantor data to display
- `loanApplicationId` (optional) - Filter guarantors by loan application
- `allowActions` (optional) - Whether to display action buttons
- `onDataChange` (optional) - Callback when data changes (e.g., after delete)

### GuarantorForm

The `GuarantorForm` component provides a form for creating and editing guarantors. It handles validation, permission checks, and state management.

**Props:**

- `initialData` (optional) - Initial guarantor data for editing
- `loanApplicationId` - ID of the loan application to associate the guarantor with
- `onSuccess` (optional) - Callback on successful submission
- `onCancel` (optional) - Callback when the form is canceled

## Hooks

### useGuarantorTable

Manages state for the guarantor table, including:

- Sorting
- Pagination
- Filtering
- Column visibility based on permissions

### useGuarantorForm

Manages state for the guarantor form, including:

- Form validation using Zod
- Permission-based field visibility
- Form submission

## Server Actions

### createGuarantor

Creates a new guarantor with the provided data.

### updateGuarantor

Updates an existing guarantor with the provided data.

### deleteGuarantor

Soft-deletes a guarantor by setting the `deletedAt` field.

### getGuarantor

Retrieves a single guarantor by ID.

### getGuarantors

Retrieves a list of guarantors with optional filtering and pagination.

## Schemas

All data validation is handled through Zod schemas defined in `guarantorSchema.ts`:

- `createGuarantorSchema` - Schema for creating a new guarantor
- `updateGuarantorSchema` - Schema for updating an existing guarantor
- `guarantorViewSchema` - Schema for the guarantor view model

## Helpers

### formatFullName

Formats a guarantor's full name by combining first and last name.

### formatFullAddress

Formats a guarantor's full address from individual address components.

### transformToGuarantorView

Transforms guarantor data into a view model with derived fields like `fullName` and `fullAddress`.

## Internationalization

All user-facing strings are internationalized using Next.js Internationalization. Translation keys are organized under the `guarantor` namespace in the locale files.

Supported languages:

- English (en)
- Hindi (hi)

## Permission System

The module uses CASL for permission management. Permissions are defined for:

- Reading guarantor data
- Creating new guarantors
- Updating guarantor fields
- Deleting guarantors

Field-level permissions are applied through the `defineGuarantorFieldVisibility` function.

## Testing

The module includes comprehensive tests for:

1. Components - Using React Testing Library
2. Hooks - Testing behavior and state updates
3. Utility functions - Unit tests for helper functions

## Usage Examples

### Basic Table Usage

```tsx
import { GuarantorTable } from "./components/GuarantorTable";
import { getGuarantors } from "./actions/getGuarantors";

// Fetch guarantors
const response = await getGuarantors();
const guarantors = response.success ? response.data : [];

// Render the table
<GuarantorTable initialData={guarantors} allowActions={true} onDataChange={() => refetchData()} />;
```

### Form Usage

```tsx
import { GuarantorForm } from "./components/GuarantorForm/GuarantorForm";

// For creating a new guarantor
<GuarantorForm
  loanApplicationId="loan123"
  onSuccess={handleSuccess}
  onCancel={handleCancel}
/>

// For editing an existing guarantor
<GuarantorForm
  initialData={guarantorData}
  loanApplicationId={guarantorData.loanApplicationId}
  onSuccess={handleSuccess}
  onCancel={handleCancel}
/>
```

### Filtering Guarantors by Loan Application

```tsx
// In a loan application detail page
import { GuarantorTable } from "../guarantor/components/GuarantorTable";
import { getGuarantors } from "../guarantor/actions/getGuarantors";

// Fetch guarantors for a specific loan application
const response = await getGuarantors({ loanApplicationId: "loan123" });
const guarantors = response.success ? response.data : [];

// Render the table
<GuarantorTable
  initialData={guarantors}
  loanApplicationId="loan123"
  allowActions={true}
  onDataChange={() => refetchData()}
/>;
```
