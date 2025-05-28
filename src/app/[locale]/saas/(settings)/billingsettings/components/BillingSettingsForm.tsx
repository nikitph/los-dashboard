"use client";

import { Subscription, SubscriptionInvoice, SubscriptionPayment } from "@prisma/client";
import React from "react";
import SubscriptionPaymentButton from "@/components/SubscriptionPaymentButton";
import { toastSuccess } from "@/lib/toastUtils";
import { Alert } from "@/components/subframe/ui";

type Props = {
  subscription: Subscription & {
    bank: { name: string };
    subscriptionPayment: (SubscriptionPayment & {
      subscriptionInvoice: SubscriptionInvoice | null;
    })[];
  };
  pendingInvoices: SubscriptionInvoice[];
};

const BillingSettingsForm: React.FC<Props> = ({ subscription, pendingInvoices }) => {
  const daysUntilExpiry = subscription.endDate
    ? Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpiring = daysUntilExpiry !== null && daysUntilExpiry <= 7;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;

  return (
    <div className="flex h-full w-full items-start mobile:flex-col mobile:flex-nowrap mobile:gap-0">
      <div className="container flex max-w-none grow flex-col gap-6 bg-default-background p-8 shadow-sm">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-1">
            <span className="font-heading-2 text-heading-2 text-default-font">Billing</span>
            <span className="text-body text-subtext-color">Manage subscription for {subscription.bank.name}</span>
          </div>

          {isExpired && (
            <Alert
              variant="error"
              title="Subscription expired"
              description={`Your subscription expired ${Math.abs(daysUntilExpiry!)} days ago.`}
            />
          )}

          {isExpiring && !isExpired && (
            <Alert
              variant="warning"
              title="Subscription expiring soon"
              description={`Your subscription will expire in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}.`}
            />
          )}

          <div className="grid grid-cols-1 gap-4 rounded-md bg-neutral-50 p-6 md:grid-cols-3">
            <div>
              <span className="text-body text-subtext-color">Start date</span>
              <p className="text-heading-3 text-default-font">
                {new Date(subscription.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-body text-subtext-color">Expiry date</span>
              <p className="text-heading-3 text-default-font">
                {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : "Not set"}
              </p>
            </div>
            <div>
              <span className="text-body text-subtext-color">Billing cycle</span>
              <p className="text-heading-3 text-default-font">{subscription.billingCycle}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <SubscriptionPaymentButton
              subscriptionId={subscription.id}
              paymentType="RENEWAL"
              bankName={subscription.bank.name}
              amount={subscription.amount}
              planType={subscription.planType}
              billingCycle={subscription.billingCycle}
              onSuccess={() =>
                toastSuccess({
                  title: "Payment Successful",
                  description: "Your subscription has been renewed.",
                })
              }
            />

            {subscription.planType !== "PREMIUM" && (
              <SubscriptionPaymentButton
                subscriptionId={subscription.id}
                paymentType="UPGRADE"
                bankName={subscription.bank.name}
                amount={subscription.amount * 1.5}
                planType="PREMIUM"
                billingCycle={subscription.billingCycle}
                onSuccess={() =>
                  toastSuccess({
                    title: "Plan Upgraded",
                    description: "You are now on the PREMIUM plan.",
                  })
                }
              />
            )}
          </div>

          {pendingInvoices.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-heading-3 text-default-font">Invoices</h3>
              {pendingInvoices.map((invoice) => (
                <div key={invoice.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-default-font">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-subtext-color">
                        Paid At: {new Date(invoice.paidAt).toLocaleDateString()} | ₹
                        {(invoice.totalAmount / 100).toFixed(2)}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                        invoice.status === "PAID"
                          ? "bg-green-100 text-green-800"
                          : invoice.status === "OVERDUE"
                            ? "bg-red-100 text-red-800"
                            : invoice.status === "CANCELLED"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                      } `}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingSettingsForm;
