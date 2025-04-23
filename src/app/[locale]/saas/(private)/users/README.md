# User Module

## Overview

The User module provides comprehensive functionality for managing bank staff and system users in the CreditIQ application. It enables bank administrators to create, view, edit, and manage users with appropriate role-based permissions. This module is integrated with Supabase Auth for identity management and uses the CASL permissions system to control access to different features and fields.

The module also supports a workflow for requesting user creation that requires approval, implemented through the PendingAction model. This allows for separation of duties and additional security in user management.

## Model Schema

```typescript
// User data structure
model User {
  id                String       @id
  firstName         String?
  lastName          String?
  email             String       @unique
  phoneNumber       String?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  userRoles         UserRoles[]
}

// User role assignment
model UserRoles {
  userId            String
  bankId            String?
  role              String       // e.g., "BANK_ADMIN", "LOAN_OFFICER", etc.
  assignedAt        DateTime     @default(now())
  user              User         @relation(fields: [userId], references: [id])
  bank              Bank?        @relation(fields: [bankId], references: [id])
}

// Pending user creation requests
model PendingAction {
  id                String        @id @default(cuid())
  payload           Json          // Contains CreateUserInput data
  requestedById     String
  reviewedById      String?
  bankId            String
  targetModel       String        // "UserProfile"
  actionType        PendingActionType // "REQUEST_BANK_USER_CREATION"
  status            ApprovalStatus // "PENDING", "APPROVED", "REJECTED", "CANCELLED"
  requestedAt       DateTime      @default(now())
  reviewedAt        DateTime?
  reviewRemarks     String?
  targetRecordId    String?
  deletedAt         DateTime?
}
```

## Key Relationships

- User belongs to a Bank through UserRoles (many-to-many relationship)
- A User can have multiple roles across different banks
- PendingAction records are used for approval workflows

## Business Rules

1. Users are created in both Supabase Auth and the application database
2. Users must have at least one role assigned (with corresponding bank)
3. Some user operations may require approval through a PendingAction workflow
4. User management operations are subject to role-based permissions
5. Only authorized users (typically BANK_ADMIN) can create/edit other users

## Permission Matrix

| Field       | CLERK | INSPECTOR | LOAN_OFFICER | CEO | COMMITTEE | BANK_ADMIN | SAAS_ADMIN |
| ----------- | ----- | --------- | ------------ | --- | --------- | ---------- | ---------- |
| firstName   | R     | R         | R            | R   | R         | R/W        | R/W        |
| lastName    | R     | R         | R            | R   | R         | R/W        | R/W        |
| email       | R     | R         | R            | R   | R         | R/W        | R/W        |
| phoneNumber | R     | R         | R            | R   | R         | R/W        | R/W        |
| role        | R     | R         | R            | R   | R         | R/W        | R/W        |
| status      | R     | R         | R            | R   | R         | R/W        | R/W        |

## API Endpoints (Server Actions)

- `createUser` - Creates a new user in both Supabase Auth and the database
- `getUsers` - Retrieves a list of users with filtering options
- `getUser` - Retrieves a single user by ID
- `submitPendingUserRequest` - Creates a pending user creation request
- `getPendingUserRequests` - Gets pending user creation requests
- `approvePendingUserRequest` - Approves a pending user request and creates the user
- `rejectPendingUserRequest` - Rejects a pending user request
- `cancelPendingUserRequest` - Cancels a pending user request

## UI Components

- `/users/create/page.tsx` - Form to create a new user directly or submit for approval
- `/users/[id]/edit/page.tsx` - Form to edit an existing user
- `/users/[id]/view/page.tsx` - Page to view user details
- `/users/list/page.tsx` - Table view of users with filtering and actions

## Key Utilities Used

- `@/lib/prisma` - Database access for user and role management
- `@/lib/casl` - Permissions definition and checking for field-level security
- `@/lib/getServerUser` - Retrieves current authenticated user details
- `@/lib/supabase/server` - Access to Supabase Auth API for user management
- `@/lib/actionErrorHelpers` - Standardizes error handling in server actions
- `@/lib/formErrorHelper` - Maps server errors to form fields

## Internationalization

This module supports both English and Hindi languages. All user-facing text is internationalized using translation keys from the `/messages` directory.

## Special Considerations

1. **Security**: User management requires careful permission controls
2. **Approval Workflow**: Some banks may require approval for user creation
3. **Auth Provider Integration**: The module integrates with Supabase Auth for identity management
4. **Field-Level Permissions**: Different user roles have different field visibility

## Usage Examples

### Creating a User

```tsx
import { createUser } from "@/app/[locale]/saas/(private)/users/actions/createUser";

// Create a user
const result = await createUser({
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phoneNumber: "1234567890",
  role: "LOAN_OFFICER",
  bankId: "bank123",
});
```

### Fetching Users

```tsx
import { getUsers } from "@/app/[locale]/saas/(private)/users/actions/getUsers";

// Get all users
const result = await getUsers();

// Get users with filters
const filteredResult = await getUsers({
  role: "LOAN_OFFICER",
  status: "Active",
  search: "john",
});
```
