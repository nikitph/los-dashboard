import { AppAbility } from "@/lib/casl/types";

/**
 * Defines field visibility for Income model based on user permissions
 * @param ability - The CASL ability instance for the current user
 * @returns An object mapping field names to boolean visibility values
 */
export function defineIncomeFieldVisibility(ability: AppAbility) {
  return {
    // Income fields
    id: ability.can("read", "Income", "id"),
    applicantId: ability.can("read", "Income", "applicantId"),
    type: ability.can("read", "Income", "type"),
    dependents: ability.can("read", "Income", "dependents"),
    averageMonthlyExpenditure: ability.can("read", "Income", "averageMonthlyExpenditure"),
    averageGrossCashIncome: ability.can("read", "Income", "averageGrossCashIncome"),
    createdAt: ability.can("read", "Income", "createdAt"),
    updatedAt: ability.can("read", "Income", "updatedAt"),

    // IncomeDetail related fields
    incomeDetails: ability.can("read", "Income", "incomeDetails"),
  };
}

/**
 * Defines field visibility for IncomeDetail model based on user permissions
 * @param ability - The CASL ability instance for the current user
 * @returns An object mapping field names to boolean visibility values
 */
export function defineIncomeDetailFieldVisibility(ability: AppAbility) {
  return {
    id: ability.can("read", "IncomeDetail", "id"),
    incomeId: ability.can("read", "IncomeDetail", "incomeId"),
    year: ability.can("read", "IncomeDetail", "year"),
    taxableIncome: ability.can("read", "IncomeDetail", "taxableIncome"),
    taxPaid: ability.can("read", "IncomeDetail", "taxPaid"),
    grossIncome: ability.can("read", "IncomeDetail", "grossIncome"),
    rentalIncome: ability.can("read", "IncomeDetail", "rentalIncome"),
    incomeFromBusiness: ability.can("read", "IncomeDetail", "incomeFromBusiness"),
    depreciation: ability.can("read", "IncomeDetail", "depreciation"),
    grossCashIncome: ability.can("read", "IncomeDetail", "grossCashIncome"),
    createdAt: ability.can("read", "IncomeDetail", "createdAt"),
    updatedAt: ability.can("read", "IncomeDetail", "updatedAt"),
  };
}
