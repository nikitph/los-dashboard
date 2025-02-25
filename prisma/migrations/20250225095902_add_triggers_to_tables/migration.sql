-- Add Audit Log Triggers Migration
-- Created by: nikitph
-- Date: 2025-02-25 09:56:45

-- Add triggers for UserProfile table
DROP TRIGGER IF EXISTS user_profile_insert_trigger ON "UserProfile";
DROP TRIGGER IF EXISTS user_profile_update_trigger ON "UserProfile";
DROP TRIGGER IF EXISTS user_profile_delete_trigger ON "UserProfile";
DROP TRIGGER IF EXISTS user_profile_soft_delete_trigger ON "UserProfile";
DROP TRIGGER IF EXISTS user_profile_restore_trigger ON "UserProfile";

CREATE TRIGGER user_profile_insert_trigger
    AFTER INSERT
    ON "UserProfile"
    FOR EACH ROW EXECUTE FUNCTION log_insert();
CREATE TRIGGER user_profile_update_trigger
    AFTER UPDATE
    ON "UserProfile"
    FOR EACH ROW EXECUTE FUNCTION log_update();
CREATE TRIGGER user_profile_delete_trigger
    BEFORE DELETE
    ON "UserProfile"
    FOR EACH ROW EXECUTE FUNCTION log_hard_delete();
CREATE TRIGGER user_profile_soft_delete_trigger
    AFTER UPDATE
    ON "UserProfile"
    FOR EACH ROW EXECUTE FUNCTION log_soft_delete();
CREATE TRIGGER user_profile_restore_trigger
    AFTER UPDATE
    ON "UserProfile"
    FOR EACH ROW EXECUTE FUNCTION log_restore();

-- Add triggers for UserRoles table
DROP TRIGGER IF EXISTS user_roles_insert_trigger ON "UserRoles";
DROP TRIGGER IF EXISTS user_roles_update_trigger ON "UserRoles";
DROP TRIGGER IF EXISTS user_roles_delete_trigger ON "UserRoles";
DROP TRIGGER IF EXISTS user_roles_soft_delete_trigger ON "UserRoles";
DROP TRIGGER IF EXISTS user_roles_restore_trigger ON "UserRoles";

CREATE TRIGGER user_roles_insert_trigger
    AFTER INSERT
    ON "UserRoles"
    FOR EACH ROW EXECUTE FUNCTION log_insert();
CREATE TRIGGER user_roles_update_trigger
    AFTER UPDATE
    ON "UserRoles"
    FOR EACH ROW EXECUTE FUNCTION log_update();
CREATE TRIGGER user_roles_delete_trigger
    BEFORE DELETE
    ON "UserRoles"
    FOR EACH ROW EXECUTE FUNCTION log_hard_delete();
CREATE TRIGGER user_roles_soft_delete_trigger
    AFTER UPDATE
    ON "UserRoles"
    FOR EACH ROW EXECUTE FUNCTION log_soft_delete();
CREATE TRIGGER user_roles_restore_trigger
    AFTER UPDATE
    ON "UserRoles"
    FOR EACH ROW EXECUTE FUNCTION log_restore();

-- Add triggers for Applicant table
DROP TRIGGER IF EXISTS applicant_insert_trigger ON "Applicant";
DROP TRIGGER IF EXISTS applicant_update_trigger ON "Applicant";
DROP TRIGGER IF EXISTS applicant_delete_trigger ON "Applicant";
DROP TRIGGER IF EXISTS applicant_soft_delete_trigger ON "Applicant";
DROP TRIGGER IF EXISTS applicant_restore_trigger ON "Applicant";

CREATE TRIGGER applicant_insert_trigger
    AFTER INSERT
    ON "Applicant"
    FOR EACH ROW EXECUTE FUNCTION log_insert();
CREATE TRIGGER applicant_update_trigger
    AFTER UPDATE
    ON "Applicant"
    FOR EACH ROW EXECUTE FUNCTION log_update();
CREATE TRIGGER applicant_delete_trigger
    BEFORE DELETE
    ON "Applicant"
    FOR EACH ROW EXECUTE FUNCTION log_hard_delete();
CREATE TRIGGER applicant_soft_delete_trigger
    AFTER UPDATE
    ON "Applicant"
    FOR EACH ROW EXECUTE FUNCTION log_soft_delete();
CREATE TRIGGER applicant_restore_trigger
    AFTER UPDATE
    ON "Applicant"
    FOR EACH ROW EXECUTE FUNCTION log_restore();

-- Add triggers for LoanObligation table
DROP TRIGGER IF EXISTS loan_obligation_insert_trigger ON "LoanObligation";
DROP TRIGGER IF EXISTS loan_obligation_update_trigger ON "LoanObligation";
DROP TRIGGER IF EXISTS loan_obligation_delete_trigger ON "LoanObligation";
DROP TRIGGER IF EXISTS loan_obligation_soft_delete_trigger ON "LoanObligation";
DROP TRIGGER IF EXISTS loan_obligation_restore_trigger ON "LoanObligation";

CREATE TRIGGER loan_obligation_insert_trigger
    AFTER INSERT
    ON "LoanObligation"
    FOR EACH ROW EXECUTE FUNCTION log_insert();
CREATE TRIGGER loan_obligation_update_trigger
    AFTER UPDATE
    ON "LoanObligation"
    FOR EACH ROW EXECUTE FUNCTION log_update();
CREATE TRIGGER loan_obligation_delete_trigger
    BEFORE DELETE
    ON "LoanObligation"
    FOR EACH ROW EXECUTE FUNCTION log_hard_delete();
CREATE TRIGGER loan_obligation_soft_delete_trigger
    AFTER UPDATE
    ON "LoanObligation"
    FOR EACH ROW EXECUTE FUNCTION log_soft_delete();
CREATE TRIGGER loan_obligation_restore_trigger
    AFTER UPDATE
    ON "LoanObligation"
    FOR EACH ROW EXECUTE FUNCTION log_restore();

-- Add triggers for LoanObligationDetail table
DROP TRIGGER IF EXISTS loan_obligation_detail_insert_trigger ON "LoanObligationDetail";
DROP TRIGGER IF EXISTS loan_obligation_detail_update_trigger ON "LoanObligationDetail";
DROP TRIGGER IF EXISTS loan_obligation_detail_delete_trigger ON "LoanObligationDetail";
DROP TRIGGER IF EXISTS loan_obligation_detail_soft_delete_trigger ON "LoanObligationDetail";
DROP TRIGGER IF EXISTS loan_obligation_detail_restore_trigger ON "LoanObligationDetail";

CREATE TRIGGER loan_obligation_detail_insert_trigger
    AFTER INSERT
    ON "LoanObligationDetail"
    FOR EACH ROW EXECUTE FUNCTION log_insert();
CREATE TRIGGER loan_obligation_detail_update_trigger
    AFTER UPDATE
    ON "LoanObligationDetail"
    FOR EACH ROW EXECUTE FUNCTION log_update();
CREATE TRIGGER loan_obligation_detail_delete_trigger
    BEFORE DELETE
    ON "LoanObligationDetail"
    FOR EACH ROW EXECUTE FUNCTION log_hard_delete();
CREATE TRIGGER loan_obligation_detail_soft_delete_trigger
    AFTER UPDATE
    ON "LoanObligationDetail"
    FOR EACH ROW EXECUTE FUNCTION log_soft_delete();
CREATE TRIGGER loan_obligation_detail_restore_trigger
    AFTER UPDATE
    ON "LoanObligationDetail"
    FOR EACH ROW EXECUTE FUNCTION log_restore();

-- Add triggers for Income table
DROP TRIGGER IF EXISTS income_insert_trigger ON "Income";
DROP TRIGGER IF EXISTS income_update_trigger ON "Income";
DROP TRIGGER IF EXISTS income_delete_trigger ON "Income";
DROP TRIGGER IF EXISTS income_soft_delete_trigger ON "Income";
DROP TRIGGER IF EXISTS income_restore_trigger ON "Income";

CREATE TRIGGER income_insert_trigger
    AFTER INSERT
    ON "Income"
    FOR EACH ROW EXECUTE FUNCTION log_insert();
CREATE TRIGGER income_update_trigger
    AFTER UPDATE
    ON "Income"
    FOR EACH ROW EXECUTE FUNCTION log_update();
CREATE TRIGGER income_delete_trigger
    BEFORE DELETE
    ON "Income"
    FOR EACH ROW EXECUTE FUNCTION log_hard_delete();
CREATE TRIGGER income_soft_delete_trigger
    AFTER UPDATE
    ON "Income"
    FOR EACH ROW EXECUTE FUNCTION log_soft_delete();
CREATE TRIGGER income_restore_trigger
    AFTER UPDATE
    ON "Income"
    FOR EACH ROW EXECUTE FUNCTION log_restore();

-- Add triggers for IncomeDetail table
DROP TRIGGER IF EXISTS income_detail_insert_trigger ON "IncomeDetail";
DROP TRIGGER IF EXISTS income_detail_update_trigger ON "IncomeDetail";
DROP TRIGGER IF EXISTS income_detail_delete_trigger ON "IncomeDetail";
DROP TRIGGER IF EXISTS income_detail_soft_delete_trigger ON "IncomeDetail";
DROP TRIGGER IF EXISTS income_detail_restore_trigger ON "IncomeDetail";

CREATE TRIGGER income_detail_insert_trigger
    AFTER INSERT
    ON "IncomeDetail"
    FOR EACH ROW EXECUTE FUNCTION log_insert();
CREATE TRIGGER income_detail_update_trigger
    AFTER UPDATE
    ON "IncomeDetail"
    FOR EACH ROW EXECUTE FUNCTION log_update();
CREATE TRIGGER income_detail_delete_trigger
    BEFORE DELETE
    ON "IncomeDetail"
    FOR EACH ROW EXECUTE FUNCTION log_hard_delete();
CREATE TRIGGER income_detail_soft_delete_trigger
    AFTER UPDATE
    ON "IncomeDetail"
    FOR EACH ROW EXECUTE FUNCTION log_soft_delete();
CREATE TRIGGER income_detail_restore_trigger
    AFTER UPDATE
    ON "IncomeDetail"
    FOR EACH ROW EXECUTE FUNCTION log_restore();

-- Add triggers for Dependent table
DROP TRIGGER IF EXISTS dependent_insert_trigger ON "Dependent";
DROP TRIGGER IF EXISTS dependent_update_trigger ON "Dependent";
DROP TRIGGER IF EXISTS dependent_delete_trigger ON "Dependent";
DROP TRIGGER IF EXISTS dependent_soft_delete_trigger ON "Dependent";
DROP TRIGGER IF EXISTS dependent_restore_trigger ON "Dependent";

CREATE TRIGGER dependent_insert_trigger
    AFTER INSERT
    ON "Dependent"
    FOR EACH ROW EXECUTE FUNCTION log_insert();
CREATE TRIGGER dependent_update_trigger
    AFTER UPDATE
    ON "Dependent"
    FOR EACH ROW EXECUTE FUNCTION log_update();
CREATE TRIGGER dependent_delete_trigger
    BEFORE DELETE
    ON "Dependent"
    FOR EACH ROW EXECUTE FUNCTION log_hard_delete();
CREATE TRIGGER dependent_soft_delete_trigger
    AFTER UPDATE
    ON "Dependent"
    FOR EACH ROW EXECUTE FUNCTION log_soft_delete();
CREATE TRIGGER dependent_restore_trigger
    AFTER UPDATE
    ON "Dependent"
    FOR EACH ROW EXECUTE FUNCTION log_restore();

-- Add triggers for Bank table
DROP TRIGGER IF EXISTS bank_insert_trigger ON "Bank";
DROP TRIGGER IF EXISTS bank_update_trigger ON "Bank";
DROP TRIGGER IF EXISTS bank_delete_trigger ON "Bank";
DROP TRIGGER IF EXISTS bank_soft_delete_trigger ON "Bank";
DROP TRIGGER IF EXISTS bank_restore_trigger ON "Bank";

CREATE TRIGGER bank_insert_trigger
    AFTER INSERT
    ON "Bank"
    FOR EACH ROW EXECUTE FUNCTION log_insert();
CREATE TRIGGER bank_update_trigger
    AFTER UPDATE
    ON "Bank"
    FOR EACH ROW EXECUTE FUNCTION log_update();
CREATE TRIGGER bank_delete_trigger
    BEFORE DELETE
    ON "Bank"
    FOR EACH ROW EXECUTE FUNCTION log_hard_delete();
CREATE TRIGGER bank_soft_delete_trigger
    AFTER UPDATE
    ON "Bank"
    FOR EACH ROW EXECUTE FUNCTION log_soft_delete();
CREATE TRIGGER bank_restore_trigger
    AFTER UPDATE
    ON "Bank"
    FOR EACH ROW EXECUTE FUNCTION log_restore();

-- Add triggers for Subscription table
DROP TRIGGER IF EXISTS subscription_insert_trigger ON "Subscription";
DROP TRIGGER IF EXISTS subscription_update_trigger ON "Subscription";
DROP TRIGGER IF EXISTS subscription_delete_trigger ON "Subscription";
DROP TRIGGER IF EXISTS subscription_soft_delete_trigger ON "Subscription";
DROP TRIGGER IF EXISTS subscription_restore_trigger ON "Subscription";

CREATE TRIGGER subscription_insert_trigger
    AFTER INSERT
    ON "Subscription"
    FOR EACH ROW EXECUTE FUNCTION log_insert();
CREATE TRIGGER subscription_update_trigger
    AFTER UPDATE
    ON "Subscription"
    FOR EACH ROW EXECUTE FUNCTION log_update();
CREATE TRIGGER subscription_delete_trigger
    BEFORE DELETE
    ON "Subscription"
    FOR EACH ROW EXECUTE FUNCTION log_hard_delete();
CREATE TRIGGER subscription_soft_delete_trigger
    AFTER UPDATE
    ON "Subscription"
    FOR EACH ROW EXECUTE FUNCTION log_soft_delete();
CREATE TRIGGER subscription_restore_trigger
    AFTER UPDATE
    ON "Subscription"
    FOR EACH ROW EXECUTE FUNCTION log_restore();

-- Add triggers for BankConfiguration table
DROP TRIGGER IF EXISTS bank_configuration_insert_trigger ON "BankConfiguration";
DROP TRIGGER IF EXISTS bank_configuration_update_trigger ON "BankConfiguration";
DROP TRIGGER IF EXISTS bank_configuration_delete_trigger ON "BankConfiguration";
DROP TRIGGER IF EXISTS bank_configuration_soft_delete_trigger ON "BankConfiguration";
DROP TRIGGER IF EXISTS bank_configuration_restore_trigger ON "BankConfiguration";

CREATE TRIGGER bank_configuration_insert_trigger
    AFTER INSERT
    ON "BankConfiguration"
    FOR EACH ROW EXECUTE FUNCTION log_insert();
CREATE TRIGGER bank_configuration_update_trigger
    AFTER UPDATE
    ON "BankConfiguration"
    FOR EACH ROW EXECUTE FUNCTION log_update();
CREATE TRIGGER bank_configuration_delete_trigger
    BEFORE DELETE
    ON "BankConfiguration"
    FOR EACH ROW EXECUTE FUNCTION log_hard_delete();
CREATE TRIGGER bank_configuration_soft_delete_trigger
    AFTER UPDATE
    ON "BankConfiguration"
    FOR EACH ROW EXECUTE FUNCTION log_soft_delete();
CREATE TRIGGER bank_configuration_restore_trigger
    AFTER UPDATE
    ON "BankConfiguration"
    FOR EACH ROW EXECUTE FUNCTION log_restore();

-- Add triggers for LoanApplication table
DROP TRIGGER IF EXISTS loan_application_insert_trigger ON "LoanApplication";
DROP TRIGGER IF EXISTS loan_application_update_trigger ON "LoanApplication";
DROP TRIGGER IF EXISTS loan_application_delete_trigger ON "LoanApplication";
DROP TRIGGER IF EXISTS loan_application_soft_delete_trigger ON "LoanApplication";
DROP TRIGGER IF EXISTS loan_application_restore_trigger ON "LoanApplication";

CREATE TRIGGER loan_application_insert_trigger
    AFTER INSERT
    ON "LoanApplication"
    FOR EACH ROW EXECUTE FUNCTION log_insert();
CREATE TRIGGER loan_application_update_trigger
    AFTER UPDATE
    ON "LoanApplication"
    FOR EACH ROW EXECUTE FUNCTION log_update();
CREATE TRIGGER loan_application_delete_trigger
    BEFORE DELETE
    ON "LoanApplication"
    FOR EACH ROW EXECUTE FUNCTION log_hard_delete();
CREATE TRIGGER loan_application_soft_delete_trigger
    AFTER UPDATE
    ON "LoanApplication"
    FOR EACH ROW EXECUTE FUNCTION log_soft_delete();
CREATE TRIGGER loan_application_restore_trigger
    AFTER UPDATE
    ON "LoanApplication"
    FOR EACH ROW EXECUTE FUNCTION log_restore();

-- Add triggers for Document table
DROP TRIGGER IF EXISTS document_insert_trigger ON "Document";
DROP TRIGGER IF EXISTS document_update_trigger ON "Document";
DROP TRIGGER IF EXISTS document_delete_trigger ON "Document";
DROP TRIGGER IF EXISTS document_soft_delete_trigger ON "Document";
DROP TRIGGER IF EXISTS document_restore_trigger ON "Document";

CREATE TRIGGER document_insert_trigger
    AFTER INSERT
    ON "Document"
    FOR EACH ROW EXECUTE FUNCTION log_insert();
CREATE TRIGGER document_update_trigger
    AFTER UPDATE
    ON "Document"
    FOR EACH ROW EXECUTE FUNCTION log_update();
CREATE TRIGGER document_delete_trigger
    BEFORE DELETE
    ON "Document"
    FOR EACH ROW EXECUTE FUNCTION log_hard_delete();
CREATE TRIGGER document_soft_delete_trigger
    AFTER UPDATE
    ON "Document"
    FOR EACH ROW EXECUTE FUNCTION log_soft_delete();
CREATE TRIGGER document_restore_trigger
    AFTER UPDATE
    ON "Document"
    FOR EACH ROW EXECUTE FUNCTION log_restore();

-- Add triggers for Verification table
DROP TRIGGER IF EXISTS verification_insert_trigger ON "Verification";
DROP TRIGGER IF EXISTS verification_update_trigger ON "Verification";
DROP TRIGGER IF EXISTS verification_delete_trigger ON "Verification";
DROP TRIGGER IF EXISTS verification_soft_delete_trigger ON "Verification";
DROP TRIGGER IF EXISTS verification_restore_trigger ON "Verification";

CREATE TRIGGER verification_insert_trigger
    AFTER INSERT
    ON "Verification"
    FOR EACH ROW EXECUTE FUNCTION log_insert();
CREATE TRIGGER verification_update_trigger
    AFTER UPDATE
    ON "Verification"
    FOR EACH ROW EXECUTE FUNCTION log_update();
CREATE TRIGGER verification_delete_trigger
    BEFORE DELETE
    ON "Verification"
    FOR EACH ROW EXECUTE FUNCTION log_hard_delete();
CREATE TRIGGER verification_soft_delete_trigger
    AFTER UPDATE
    ON "Verification"
    FOR EACH ROW EXECUTE FUNCTION log_soft_delete();
CREATE TRIGGER verification_restore_trigger
    AFTER UPDATE
    ON "Verification"
    FOR EACH ROW EXECUTE FUNCTION log_restore();
