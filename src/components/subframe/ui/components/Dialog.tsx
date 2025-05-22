"use client";

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";

interface ContentProps extends React.ComponentProps<typeof SubframeCore.Dialog.Content> {
  children?: React.ReactNode;
  className?: string;
}

const Content = React.forwardRef<HTMLElement, ContentProps>(function Content(
  { children, className, ...otherProps }: ContentProps,
  ref,
) {
  return children ? (
    <SubframeCore.Dialog.Content asChild={true} {...otherProps}>
      <div
        className={SubframeUtils.twClassNames(
          "flex max-h-[90vh] min-w-[320px] flex-col items-start gap-2 overflow-auto rounded-md border border-solid border-neutral-border bg-default-background shadow-lg",
          className,
        )}
        ref={ref as any}
      >
        {children}
      </div>
    </SubframeCore.Dialog.Content>
  ) : null;
});

interface DialogRootProps extends React.ComponentProps<typeof SubframeCore.Dialog.Root> {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const DialogRoot = React.forwardRef<HTMLElement, DialogRootProps>(function DialogRoot(
  { children, className, ...otherProps }: DialogRootProps,
  ref,
) {
  return children ? (
    <SubframeCore.Dialog.Root asChild={true} {...otherProps}>
      <div
        className={SubframeUtils.twClassNames(
          "fixed inset-0 z-50 flex h-full w-full flex-col items-center justify-center gap-2 bg-black/10 backdrop-blur-sm",
          className,
        )}
        ref={ref as any}
      >
        {children}
      </div>
    </SubframeCore.Dialog.Root>
  ) : null;
});

export const Dialog = Object.assign(DialogRoot, {
  Content,
});
