import { createMachine } from "xstate";
import { prisma } from "@/lib/prisma";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ApprovalStatus, PendingActionType, RoleType } from "@prisma/client";

/**
 * Context for the maker-checker user creation flow
 */
interface MakerCheckerContext {
  pendingActionId: string | null;
  requestedById: string | null;
  reviewedById: string | null;
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: RoleType;
    bankId?: string;
  } | null;
  status: ApprovalStatus | null;
  error: string | null;
  createdUserId: string | null;
}

/**
 * Events that drive transitions
 */
type MakerCheckerEvent =
  | { type: "SUBMIT_REQUEST"; data: MakerCheckerContext["payload"]; requestedById: string }
  | { type: "APPROVE_REQUEST"; reviewedById: string }
  | { type: "REJECT_REQUEST"; reviewedById: string; reason: string }
  | { type: "CANCEL_REQUEST" }
  | { type: "FAIL"; error: string };

export const services = {
  /**
   * Create a pending action record
   */
  createPendingAction: async (
    context: MakerCheckerContext,
    event: Extract<MakerCheckerEvent, { type: "SUBMIT_REQUEST" }>,
  ) => {
    if (!event.data || !event.requestedById) {
      throw new Error("Missing required data for creating pending action");
    }

    const pendingAction = await prisma.pendingAction.create({
      data: {
        payload: event.data,
        requestedById: event.requestedById,
        bankId: event.data.bankId,
        targetModel: "UserProfile",
        actionType: PendingActionType.REQUEST_BANK_USER_CREATION,
        reviewedById: null,
        reviewRemarks: null,
        targetRecordId: null,
        deletedAt: null,
      },
    });

    return {
      pendingActionId: pendingAction.id,
      payload: pendingAction.payload,
      requestedById: pendingAction.requestedById,
    };
  },

  /**
   * Load existing pending action
   */
  loadPendingAction: async (context: MakerCheckerContext, event: { type: "LOAD"; pendingActionId: string }) => {
    const pendingAction = await prisma.pendingAction.findUnique({
      where: { id: event.pendingActionId },
    });

    if (!pendingAction) {
      throw new Error(`Pending action not found: ${event.pendingActionId}`);
    }

    return {
      pendingActionId: pendingAction.id,
      payload: pendingAction.payload,
      requestedById: pendingAction.requestedById,
      status: pendingAction.status,
      reviewedById: pendingAction.reviewedById,
    };
  },

  /**
   * Approve user creation
   */
  executeApproval: async (
    context: MakerCheckerContext,
    event: Extract<MakerCheckerEvent, { type: "APPROVE_REQUEST" }>,
  ) => {
    if (!context.pendingActionId || !context.payload) {
      throw new Error("Missing required context for approval");
    }

    const { pendingActionId, payload, requestedById } = context;
    const { reviewedById } = event;

    if (requestedById === reviewedById) {
      throw new Error("Approver cannot be the same as requester");
    }

    const supabase = createClientComponentClient();
    let authUser;

    try {
      const { data: userData, error: authError } = await supabase.auth.admin.createUser({
        email: payload.email,
        email_confirm: true,
        password: generateTemporaryPassword(),
        user_metadata: {
          firstName: payload.firstName,
          lastName: payload.lastName,
          phone: payload.phoneNumber,
        },
      });

      if (authError) throw authError;
      if (!userData.user) throw new Error("Failed to create user");

      authUser = userData.user;

      await prisma.userProfile.create({
        data: {
          authId: authUser.id,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          phoneNumber: payload.phoneNumber,
          isOnboarded: false,
        },
      });

      await prisma.userRoles.create({
        data: {
          userId: authUser.id,
          role: payload.role,
          bankId: payload.bankId,
        },
      });

      await prisma.pendingAction.update({
        where: { id: pendingActionId },
        data: {
          status: ApprovalStatus.APPROVED,
          reviewedById,
          reviewedAt: new Date(),
          targetRecordId: authUser.id,
        },
      });

      return { userId: authUser.id };
    } catch (error: any) {
      try {
        await prisma.pendingAction.update({
          where: { id: pendingActionId },
          data: {
            reviewedById,
            reviewedAt: new Date(),
            reviewRemarks: `Error: ${error.message || "Unknown error during user creation"}`,
          },
        });
      } catch (updateError) {
        console.error("Failed to update pending action after error:", updateError);
      }

      throw error;
    }
  },

  /**
   * Reject user creation
   */
  executeRejection: async (
    context: MakerCheckerContext,
    event: Extract<MakerCheckerEvent, { type: "REJECT_REQUEST" }>,
  ) => {
    if (!context.pendingActionId) {
      throw new Error("Missing pending action ID for rejection");
    }

    const { pendingActionId, requestedById } = context;
    const { reviewedById, reason } = event;

    if (requestedById === reviewedById) {
      throw new Error("Rejecter cannot be the same as requester");
    }

    await prisma.pendingAction.update({
      where: { id: pendingActionId },
      data: {
        status: ApprovalStatus.REJECTED,
        reviewedById,
        reviewedAt: new Date(),
        reviewRemarks: reason,
      },
    });

    return true;
  },
};

function generateTemporaryPassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
}

export const userMakerCheckerMachine = createMachine({
  id: "userMakerCheckerMachine",
  initial: "idle",
  context: {} as MakerCheckerContext,
  types: {} as {
    context: MakerCheckerContext;
    events: MakerCheckerEvent;
  },
  states: {
    idle: {
      on: {
        SUBMIT_REQUEST: {
          target: "pendingApproval",
          actions: ({ context, event }) => {
            context.pendingActionId = crypto.randomUUID();
            context.payload = event.data;
            context.requestedById = event.requestedById;
            context.status = ApprovalStatus.PENDING;
          },
        },
      },
    },
    pendingApproval: {
      on: {
        APPROVE_REQUEST: {
          target: "approved",
          actions: ({ context, event }) => {
            context.reviewedById = event.reviewedById;
            context.status = ApprovalStatus.APPROVED;
          },
        },
        REJECT_REQUEST: {
          target: "rejected",
          actions: ({ context, event }) => {
            context.reviewedById = event.reviewedById;
            context.status = ApprovalStatus.REJECTED;
            context.error = event.reason;
          },
        },
        CANCEL_REQUEST: {
          target: "cancelled",
          actions: ({ context }) => {
            context.status = ApprovalStatus.CANCELLED;
          },
        },
        FAIL: {
          target: "error",
          actions: ({ context, event }) => {
            context.error = event.error;
          },
        },
      },
    },
    approved: {
      entry: ({ context }) => {
        // You would call a service here to actually create the user and role
        // For example: createUserAndRole(context.payload)
      },
      type: "final",
    },
    rejected: { type: "final" },
    cancelled: { type: "final" },
    error: { type: "final" },
  },
});
