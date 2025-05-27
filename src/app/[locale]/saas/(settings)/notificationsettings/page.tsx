"use client";

import React from "react";
import { Button } from "@/subframe/components/Button";
import { Switch } from "@/subframe/components/Switch";
import { Checkbox } from "@/subframe/components/Checkbox";

function NotificationSettings() {
  return (
    <div className="flex h-full w-full items-start mobile:flex-col mobile:flex-nowrap mobile:gap-0">
      <div className="items-left container flex max-w-none shrink-0 grow basis-0 flex-col gap-6 self-stretch bg-default-background p-8 shadow-sm">
        <div className="flex w-full max-w-[576px] flex-col items-start gap-12">
          <div className="flex w-full flex-col items-start gap-1">
            <span className="w-full font-heading-2 text-heading-2 text-default-font">Notifications</span>
            <span className="w-full font-body text-body text-subtext-color">
              Select when and how you wish to be notified about calendar activities.
            </span>
          </div>
          <div className="flex w-full items-center gap-4 rounded-md bg-brand-50 px-4 py-4">
            <img
              className="w-8 flex-none"
              src="https://res.cloudinary.com/subframe/image/upload/v1711417564/shared/zhcrzoah8kty6cup8zud.png"
            />
            <div className="flex shrink-0 grow basis-0 flex-col items-start">
              <span className="font-body-bold text-body-bold text-default-font">You have not connected to Slack</span>
              <span className="font-caption text-caption text-subtext-color">
                Get notified in your most important channels
              </span>
            </div>
            <Button onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}>Connect</Button>
          </div>
          <div className="flex w-full flex-col items-start gap-6">
            <span className="font-heading-3 text-heading-3 text-default-font">Alerts</span>
            <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
            <div className="flex w-full items-center gap-4">
              <div className="flex shrink-0 grow basis-0 flex-col items-start">
                <span className="font-body-bold text-body-bold text-default-font">Email alert</span>
                <span className="font-caption text-caption text-subtext-color">
                  Get an email alert for upcoming and changed events. Alerts are grouped by their proximity.
                </span>
              </div>
              <Switch checked={false} onCheckedChange={(checked: boolean) => {}} />
            </div>
            <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
            <div className="flex w-full items-center gap-4">
              <div className="flex shrink-0 grow basis-0 flex-col items-start">
                <span className="font-body-bold text-body-bold text-default-font">SMS digest</span>
                <span className="font-caption text-caption text-subtext-color">
                  Get a reminder via text for imminent events.
                </span>
              </div>
              <Switch checked={false} onCheckedChange={(checked: boolean) => {}} />
            </div>
            <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
            <div className="flex w-full items-center gap-4">
              <div className="flex shrink-0 grow basis-0 flex-col items-start">
                <span className="font-body-bold text-body-bold text-default-font">Slack digest</span>
                <span className="font-caption text-caption text-subtext-color">
                  Stay informed through Slack for events that are around the corner.
                </span>
              </div>
              <Switch checked={false} onCheckedChange={(checked: boolean) => {}} />
            </div>
            <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
          </div>
          <div className="flex w-full flex-col items-start gap-6">
            <div className="flex w-full items-start">
              <span className="shrink-0 grow basis-0 font-heading-3 text-heading-3 text-default-font">Preferences</span>
              <div className="flex w-16 flex-none items-end justify-center gap-1 self-stretch">
                <span className="font-body-bold text-body-bold text-default-font">Email</span>
              </div>
              <div className="flex w-16 flex-none items-end justify-center gap-1 self-stretch">
                <span className="font-body-bold text-body-bold text-default-font">SMS</span>
              </div>
              <div className="flex w-16 flex-none items-end justify-center gap-1 self-stretch">
                <span className="font-body-bold text-body-bold text-default-font">Slack</span>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-3">
              <div className="flex w-full items-start">
                <span className="shrink-0 grow basis-0 font-body-bold text-body-bold text-default-font">General</span>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
              </div>
              <div className="flex w-full items-start">
                <span className="shrink-0 grow basis-0 font-body text-body text-subtext-color">
                  You receive an event invitation
                </span>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
              </div>
              <div className="flex w-full items-start">
                <span className="shrink-0 grow basis-0 font-body text-body text-subtext-color">
                  You receive a reminder for an event you&#39;re attending
                </span>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
              </div>
              <div className="flex w-full items-start">
                <span className="shrink-0 grow basis-0 font-body text-body text-subtext-color">
                  You receive updated event details like location, time
                </span>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-3">
              <div className="flex w-full items-start">
                <span className="shrink-0 grow basis-0 font-body-bold text-body-bold text-default-font">Events</span>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
              </div>
              <div className="flex w-full items-start">
                <span className="shrink-0 grow basis-0 font-body text-body text-subtext-color">
                  Participant accepted your event
                </span>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
              </div>
              <div className="flex w-full items-start">
                <span className="shrink-0 grow basis-0 font-body text-body text-subtext-color">
                  Participant declined your event
                </span>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
              </div>
              <div className="flex w-full items-start">
                <span className="shrink-0 grow basis-0 font-body text-body text-subtext-color">
                  Participant added a comment to your event
                </span>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
              </div>
              <div className="flex w-full items-start">
                <span className="shrink-0 grow basis-0 font-body text-body text-subtext-color">
                  Participant modifies your event
                </span>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
                <div className="flex w-16 flex-none items-center justify-center gap-2 self-stretch">
                  <Checkbox label="" checked={false} onCheckedChange={(checked: boolean) => {}} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationSettings;
