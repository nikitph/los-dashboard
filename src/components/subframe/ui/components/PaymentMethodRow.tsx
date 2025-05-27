"use client";

import React from "react";
import * as SubframeUtils from "../utils";
import { Badge } from "./Badge";
import { DropdownMenu } from "./DropdownMenu";
import * as SubframeCore from "@subframe/core";
import { IconButton } from "./IconButton";

interface PaymentMethodRowRootProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  logo?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  isDefault?: boolean;
  className?: string;
}

const PaymentMethodRowRoot = React.forwardRef<HTMLElement, PaymentMethodRowRootProps>(function PaymentMethodRowRoot(
  { logo, title, subtitle, isDefault = false, className, ...otherProps }: PaymentMethodRowRootProps,
  ref,
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/ebe0e1ae flex w-full items-center gap-4 rounded-md bg-neutral-50 px-4 py-4",
        className,
      )}
      ref={ref as any}
      {...otherProps}
    >
      {logo ? <img className="w-12 flex-none" src={logo} /> : null}
      <div className="flex shrink-0 grow basis-0 flex-col items-start">
        <div className="flex items-center gap-2">
          {title ? <span className="font-body-bold text-body-bold text-default-font">{title}</span> : null}
          <Badge
            className={SubframeUtils.twClassNames("hidden", {
              flex: isDefault,
            })}
            variant="neutral"
          >
            Default
          </Badge>
        </div>
        {subtitle ? <span className="font-caption text-caption text-subtext-color">{subtitle}</span> : null}
      </div>
      <SubframeCore.DropdownMenu.Root>
        <SubframeCore.DropdownMenu.Trigger asChild={true}>
          <IconButton size="medium" icon="FeatherMoreHorizontal" />
        </SubframeCore.DropdownMenu.Trigger>
        <SubframeCore.DropdownMenu.Portal>
          <SubframeCore.DropdownMenu.Content side="bottom" align="end" sideOffset={8} asChild={true}>
            <DropdownMenu>
              <DropdownMenu.DropdownItem icon="FeatherCheck">Make default</DropdownMenu.DropdownItem>
              <DropdownMenu.DropdownItem icon="FeatherMinusCircle">Remove</DropdownMenu.DropdownItem>
            </DropdownMenu>
          </SubframeCore.DropdownMenu.Content>
        </SubframeCore.DropdownMenu.Portal>
      </SubframeCore.DropdownMenu.Root>
    </div>
  );
});

export const PaymentMethodRow = PaymentMethodRowRoot;
