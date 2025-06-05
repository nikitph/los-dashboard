"use client";
/*
 * Documentation:
 * Chat Select Item — https://app.subframe.com/library?component=Chat+Select+Item_4ecc2bc0-3981-4ea5-bac3-8de44cec3d3b
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";

interface ChatSelectItemRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  selected?: boolean;
  className?: string;
}

const ChatSelectItemRoot = React.forwardRef<
  HTMLElement,
  ChatSelectItemRootProps
>(function ChatSelectItemRoot(
  {
    title,
    subtitle,
    selected = false,
    className,
    ...otherProps
  }: ChatSelectItemRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/4ecc2bc0 flex w-full cursor-pointer items-center gap-4 rounded-md px-3 py-3 hover:bg-neutral-100",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      <div className="flex grow shrink-0 basis-0 flex-col items-start">
        {title ? (
          <span className="text-body font-body text-default-font">{title}</span>
        ) : null}
        {subtitle ? (
          <span className="text-caption font-caption text-subtext-color">
            {subtitle}
          </span>
        ) : null}
      </div>
      <SubframeCore.Icon
        className={SubframeUtils.twClassNames(
          "hidden text-body font-body text-default-font",
          { "inline-flex text-heading-3 font-heading-3": selected }
        )}
        name="FeatherCheckCircle2"
      />
    </div>
  );
});

export const ChatSelectItem = ChatSelectItemRoot;
