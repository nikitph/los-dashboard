import { prisma } from "@/lib/prisma/prisma";
import { getServerSessionUser } from "@/lib/getServerUser";
import { getPendingInvoices } from "@/lib/razorpay/actions/subscription";
import BillingSettingsForm from "@/app/[locale]/saas/(settings)/billingsettings/components/BillingSettingsForm";

export default async function BankSubscriptionPage() {
  const user = await getServerSessionUser();
  if (!user || !user.currentRole?.bankId) {
    return null;
  }

  const subscription = await prisma.subscription.findUnique({
    where: { bankId: user.currentRole.bankId },
    include: {
      bank: true,
      subscriptionPayment: {
        where: { status: "SUCCESS" },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { subscriptionInvoice: true },
      },
    },
  });

  const pendingInvoices = await getPendingInvoices(subscription.id);

  return <BillingSettingsForm subscription={subscription} pendingInvoices={pendingInvoices} />;
}
