import { fetchBanks } from "./actions";
import { BankTable } from "./BankTable";
import BankForm from "@/components/BankForm";

export default async function BanksPage() {
  const banks = await fetchBanks();

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Banks</h1>
      <BankForm />
      <BankTable data={banks} />
    </div>
  );
}
