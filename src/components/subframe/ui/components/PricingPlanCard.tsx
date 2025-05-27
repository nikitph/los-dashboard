"use client";

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";

interface FeatureItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const FeatureItem = React.forwardRef<HTMLElement, FeatureItemProps>(function FeatureItem(
  { children, className, ...otherProps }: FeatureItemProps,
  ref,
) {
  return (
    <div className={SubframeUtils.twClassNames("flex items-center gap-3", className)} ref={ref as any} {...otherProps}>
      <SubframeCore.Icon className="font-heading-3 text-heading-3 text-brand-700" name="FeatherCheck" />
      {children ? <span className="font-body text-body text-default-font">{children}</span> : null}
    </div>
  );
});

interface PricingPlanCardRootProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  amount?: React.ReactNode;
  label?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const PricingPlanCardRoot = React.forwardRef<HTMLElement, PricingPlanCardRootProps>(function PricingPlanCardRoot(
  { title, amount, label, description, children, actions, className, ...otherProps }: PricingPlanCardRootProps,
  ref,
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-full min-w-[128px] max-w-[384px] flex-col items-start gap-8 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm",
        className,
      )}
      ref={ref as any}
      {...otherProps}
    >
      <div className="flex w-full shrink-0 grow basis-0 flex-col items-start gap-6">
        <div className="flex flex-col items-start gap-6">
          {title ? <span className="w-full font-body-bold text-body-bold text-brand-700">{title}</span> : null}
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-end gap-2">
              {amount ? <span className="font-heading-1 text-heading-1 text-default-font">{amount}</span> : null}
              {label ? <span className="font-body text-body text-default-font">{label}</span> : null}
            </div>
            {description ? <span className="w-full font-body text-body text-subtext-color">{description}</span> : null}
          </div>
        </div>
        <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
        {children ? (
          <div className="flex w-full shrink-0 grow basis-0 flex-col items-start gap-4">{children}</div>
        ) : null}
      </div>
      {actions ? <div className="flex w-full flex-col items-start gap-5">{actions}</div> : null}
    </div>
  );
});

export const PricingPlanCard = Object.assign(PricingPlanCardRoot, {
  FeatureItem,
});
