"use client";

import React from "react";
import { Button } from "@/subframe/components/Button";
import { TextField } from "@/subframe/components/TextField";
import { Alert } from "@/subframe/components/Alert";

function AccountSettings() {
  return (
    <div className="flex h-full w-full items-start mobile:flex-col mobile:flex-nowrap mobile:gap-0">
      <div className="container flex max-w-none shrink-0 grow basis-0 flex-col items-start gap-6 self-stretch bg-default-background p-8 shadow-sm">
        <div className="flex w-full max-w-[576px] flex-col items-start gap-12">
          <div className="flex w-full flex-col items-start gap-1">
            <span className="w-full font-heading-2 text-heading-2 text-default-font">Account</span>
            <span className="w-full font-body text-body text-subtext-color">
              Update your profile and personal details here
            </span>
          </div>
          <div className="flex w-full flex-col items-start gap-6">
            <span className="font-heading-3 text-heading-3 text-default-font">Profile</span>
            <div className="flex w-full flex-col items-start gap-4">
              <span className="font-body-bold text-body-bold text-default-font">Avatar</span>
              <div className="flex items-center gap-4">
                <img
                  className="h-16 w-16 flex-none object-cover [clip-path:circle()]"
                  src="https://res.cloudinary.com/subframe/image/upload/v1711417513/shared/kwut7rhuyivweg8tmyzl.jpg"
                />
                <div className="flex flex-col items-start gap-2">
                  <Button
                    variant="neutral-secondary"
                    icon="FeatherUpload"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Upload
                  </Button>
                  <span className="font-caption text-caption text-subtext-color">
                    For best results, upload an image 512x512 or larger.
                  </span>
                </div>
              </div>
            </div>
            <div className="flex w-full items-center gap-4">
              <TextField className="h-auto shrink-0 grow basis-0" label="First name" helpText="">
                <TextField.Input
                  placeholder="Josef"
                  value=""
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                />
              </TextField>
              <TextField className="h-auto shrink-0 grow basis-0" label="Last name" helpText="">
                <TextField.Input
                  placeholder="Albers"
                  value=""
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                />
              </TextField>
            </div>
            <div className="flex w-full items-center gap-4">
              <TextField className="h-auto shrink-0 grow basis-0" label="Email" helpText="">
                <TextField.Input
                  placeholder="josef@subframe.com"
                  value=""
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                />
              </TextField>
            </div>
          </div>
          <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
          <div className="flex w-full flex-col items-start gap-6">
            <span className="font-heading-3 text-heading-3 text-default-font">Password</span>
            <TextField className="h-auto w-full flex-none" label="Current password" helpText="">
              <TextField.Input
                type="password"
                placeholder="Enter current password"
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
              />
            </TextField>
            <TextField
              className="h-auto w-full flex-none"
              label="New password"
              helpText="Your password must have at least 8 characters, include one uppercase letter, and one number."
            >
              <TextField.Input
                type="password"
                placeholder="Enter new password"
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
              />
            </TextField>
            <TextField className="h-auto w-full flex-none" label="" helpText="">
              <TextField.Input
                type="password"
                placeholder="Re-type new password"
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
              />
            </TextField>
            <div className="flex w-full flex-col items-start justify-center gap-6">
              <Button onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}>Change password</Button>
            </div>
          </div>
          <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
          <div className="flex w-full flex-col items-start gap-6">
            <span className="font-heading-3 text-heading-3 text-default-font">Danger zone</span>
            <Alert
              variant="error"
              icon={null}
              title="Delete account"
              description="Permanently remove your account. This action is not reversible."
              actions={
                <Button variant="destructive-secondary" onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}>
                  Delete account
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
