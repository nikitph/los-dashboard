"use client";

import React from "react";
import { Button } from "@/subframe/components/Button";
import * as SubframeCore from "@subframe/core";
import { TextField } from "@/subframe/components/TextField";
import { Table } from "@/subframe/components/Table";
import { Badge } from "@/subframe/components/Badge";
import { IconButton } from "@/subframe/components/IconButton";
import { Link } from "@/i18n/navigation";

function LoanStream() {
  return (
    <div className="flex w-full flex-col items-start gap-6 px-6 py-6">
      <div className="flex w-full flex-col items-start gap-1">
        <span className="font-heading-1 text-heading-1 text-default-font">Welcome back, Sarah</span>
        <span className="font-body text-body text-subtext-color">Monday, March 25, 2024</span>
      </div>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-heading-3 text-heading-3 text-default-font">Dashboard</span>
        </div>
        <Link href="/saas/loan-applications/new">
          <Button icon="FeatherPlus" onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}>
            New Application
          </Button>
        </Link>
      </div>
      <div className="grid w-full grid-cols-4 items-start gap-4 mobile:grid mobile:grid-cols-1">
        <div className="flex flex-col items-start gap-1 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
          <div className="flex items-center gap-2">
            <SubframeCore.Icon className="font-body text-body text-neutral-900" name="FeatherFileText" />
            <span className="font-caption text-caption text-subtext-color">Today&#39;s Applications</span>
          </div>
          <span className="font-heading-1 text-heading-1 text-default-font">24</span>
        </div>
        <div className="flex flex-col items-start gap-1 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
          <div className="flex items-center gap-2">
            <SubframeCore.Icon className="font-body text-body text-warning-600" name="FeatherClock" />
            <span className="font-caption text-caption text-subtext-color">Pending Documents</span>
          </div>
          <span className="font-heading-1 text-heading-1 text-default-font">12</span>
        </div>
        <div className="flex flex-col items-start gap-1 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
          <div className="flex items-center gap-2">
            <SubframeCore.Icon className="font-body text-body text-success-600" name="FeatherCheckCircle" />
            <span className="font-caption text-caption text-subtext-color">Ready for Review</span>
          </div>
          <span className="font-heading-1 text-heading-1 text-default-font">8</span>
        </div>
        <div className="flex flex-col items-start gap-1 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
          <div className="flex items-center gap-2">
            <SubframeCore.Icon className="font-body text-body text-error-600" name="FeatherAlertCircle" />
            <span className="font-caption text-caption text-subtext-color">Rejected Applications</span>
          </div>
          <span className="font-heading-1 text-heading-1 text-default-font">3</span>
        </div>
      </div>
      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full items-center justify-between">
          <span className="font-heading-3 text-heading-3 text-default-font">Recent Applications</span>
          <TextField className="h-auto w-64 flex-none" label="" helpText="" icon="FeatherSearch">
            <TextField.Input
              placeholder="Search applications"
              value=""
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
            />
          </TextField>
        </div>
        <Table
          header={
            <Table.HeaderRow>
              <Table.HeaderCell>Application ID</Table.HeaderCell>
              <Table.HeaderCell>Applicant</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Amount</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.HeaderRow>
          }
        >
          <Table.Row>
            <Table.Cell>
              <span className="font-body text-body text-default-font">APP-2024-001</span>
            </Table.Cell>
            <Table.Cell>
              <span className="font-body text-body text-default-font">John Smith</span>
            </Table.Cell>
            <Table.Cell>
              <span className="font-body text-body text-default-font">Home Loan</span>
            </Table.Cell>
            <Table.Cell>
              <span className="font-body text-body text-default-font">$450,000</span>
            </Table.Cell>
            <Table.Cell>
              <Badge variant="warning" icon="FeatherClock">
                Pending Documents
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <IconButton icon="FeatherMoreHorizontal" onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <span className="font-body text-body text-default-font">APP-2024-002</span>
            </Table.Cell>
            <Table.Cell>
              <span className="font-body text-body text-default-font">Emma Johnson</span>
            </Table.Cell>
            <Table.Cell>
              <span className="font-body text-body text-default-font">Business Loan</span>
            </Table.Cell>
            <Table.Cell>
              <span className="font-body text-body text-default-font">$250,000</span>
            </Table.Cell>
            <Table.Cell>
              <Badge variant="success" icon="FeatherCheckCircle">
                Ready for Review
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <IconButton icon="FeatherMoreHorizontal" onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}} />
            </Table.Cell>
          </Table.Row>
        </Table>
      </div>
      <div className="grid w-full grid-cols-2 items-start gap-6 mobile:grid mobile:grid-cols-1">
        <div className="flex flex-col items-start gap-4">
          <div className="flex w-full items-center justify-between">
            <span className="font-heading-3 text-heading-3 text-default-font">Tasks</span>
            <span className="font-body text-body text-subtext-color">5 pending</span>
          </div>
          <div className="flex w-full flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
            <div className="flex w-full items-center gap-3">
              <SubframeCore.Icon className="font-body text-body text-warning-600" name="FeatherFileText" />
              <div className="flex grow flex-col items-start">
                <span className="font-body-bold text-body-bold text-default-font">Document Collection</span>
                <span className="font-caption text-caption text-subtext-color">3 applications need documents</span>
              </div>
            </div>
            <div className="flex w-full items-center gap-3">
              <SubframeCore.Icon className="font-body text-body text-neutral-600" name="FeatherUserCheck" />
              <div className="flex grow flex-col items-start">
                <span className="font-body-bold text-body-bold text-default-font">Verification Required</span>
                <span className="font-caption text-caption text-subtext-color">
                  2 applications pending verification
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-4">
          <span className="font-heading-3 text-heading-3 text-default-font">Application Status</span>
          <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex w-full items-center justify-between">
                <span className="font-body text-body text-default-font">Document Collection</span>
                <span className="font-body text-body text-default-font">12</span>
              </div>
              <div className="flex h-2 w-full flex-none items-start rounded-full bg-neutral-100">
                <div className="flex w-4/5 items-start self-stretch rounded-full bg-neutral-900" />
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex w-full items-center justify-between">
                <span className="font-body text-body text-default-font">Pending Verification</span>
                <span className="font-body text-body text-default-font">8</span>
              </div>
              <div className="flex h-2 w-full flex-none items-start rounded-full bg-neutral-100">
                <div className="flex w-3/5 items-start self-stretch rounded-full bg-neutral-900" />
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex w-full items-center justify-between">
                <span className="font-body text-body text-default-font">Ready for Review</span>
                <span className="font-body text-body text-default-font">6</span>
              </div>
              <div className="flex h-2 w-full flex-none items-start rounded-full bg-neutral-100">
                <div className="flex w-2/5 items-start self-stretch rounded-full bg-neutral-900" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanStream;
