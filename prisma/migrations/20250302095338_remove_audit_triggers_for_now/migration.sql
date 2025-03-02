-- 20250302_drop_audit_triggers.sql
-- This migration removes all existing audit log triggers from the tables.

BEGIN;

-- Drop triggers for UserProfile
DROP TRIGGER IF EXISTS user_profile_insert_trigger ON "UserProfile";
DROP TRIGGER IF EXISTS user_profile_update_trigger ON "UserProfile";
DROP TRIGGER IF EXISTS user_profile_delete_trigger ON "UserProfile";
DROP TRIGGER IF EXISTS user_profile_soft_delete_trigger ON "UserProfile";
DROP TRIGGER IF EXISTS user_profile_restore_trigger ON "UserProfile";

-- Drop triggers for UserRoles
DROP TRIGGER IF EXISTS user_roles_insert_trigger ON "UserRoles";
DROP TRIGGER IF EXISTS user_roles_update_trigger ON "UserRoles";
DROP TRIGGER IF EXISTS user_roles_delete_trigger ON "UserRoles";
DROP TRIGGER IF EXISTS user_roles_soft_delete_trigger ON "UserRoles";
DROP TRIGGER IF EXISTS user_roles_restore_trigger ON "UserRoles";

-- Drop triggers for Applicant
DROP TRIGGER IF EXISTS applicant_insert_trigger ON "Applicant";
DROP TRIGGER IF EXISTS applicant_update_trigger ON "Applicant";
DROP TRIGGER IF EXISTS applicant_delete_trigger ON "Applicant";
DROP TRIGGER IF EXISTS applicant_soft_delete_trigger ON "Applicant";
DROP TRIGGER IF EXISTS applicant_restore_trigger ON "Applicant";

-- Drop triggers for LoanObligation
DROP TRIGGER IF EXISTS loan_obligation_insert_trigger ON "LoanObligation";
DROP TRIGGER IF EXISTS loan_obligation_update_trigger ON "LoanObligation";
DROP TRIGGER IF EXISTS loan_obligation_delete_trigger ON "LoanObligation";
DROP TRIGGER IF EXISTS loan_obligation_soft_delete_trigger ON "LoanObligation";
DROP TRIGGER IF EXISTS loan_obligation_restore_trigger ON "LoanObligation";

-- Drop triggers for LoanObligationDetail
DROP TRIGGER IF EXISTS loan_obligation_detail_insert_trigger ON "LoanObligationDetail";
DROP TRIGGER IF EXISTS loan_obligation_detail_update_trigger ON "LoanObligationDetail";
DROP TRIGGER IF EXISTS loan_obligation_detail_delete_trigger ON "LoanObligationDetail";
DROP TRIGGER IF EXISTS loan_obligation_detail_soft_delete_trigger ON "LoanObligationDetail";
DROP TRIGGER IF EXISTS loan_obligation_detail_restore_trigger ON "LoanObligationDetail";

-- Drop triggers for Income
DROP TRIGGER IF EXISTS income_insert_trigger ON "Income";
DROP TRIGGER IF EXISTS income_update_trigger ON "Income";
DROP TRIGGER IF EXISTS income_delete_trigger ON "Income";
DROP TRIGGER IF EXISTS income_soft_delete_trigger ON "Income";
DROP TRIGGER IF EXISTS income_restore_trigger ON "Income";

-- Drop triggers for IncomeDetail
DROP TRIGGER IF EXISTS income_detail_insert_trigger ON "IncomeDetail";
DROP TRIGGER IF EXISTS income_detail_update_trigger ON "IncomeDetail";
DROP TRIGGER IF EXISTS income_detail_delete_trigger ON "IncomeDetail";
DROP TRIGGER IF EXISTS income_detail_soft_delete_trigger ON "IncomeDetail";
DROP TRIGGER IF EXISTS income_detail_restore_trigger ON "IncomeDetail";

-- Drop triggers for Dependent
DROP TRIGGER IF EXISTS dependent_insert_trigger ON "Dependent";
DROP TRIGGER IF EXISTS dependent_update_trigger ON "Dependent";
DROP TRIGGER IF EXISTS dependent_delete_trigger ON "Dependent";
DROP TRIGGER IF EXISTS dependent_soft_delete_trigger ON "Dependent";
DROP TRIGGER IF EXISTS dependent_restore_trigger ON "Dependent";

-- Drop triggers for Bank
DROP TRIGGER IF EXISTS bank_insert_trigger ON "Bank";
DROP TRIGGER IF EXISTS bank_update_trigger ON "Bank";
DROP TRIGGER IF EXISTS bank_delete_trigger ON "Bank";
DROP TRIGGER IF EXISTS bank_soft_delete_trigger ON "Bank";
DROP TRIGGER IF EXISTS bank_restore_trigger ON "Bank";

-- Drop triggers for Subscription
DROP TRIGGER IF EXISTS subscription_insert_trigger ON "Subscription";
DROP TRIGGER IF EXISTS subscription_update_trigger ON "Subscription";
DROP TRIGGER IF EXISTS subscription_delete_trigger ON "Subscription";
DROP TRIGGER IF EXISTS subscription_soft_delete_trigger ON "Subscription";
DROP TRIGGER IF EXISTS subscription_restore_trigger ON "Subscription";

-- Drop triggers for BankConfiguration
DROP TRIGGER IF EXISTS bank_configuration_insert_trigger ON "BankConfiguration";
DROP TRIGGER IF EXISTS bank_configuration_update_trigger ON "BankConfiguration";
DROP TRIGGER IF EXISTS bank_configuration_delete_trigger ON "BankConfiguration";
DROP TRIGGER IF EXISTS bank_configuration_soft_delete_trigger ON "BankConfiguration";
DROP TRIGGER IF EXISTS bank_configuration_restore_trigger ON "BankConfiguration";

-- Drop triggers for LoanApplication
DROP TRIGGER IF EXISTS loan_application_insert_trigger ON "LoanApplication";
DROP TRIGGER IF EXISTS loan_application_update_trigger ON "LoanApplication";
DROP TRIGGER IF EXISTS loan_application_delete_trigger ON "LoanApplication";
DROP TRIGGER IF EXISTS loan_application_soft_delete_trigger ON "LoanApplication";
DROP TRIGGER IF EXISTS loan_application_restore_trigger ON "LoanApplication";

-- Drop triggers for Document
DROP TRIGGER IF EXISTS document_insert_trigger ON "Document";
DROP TRIGGER IF EXISTS document_update_trigger ON "Document";
DROP TRIGGER IF EXISTS document_delete_trigger ON "Document";
DROP TRIGGER IF EXISTS document_soft_delete_trigger ON "Document";
DROP TRIGGER IF EXISTS document_restore_trigger ON "Document";

-- Drop triggers for Verification
DROP TRIGGER IF EXISTS verification_insert_trigger ON "Verification";
DROP TRIGGER IF EXISTS verification_update_trigger ON "Verification";
DROP TRIGGER IF EXISTS verification_delete_trigger ON "Verification";
DROP TRIGGER IF EXISTS verification_soft_delete_trigger ON "Verification";
DROP TRIGGER IF EXISTS verification_restore_trigger ON "Verification";

COMMIT;
