"use client";

import React from "react";
import { Progress } from "@/subframe/components/Progress";
import { Button } from "@/subframe/components/Button";
import { Tooltip } from "@/subframe/components/Tooltip";
import * as SubframeCore from "@subframe/core";
import { PaymentMethodRow } from "@/subframe/components/PaymentMethodRow";
import { Alert } from "@/subframe/components/Alert";
import { PricingPlanCard } from "@/subframe/components/PricingPlanCard";

function BillingSettings() {
  return (
    <div className="flex h-full w-full items-start mobile:flex-col mobile:flex-nowrap mobile:gap-0">
      <div className="items-left container flex max-w-none shrink-0 grow basis-0 flex-col gap-6 self-stretch bg-default-background p-8 shadow-sm">
        <div className="flex w-full max-w-[768px] flex-col items-start gap-12">
          <div className="flex w-full flex-col items-start gap-1">
            <span className="w-full font-heading-2 text-heading-2 text-default-font">Billing</span>
            <span className="w-full font-body text-body text-subtext-color">
              See your usage and manage your payment methods, subscription.
            </span>
          </div>
          <div className="flex w-full flex-col items-start gap-6">
            <span className="font-heading-3 text-heading-3 text-default-font">Usage</span>
            <div className="flex w-full flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
              <span className="font-body-bold text-body-bold text-default-font">Seats</span>
              <Progress value={25} />
              <div className="flex w-full flex-wrap items-center gap-2">
                <span className="shrink-0 grow basis-0 font-body-bold text-body-bold text-brand-700">
                  5 out of 20 seats used
                </span>
                <Button
                  variant="brand-tertiary"
                  iconRight="FeatherArrowRight"
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  Upgrade
                </Button>
              </div>
            </div>
            <div className="flex w-full flex-wrap items-start gap-4 rounded-md bg-neutral-50 px-6 py-6 mobile:flex-col mobile:flex-wrap mobile:gap-6">
              <div className="flex shrink-0 grow basis-0 flex-col items-start justify-center gap-1">
                <div className="flex items-center gap-1">
                  <span className="font-body text-body text-subtext-color">Events booked</span>
                  <SubframeCore.Tooltip.Provider>
                    <SubframeCore.Tooltip.Root>
                      <SubframeCore.Tooltip.Trigger asChild={true}>
                        <SubframeCore.Icon className="font-body text-body text-neutral-400" name="FeatherInfo" />
                      </SubframeCore.Tooltip.Trigger>
                      <SubframeCore.Tooltip.Portal>
                        <SubframeCore.Tooltip.Content side="top" align="center" sideOffset={4} asChild={true}>
                          <Tooltip>Tooltip</Tooltip>
                        </SubframeCore.Tooltip.Content>
                      </SubframeCore.Tooltip.Portal>
                    </SubframeCore.Tooltip.Root>
                  </SubframeCore.Tooltip.Provider>
                </div>
                <span className="font-heading-3 text-heading-3 text-error-700">100 / 100</span>
              </div>
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1">
                <div className="flex items-center gap-1">
                  <span className="font-body text-body text-subtext-color">Meetings scheduled</span>
                  <SubframeCore.Tooltip.Provider>
                    <SubframeCore.Tooltip.Root>
                      <SubframeCore.Tooltip.Trigger asChild={true}>
                        <SubframeCore.Icon className="font-body text-body text-neutral-400" name="FeatherInfo" />
                      </SubframeCore.Tooltip.Trigger>
                      <SubframeCore.Tooltip.Portal>
                        <SubframeCore.Tooltip.Content side="top" align="center" sideOffset={4} asChild={true}>
                          <Tooltip>Tooltip</Tooltip>
                        </SubframeCore.Tooltip.Content>
                      </SubframeCore.Tooltip.Portal>
                    </SubframeCore.Tooltip.Root>
                  </SubframeCore.Tooltip.Provider>
                </div>
                <span className="font-heading-3 text-heading-3 text-default-font">42 / 50</span>
              </div>
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1">
                <span className="font-body text-body text-subtext-color">Calendar connections</span>
                <span className="font-heading-3 text-heading-3 text-default-font">38 / 100</span>
              </div>
            </div>
          </div>
          <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
          <div className="flex w-full flex-col items-start gap-6">
            <div className="flex w-full items-center gap-2">
              <span className="shrink-0 grow basis-0 font-heading-3 text-heading-3 text-default-font">Payment</span>
              <Button icon="FeatherPlus" onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}>
                Add
              </Button>
            </div>
            <div className="flex w-full flex-col items-start gap-4">
              <PaymentMethodRow
                logo="https://res.cloudinary.com/subframe/image/upload/v1711417566/shared/hktgej31fyvtnv8z0xtr.png"
                title="Mastercard ••••0213"
                subtitle="Expires 09/26"
                isDefault={true}
              />
              <PaymentMethodRow
                logo="https://res.cloudinary.com/subframe/image/upload/v1711417566/shared/cnc9wdevqyfh9a708vyc.png"
                title="Visa ••••9483"
                subtitle="Expires 11/25"
              />
            </div>
          </div>
          <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
          <div className="flex w-full shrink-0 grow basis-0 flex-col items-start gap-6">
            <span className="font-heading-3 text-heading-3 text-default-font">Subscription</span>
            <Alert
              variant="brand"
              title="You have 21 days left in your Basic plan trial."
              description="To avoid any disruptions to your current workflow, upgrade your plan below."
            />
            <div className="flex w-full flex-wrap items-start gap-4 rounded-md bg-neutral-50 px-6 py-6 mobile:flex-col mobile:flex-wrap mobile:gap-4">
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1">
                <span className="font-body text-body text-subtext-color">Start date</span>
                <span className="font-heading-3 text-heading-3 text-default-font">March 22, 2023</span>
              </div>
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1">
                <span className="font-body text-body text-subtext-color">Next payment</span>
                <span className="font-heading-3 text-heading-3 text-default-font">Oct 22, 2023</span>
              </div>
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1">
                <span className="font-body text-body text-subtext-color">Billed</span>
                <span className="font-heading-3 text-heading-3 text-default-font">Monthly</span>
              </div>
            </div>
            <div className="flex w-full items-start gap-4 mobile:flex-col mobile:flex-nowrap mobile:gap-4">
              <PricingPlanCard
                className="mobile:h-auto mobile:w-full mobile:min-w-[128px] mobile:flex-none"
                title="Free"
                amount="$0"
                label="per month"
                description="The basics to get you started. Free forever."
                actions={
                  <Button
                    className="h-10 w-full flex-none"
                    variant="brand-secondary"
                    size="large"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Downgrade
                  </Button>
                }
              >
                <PricingPlanCard.FeatureItem className="h-auto w-full flex-none">
                  5 team members
                </PricingPlanCard.FeatureItem>
                <PricingPlanCard.FeatureItem className="h-auto w-full flex-none">
                  20 event bookings
                </PricingPlanCard.FeatureItem>
                <PricingPlanCard.FeatureItem className="h-auto w-full flex-none">
                  10 meetings scheduled
                </PricingPlanCard.FeatureItem>
                <PricingPlanCard.FeatureItem className="h-auto w-full flex-none">
                  Event notifications
                </PricingPlanCard.FeatureItem>
              </PricingPlanCard>
              <PricingPlanCard
                className="mobile:h-auto mobile:w-full mobile:min-w-[128px] mobile:flex-none"
                title="Professional"
                amount="$29"
                label="per month"
                description="For small teams with calendar needs."
                actions={
                  <Button
                    className="h-10 w-full flex-none"
                    variant="neutral-secondary"
                    size="large"
                    icon="FeatherCheck"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Current plan
                  </Button>
                }
              >
                <PricingPlanCard.FeatureItem className="h-auto w-full flex-none">
                  20 team members
                </PricingPlanCard.FeatureItem>
                <PricingPlanCard.FeatureItem className="h-auto w-full flex-none">
                  100 event bookings
                </PricingPlanCard.FeatureItem>
                <PricingPlanCard.FeatureItem className="h-auto w-full flex-none">
                  50 meetings scheduled
                </PricingPlanCard.FeatureItem>
                <PricingPlanCard.FeatureItem className="h-auto w-full flex-none">
                  Premium support
                </PricingPlanCard.FeatureItem>
              </PricingPlanCard>
              <PricingPlanCard
                className="mobile:h-auto mobile:w-full mobile:min-w-[128px] mobile:flex-none"
                title="Enterprise"
                amount="Contact us"
                label=""
                description="For larger teams or custom plans."
                actions={
                  <Button
                    className="h-10 w-full flex-none"
                    size="large"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Contact us
                  </Button>
                }
              >
                <PricingPlanCard.FeatureItem className="h-auto w-full flex-none">
                  SSO &amp; user provisioning
                </PricingPlanCard.FeatureItem>
                <PricingPlanCard.FeatureItem className="h-auto w-full flex-none">
                  SOC2 compliance
                </PricingPlanCard.FeatureItem>
                <PricingPlanCard.FeatureItem className="h-auto w-full flex-none">
                  24/7 support
                </PricingPlanCard.FeatureItem>
              </PricingPlanCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillingSettings;
