export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number;
          checksum: string;
          finished_at: string | null;
          id: string;
          logs: string | null;
          migration_name: string;
          rolled_back_at: string | null;
          started_at: string;
        };
        Insert: {
          applied_steps_count?: number;
          checksum: string;
          finished_at?: string | null;
          id: string;
          logs?: string | null;
          migration_name: string;
          rolled_back_at?: string | null;
          started_at?: string;
        };
        Update: {
          applied_steps_count?: number;
          checksum?: string;
          finished_at?: string | null;
          id?: string;
          logs?: string | null;
          migration_name?: string;
          rolled_back_at?: string | null;
          started_at?: string;
        };
        Relationships: [];
      };
      Applicant: {
        Row: {
          aadharNumber: string;
          aadharVerificationStatus: boolean;
          addressCity: string;
          addressFull: string;
          addressPinCode: string;
          addressState: string;
          createdAt: string;
          dateOfBirth: string;
          deletedAt: string | null;
          id: string;
          panNumber: string;
          panVerificationStatus: boolean;
          photoUrl: string;
          updatedAt: string;
          userId: string;
        };
        Insert: {
          aadharNumber: string;
          aadharVerificationStatus?: boolean;
          addressCity: string;
          addressFull: string;
          addressPinCode: string;
          addressState: string;
          createdAt?: string;
          dateOfBirth: string;
          deletedAt?: string | null;
          id?: string;
          panNumber: string;
          panVerificationStatus?: boolean;
          photoUrl: string;
          updatedAt: string;
          userId: string;
        };
        Update: {
          aadharNumber?: string;
          aadharVerificationStatus?: boolean;
          addressCity?: string;
          addressFull?: string;
          addressPinCode?: string;
          addressState?: string;
          createdAt?: string;
          dateOfBirth?: string;
          deletedAt?: string | null;
          id?: string;
          panNumber?: string;
          panVerificationStatus?: boolean;
          photoUrl?: string;
          updatedAt?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Applicant_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "UserProfile";
            referencedColumns: ["auth_id"];
          },
        ];
      };
      AuditLog: {
        Row: {
          action: string;
          deviceInfo: string | null;
          id: string;
          ipAddress: string | null;
          newData: Json | null;
          oldData: Json | null;
          recordId: string | null;
          tableName: string;
          timestamp: string;
          userId: string;
        };
        Insert: {
          action: string;
          deviceInfo?: string | null;
          id?: string;
          ipAddress?: string | null;
          newData?: Json | null;
          oldData?: Json | null;
          recordId?: string | null;
          tableName: string;
          timestamp?: string;
          userId: string;
        };
        Update: {
          action?: string;
          deviceInfo?: string | null;
          id?: string;
          ipAddress?: string | null;
          newData?: Json | null;
          oldData?: Json | null;
          recordId?: string | null;
          tableName?: string;
          timestamp?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "AuditLog_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "UserProfile";
            referencedColumns: ["auth_id"];
          },
        ];
      };
      Bank: {
        Row: {
          createdAt: string;
          deletedAt: string | null;
          id: string;
          name: string;
          updatedAt: string;
        };
        Insert: {
          createdAt?: string;
          deletedAt?: string | null;
          id?: string;
          name: string;
          updatedAt: string;
        };
        Update: {
          createdAt?: string;
          deletedAt?: string | null;
          id?: string;
          name?: string;
          updatedAt?: string;
        };
        Relationships: [];
      };
      BankConfiguration: {
        Row: {
          approvalLimits: Json;
          bankId: string;
          currency: string;
          deletedAt: string | null;
          id: string;
          interestRates: Json;
          loanDurations: Json;
          maxLoanAmount: number;
        };
        Insert: {
          approvalLimits: Json;
          bankId: string;
          currency: string;
          deletedAt?: string | null;
          id?: string;
          interestRates: Json;
          loanDurations: Json;
          maxLoanAmount: number;
        };
        Update: {
          approvalLimits?: Json;
          bankId?: string;
          currency?: string;
          deletedAt?: string | null;
          id?: string;
          interestRates?: Json;
          loanDurations?: Json;
          maxLoanAmount?: number;
        };
        Relationships: [
          {
            foreignKeyName: "BankConfiguration_bankId_fkey";
            columns: ["bankId"];
            isOneToOne: false;
            referencedRelation: "Bank";
            referencedColumns: ["id"];
          },
        ];
      };
      BusinessVerification: {
        Row: {
          businessExistence: boolean | null;
          businessName: string | null;
          businessType: string | null;
          contactDetails: string | null;
          id: string;
          natureOfBusiness: string | null;
          salesPerDay: string | null;
          verificationId: string;
        };
        Insert: {
          businessExistence?: boolean | null;
          businessName?: string | null;
          businessType?: string | null;
          contactDetails?: string | null;
          id?: string;
          natureOfBusiness?: string | null;
          salesPerDay?: string | null;
          verificationId: string;
        };
        Update: {
          businessExistence?: boolean | null;
          businessName?: string | null;
          businessType?: string | null;
          contactDetails?: string | null;
          id?: string;
          natureOfBusiness?: string | null;
          salesPerDay?: string | null;
          verificationId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "BusinessVerification_verificationId_fkey";
            columns: ["verificationId"];
            isOneToOne: false;
            referencedRelation: "Verification";
            referencedColumns: ["id"];
          },
        ];
      };
      CoApplicant: {
        Row: {
          addressCity: string;
          addressLine1: string;
          addressLine2: string | null;
          addressState: string;
          addressZipCode: string;
          createdAt: string;
          deletedAt: string | null;
          email: string;
          firstName: string;
          id: string;
          lastName: string;
          loanApplicationId: string;
          mobileNumber: string;
          updatedAt: string;
        };
        Insert: {
          addressCity: string;
          addressLine1: string;
          addressLine2?: string | null;
          addressState: string;
          addressZipCode: string;
          createdAt?: string;
          deletedAt?: string | null;
          email: string;
          firstName: string;
          id?: string;
          lastName: string;
          loanApplicationId: string;
          mobileNumber: string;
          updatedAt: string;
        };
        Update: {
          addressCity?: string;
          addressLine1?: string;
          addressLine2?: string | null;
          addressState?: string;
          addressZipCode?: string;
          createdAt?: string;
          deletedAt?: string | null;
          email?: string;
          firstName?: string;
          id?: string;
          lastName?: string;
          loanApplicationId?: string;
          mobileNumber?: string;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "CoApplicant_loanApplicationId_fkey";
            columns: ["loanApplicationId"];
            isOneToOne: false;
            referencedRelation: "LoanApplication";
            referencedColumns: ["id"];
          },
        ];
      };
      Dependent: {
        Row: {
          applicantId: string;
          averageMonthlyExpenditure: number;
          createdAt: string;
          deletedAt: string | null;
          id: string;
          updatedAt: string;
        };
        Insert: {
          applicantId: string;
          averageMonthlyExpenditure: number;
          createdAt?: string;
          deletedAt?: string | null;
          id?: string;
          updatedAt: string;
        };
        Update: {
          applicantId?: string;
          averageMonthlyExpenditure?: number;
          createdAt?: string;
          deletedAt?: string | null;
          id?: string;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Dependent_applicantId_fkey";
            columns: ["applicantId"];
            isOneToOne: false;
            referencedRelation: "Applicant";
            referencedColumns: ["id"];
          },
        ];
      };
      Document: {
        Row: {
          applicantId: string | null;
          bankConfigurationId: string | null;
          bankId: string | null;
          coApplicantId: string | null;
          deletedAt: string | null;
          dependentId: string | null;
          documentType: Database["public"]["Enums"]["DocumentType"];
          fileName: string;
          fileSize: number;
          fileUrl: string;
          guarantorId: string | null;
          id: string;
          incomeDetailId: string | null;
          incomeId: string | null;
          loanApplicationId: string | null;
          loanObligationDetailId: string | null;
          loanObligationId: string | null;
          metadata: Json | null;
          mimeType: string;
          status: Database["public"]["Enums"]["VerificationStatus"];
          storageType: string;
          subscriptionId: string | null;
          uploadedAt: string;
          uploadedById: string;
          verificationId: string | null;
        };
        Insert: {
          applicantId?: string | null;
          bankConfigurationId?: string | null;
          bankId?: string | null;
          coApplicantId?: string | null;
          deletedAt?: string | null;
          dependentId?: string | null;
          documentType: Database["public"]["Enums"]["DocumentType"];
          fileName: string;
          fileSize: number;
          fileUrl: string;
          guarantorId?: string | null;
          id?: string;
          incomeDetailId?: string | null;
          incomeId?: string | null;
          loanApplicationId?: string | null;
          loanObligationDetailId?: string | null;
          loanObligationId?: string | null;
          metadata?: Json | null;
          mimeType: string;
          status?: Database["public"]["Enums"]["VerificationStatus"];
          storageType: string;
          subscriptionId?: string | null;
          uploadedAt?: string;
          uploadedById: string;
          verificationId?: string | null;
        };
        Update: {
          applicantId?: string | null;
          bankConfigurationId?: string | null;
          bankId?: string | null;
          coApplicantId?: string | null;
          deletedAt?: string | null;
          dependentId?: string | null;
          documentType?: Database["public"]["Enums"]["DocumentType"];
          fileName?: string;
          fileSize?: number;
          fileUrl?: string;
          guarantorId?: string | null;
          id?: string;
          incomeDetailId?: string | null;
          incomeId?: string | null;
          loanApplicationId?: string | null;
          loanObligationDetailId?: string | null;
          loanObligationId?: string | null;
          metadata?: Json | null;
          mimeType?: string;
          status?: Database["public"]["Enums"]["VerificationStatus"];
          storageType?: string;
          subscriptionId?: string | null;
          uploadedAt?: string;
          uploadedById?: string;
          verificationId?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "Document_applicantId_fkey";
            columns: ["applicantId"];
            isOneToOne: false;
            referencedRelation: "Applicant";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Document_bankConfigurationId_fkey";
            columns: ["bankConfigurationId"];
            isOneToOne: false;
            referencedRelation: "BankConfiguration";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Document_bankId_fkey";
            columns: ["bankId"];
            isOneToOne: false;
            referencedRelation: "Bank";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Document_coApplicantId_fkey";
            columns: ["coApplicantId"];
            isOneToOne: false;
            referencedRelation: "CoApplicant";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Document_dependentId_fkey";
            columns: ["dependentId"];
            isOneToOne: false;
            referencedRelation: "Dependent";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Document_guarantorId_fkey";
            columns: ["guarantorId"];
            isOneToOne: false;
            referencedRelation: "Guarantor";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Document_incomeDetailId_fkey";
            columns: ["incomeDetailId"];
            isOneToOne: false;
            referencedRelation: "IncomeDetail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Document_incomeId_fkey";
            columns: ["incomeId"];
            isOneToOne: false;
            referencedRelation: "Income";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Document_loanApplicationId_fkey";
            columns: ["loanApplicationId"];
            isOneToOne: false;
            referencedRelation: "LoanApplication";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Document_loanObligationDetailId_fkey";
            columns: ["loanObligationDetailId"];
            isOneToOne: false;
            referencedRelation: "LoanObligationDetail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Document_loanObligationId_fkey";
            columns: ["loanObligationId"];
            isOneToOne: false;
            referencedRelation: "LoanObligation";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Document_subscriptionId_fkey";
            columns: ["subscriptionId"];
            isOneToOne: false;
            referencedRelation: "Subscription";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Document_verificationId_fkey";
            columns: ["verificationId"];
            isOneToOne: false;
            referencedRelation: "Verification";
            referencedColumns: ["id"];
          },
        ];
      };
      Guarantor: {
        Row: {
          addressCity: string;
          addressLine1: string;
          addressLine2: string | null;
          addressState: string;
          addressZipCode: string;
          createdAt: string;
          deletedAt: string | null;
          email: string;
          firstName: string;
          id: string;
          lastName: string;
          loanApplicationId: string;
          mobileNumber: string;
          updatedAt: string;
        };
        Insert: {
          addressCity: string;
          addressLine1: string;
          addressLine2?: string | null;
          addressState: string;
          addressZipCode: string;
          createdAt?: string;
          deletedAt?: string | null;
          email: string;
          firstName: string;
          id?: string;
          lastName: string;
          loanApplicationId: string;
          mobileNumber: string;
          updatedAt: string;
        };
        Update: {
          addressCity?: string;
          addressLine1?: string;
          addressLine2?: string | null;
          addressState?: string;
          addressZipCode?: string;
          createdAt?: string;
          deletedAt?: string | null;
          email?: string;
          firstName?: string;
          id?: string;
          lastName?: string;
          loanApplicationId?: string;
          mobileNumber?: string;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Guarantor_loanApplicationId_fkey";
            columns: ["loanApplicationId"];
            isOneToOne: false;
            referencedRelation: "LoanApplication";
            referencedColumns: ["id"];
          },
        ];
      };
      Income: {
        Row: {
          applicantId: string;
          createdAt: string;
          deletedAt: string | null;
          id: string;
          type: string;
          updatedAt: string;
        };
        Insert: {
          applicantId: string;
          createdAt?: string;
          deletedAt?: string | null;
          id?: string;
          type: string;
          updatedAt: string;
        };
        Update: {
          applicantId?: string;
          createdAt?: string;
          deletedAt?: string | null;
          id?: string;
          type?: string;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Income_applicantId_fkey";
            columns: ["applicantId"];
            isOneToOne: false;
            referencedRelation: "Applicant";
            referencedColumns: ["id"];
          },
        ];
      };
      IncomeDetail: {
        Row: {
          createdAt: string;
          deletedAt: string | null;
          depreciation: number | null;
          grossCashIncome: number | null;
          grossIncome: number | null;
          id: string;
          incomeFromBusiness: number | null;
          incomeId: string;
          rentalIncome: number | null;
          taxableIncome: number | null;
          taxPaid: number | null;
          updatedAt: string;
          year: number;
        };
        Insert: {
          createdAt?: string;
          deletedAt?: string | null;
          depreciation?: number | null;
          grossCashIncome?: number | null;
          grossIncome?: number | null;
          id?: string;
          incomeFromBusiness?: number | null;
          incomeId: string;
          rentalIncome?: number | null;
          taxableIncome?: number | null;
          taxPaid?: number | null;
          updatedAt: string;
          year: number;
        };
        Update: {
          createdAt?: string;
          deletedAt?: string | null;
          depreciation?: number | null;
          grossCashIncome?: number | null;
          grossIncome?: number | null;
          id?: string;
          incomeFromBusiness?: number | null;
          incomeId?: string;
          rentalIncome?: number | null;
          taxableIncome?: number | null;
          taxPaid?: number | null;
          updatedAt?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "IncomeDetail_incomeId_fkey";
            columns: ["incomeId"];
            isOneToOne: false;
            referencedRelation: "Income";
            referencedColumns: ["id"];
          },
        ];
      };
      LoanApplication: {
        Row: {
          amountRequested: number;
          applicantId: string;
          bankId: string;
          createdAt: string;
          deletedAt: string | null;
          id: string;
          loanType: Database["public"]["Enums"]["LoanType"];
          status: Database["public"]["Enums"]["LoanStatus"];
          updatedAt: string;
        };
        Insert: {
          amountRequested: number;
          applicantId: string;
          bankId: string;
          createdAt?: string;
          deletedAt?: string | null;
          id?: string;
          loanType: Database["public"]["Enums"]["LoanType"];
          status: Database["public"]["Enums"]["LoanStatus"];
          updatedAt: string;
        };
        Update: {
          amountRequested?: number;
          applicantId?: string;
          bankId?: string;
          createdAt?: string;
          deletedAt?: string | null;
          id?: string;
          loanType?: Database["public"]["Enums"]["LoanType"];
          status?: Database["public"]["Enums"]["LoanStatus"];
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "LoanApplication_applicantId_fkey";
            columns: ["applicantId"];
            isOneToOne: false;
            referencedRelation: "Applicant";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "LoanApplication_bankId_fkey";
            columns: ["bankId"];
            isOneToOne: false;
            referencedRelation: "Bank";
            referencedColumns: ["id"];
          },
        ];
      };
      LoanObligation: {
        Row: {
          applicantId: string;
          cibilScore: number | null;
          createdAt: string;
          deletedAt: string | null;
          id: string;
          totalEmi: number | null;
          totalLoan: number | null;
          updatedAt: string;
        };
        Insert: {
          applicantId: string;
          cibilScore?: number | null;
          createdAt?: string;
          deletedAt?: string | null;
          id?: string;
          totalEmi?: number | null;
          totalLoan?: number | null;
          updatedAt: string;
        };
        Update: {
          applicantId?: string;
          cibilScore?: number | null;
          createdAt?: string;
          deletedAt?: string | null;
          id?: string;
          totalEmi?: number | null;
          totalLoan?: number | null;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "LoanObligation_applicantId_fkey";
            columns: ["applicantId"];
            isOneToOne: false;
            referencedRelation: "Applicant";
            referencedColumns: ["id"];
          },
        ];
      };
      LoanObligationDetail: {
        Row: {
          bankName: string;
          createdAt: string;
          deletedAt: string | null;
          emiAmount: number;
          id: string;
          loanDate: string;
          loanObligationId: string;
          loanType: string;
          outstandingLoan: number;
          updatedAt: string;
        };
        Insert: {
          bankName: string;
          createdAt?: string;
          deletedAt?: string | null;
          emiAmount: number;
          id?: string;
          loanDate: string;
          loanObligationId: string;
          loanType: string;
          outstandingLoan: number;
          updatedAt: string;
        };
        Update: {
          bankName?: string;
          createdAt?: string;
          deletedAt?: string | null;
          emiAmount?: number;
          id?: string;
          loanDate?: string;
          loanObligationId?: string;
          loanType?: string;
          outstandingLoan?: number;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "LoanObligationDetail_loanObligationId_fkey";
            columns: ["loanObligationId"];
            isOneToOne: false;
            referencedRelation: "LoanObligation";
            referencedColumns: ["id"];
          },
        ];
      };
      PropertyVerification: {
        Row: {
          id: string;
          ownerFirstName: string | null;
          ownerLastName: string | null;
          structureType: string | null;
          verificationId: string;
        };
        Insert: {
          id?: string;
          ownerFirstName?: string | null;
          ownerLastName?: string | null;
          structureType?: string | null;
          verificationId: string;
        };
        Update: {
          id?: string;
          ownerFirstName?: string | null;
          ownerLastName?: string | null;
          structureType?: string | null;
          verificationId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "PropertyVerification_verificationId_fkey";
            columns: ["verificationId"];
            isOneToOne: false;
            referencedRelation: "Verification";
            referencedColumns: ["id"];
          },
        ];
      };
      ResidenceVerification: {
        Row: {
          id: string;
          ownerFirstName: string | null;
          ownerLastName: string | null;
          residenceType: string | null;
          residentSince: string | null;
          structureType: string | null;
          verificationId: string;
        };
        Insert: {
          id?: string;
          ownerFirstName?: string | null;
          ownerLastName?: string | null;
          residenceType?: string | null;
          residentSince?: string | null;
          structureType?: string | null;
          verificationId: string;
        };
        Update: {
          id?: string;
          ownerFirstName?: string | null;
          ownerLastName?: string | null;
          residenceType?: string | null;
          residentSince?: string | null;
          structureType?: string | null;
          verificationId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ResidenceVerification_verificationId_fkey";
            columns: ["verificationId"];
            isOneToOne: false;
            referencedRelation: "Verification";
            referencedColumns: ["id"];
          },
        ];
      };
      Subscription: {
        Row: {
          amount: number;
          bankId: string;
          deletedAt: string | null;
          endDate: string | null;
          id: string;
          startDate: string;
          status: string;
        };
        Insert: {
          amount: number;
          bankId: string;
          deletedAt?: string | null;
          endDate?: string | null;
          id?: string;
          startDate: string;
          status: string;
        };
        Update: {
          amount?: number;
          bankId?: string;
          deletedAt?: string | null;
          endDate?: string | null;
          id?: string;
          startDate?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Subscription_bankId_fkey";
            columns: ["bankId"];
            isOneToOne: false;
            referencedRelation: "Bank";
            referencedColumns: ["id"];
          },
        ];
      };
      UserProfile: {
        Row: {
          auth_id: string;
          authId: string;
          createdAt: string;
          deletedAt: string | null;
          email: string | null;
          firstName: string | null;
          isOnboarded: boolean;
          lastName: string | null;
          phoneNumber: string | null;
          updatedAt: string;
        };
        Insert: {
          auth_id?: string;
          authId: string;
          createdAt?: string;
          deletedAt?: string | null;
          email?: string | null;
          firstName?: string | null;
          isOnboarded?: boolean;
          lastName?: string | null;
          phoneNumber?: string | null;
          updatedAt: string;
        };
        Update: {
          auth_id?: string;
          authId?: string;
          createdAt?: string;
          deletedAt?: string | null;
          email?: string | null;
          firstName?: string | null;
          isOnboarded?: boolean;
          lastName?: string | null;
          phoneNumber?: string | null;
          updatedAt?: string;
        };
        Relationships: [];
      };
      UserRoles: {
        Row: {
          assignedAt: string;
          bankId: string | null;
          deletedAt: string | null;
          id: string;
          role: Database["public"]["Enums"]["RoleType"];
          userId: string;
        };
        Insert: {
          assignedAt?: string;
          bankId?: string | null;
          deletedAt?: string | null;
          id?: string;
          role: Database["public"]["Enums"]["RoleType"];
          userId: string;
        };
        Update: {
          assignedAt?: string;
          bankId?: string | null;
          deletedAt?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["RoleType"];
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "UserRoles_bankId_fkey";
            columns: ["bankId"];
            isOneToOne: false;
            referencedRelation: "Bank";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "UserRoles_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "UserProfile";
            referencedColumns: ["authId"];
          },
        ];
      };
      VehicleVerification: {
        Row: {
          chassisNumber: string | null;
          deliveryChalanUrl: string | null;
          engineNumber: string | null;
          id: string;
          inspectionReportUrl: string | null;
          make: string | null;
          model: string | null;
          rcUrl: string | null;
          registrationNumber: string | null;
          stampedReceiptUrl: string | null;
          taxInvoiceUrl: string | null;
          vehiclePhotoUrl: string | null;
          vehicleType: string | null;
          verificationId: string;
        };
        Insert: {
          chassisNumber?: string | null;
          deliveryChalanUrl?: string | null;
          engineNumber?: string | null;
          id?: string;
          inspectionReportUrl?: string | null;
          make?: string | null;
          model?: string | null;
          rcUrl?: string | null;
          registrationNumber?: string | null;
          stampedReceiptUrl?: string | null;
          taxInvoiceUrl?: string | null;
          vehiclePhotoUrl?: string | null;
          vehicleType?: string | null;
          verificationId: string;
        };
        Update: {
          chassisNumber?: string | null;
          deliveryChalanUrl?: string | null;
          engineNumber?: string | null;
          id?: string;
          inspectionReportUrl?: string | null;
          make?: string | null;
          model?: string | null;
          rcUrl?: string | null;
          registrationNumber?: string | null;
          stampedReceiptUrl?: string | null;
          taxInvoiceUrl?: string | null;
          vehiclePhotoUrl?: string | null;
          vehicleType?: string | null;
          verificationId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "VehicleVerification_verificationId_fkey";
            columns: ["verificationId"];
            isOneToOne: false;
            referencedRelation: "Verification";
            referencedColumns: ["id"];
          },
        ];
      };
      Verification: {
        Row: {
          addressCity: string | null;
          addressLine1: string | null;
          addressLine2: string | null;
          addressState: string | null;
          addressZipCode: string | null;
          createdAt: string;
          deletedAt: string | null;
          id: string;
          loanApplicationId: string;
          locationFromMain: string | null;
          photographUrl: string | null;
          remarks: string | null;
          result: boolean;
          status: Database["public"]["Enums"]["VerificationStatus"];
          type: Database["public"]["Enums"]["VerificationType"];
          updatedAt: string;
          verificationDate: string;
          verificationTime: string;
          verifiedAt: string | null;
          verifiedById: string | null;
        };
        Insert: {
          addressCity?: string | null;
          addressLine1?: string | null;
          addressLine2?: string | null;
          addressState?: string | null;
          addressZipCode?: string | null;
          createdAt?: string;
          deletedAt?: string | null;
          id?: string;
          loanApplicationId: string;
          locationFromMain?: string | null;
          photographUrl?: string | null;
          remarks?: string | null;
          result: boolean;
          status: Database["public"]["Enums"]["VerificationStatus"];
          type: Database["public"]["Enums"]["VerificationType"];
          updatedAt: string;
          verificationDate?: string;
          verificationTime: string;
          verifiedAt?: string | null;
          verifiedById?: string | null;
        };
        Update: {
          addressCity?: string | null;
          addressLine1?: string | null;
          addressLine2?: string | null;
          addressState?: string | null;
          addressZipCode?: string | null;
          createdAt?: string;
          deletedAt?: string | null;
          id?: string;
          loanApplicationId?: string;
          locationFromMain?: string | null;
          photographUrl?: string | null;
          remarks?: string | null;
          result?: boolean;
          status?: Database["public"]["Enums"]["VerificationStatus"];
          type?: Database["public"]["Enums"]["VerificationType"];
          updatedAt?: string;
          verificationDate?: string;
          verificationTime?: string;
          verifiedAt?: string | null;
          verifiedById?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "Verification_loanApplicationId_fkey";
            columns: ["loanApplicationId"];
            isOneToOne: false;
            referencedRelation: "LoanApplication";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Verification_verifiedById_fkey";
            columns: ["verifiedById"];
            isOneToOne: false;
            referencedRelation: "UserProfile";
            referencedColumns: ["auth_id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      DocumentType:
        | "AADHAAR_CARD"
        | "PAN_CARD"
        | "IDENTITY_PROOF"
        | "ADDRESS_PROOF"
        | "INCOME_PROOF"
        | "BANK_STATEMENT"
        | "PROPERTY_DOCUMENT"
        | "VEHICLE_DOCUMENT"
        | "LOAN_AGREEMENT"
        | "VERIFICATION_PHOTO"
        | "KYC_DOCUMENT"
        | "APPLICATION_FORM"
        | "OTHER";
      LoanStatus: "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW";
      LoanType: "PERSONAL" | "VEHICLE" | "HOUSE_CONSTRUCTION" | "PLOT_PURCHASE" | "MORTGAGE";
      RoleType:
        | "CLERK"
        | "INSPECTOR"
        | "LOAN_OFFICER"
        | "CEO"
        | "LOAN_COMMITTEE"
        | "BOARD"
        | "BANK_ADMIN"
        | "SAAS_ADMIN"
        | "APPLICANT"
        | "USER";
      VerificationStatus: "PENDING" | "COMPLETED" | "FAILED";
      VerificationType: "RESIDENCE" | "BUSINESS" | "VEHICLE" | "PROPERTY";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"]) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
