"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useLocale } from "next-intl";

// Map of path segments to human-readable names
const segmentLabels: Record<string, string> = {
  saas: "SaaS",
  applicants: "Applicants",
  "loan-applications": "Loan Applications",
  income: "Income",
  loaneligibility: "Loan Eligibility",
  businessverification: "Business Verification",
  residenceverification: "Residence Verification",
  physicalverification: "Physical Verification",
  mortgageeligibility: "Mortgage Eligibility",
  propertyeligibility: "Property Eligibility",
  ploteligibility: "Plot Eligibility",
  vehicleeligibility: "Vehicle Eligibility",
  banks: "Banks",
  quotes: "Quotes",
  dashboard: "Dashboard",
  list: "List",
  create: "Create",
  edit: "Edit",
  view: "View",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const locale = useLocale();

  const breadcrumbs = useMemo(() => {
    // Skip empty segments
    const segments = pathname.split("/").filter(Boolean);

    // Build the breadcrumbs array with cumulative paths
    return segments.map((segment, index) => {
      // Build the href for this breadcrumb
      const href = `/${segments.slice(0, index + 1).join("/")}`;

      // Get a human-readable label for this segment
      const label = segmentLabels[segment] || segment;

      // Is this the last segment? (current page)
      const isCurrent = index === segments.length - 1;

      return { href, label, isCurrent };
    });
  }, [pathname]);

  // If we're on the root path, don't show breadcrumbs
  if (breadcrumbs.length === 0) {
    return null;
  }

  if (pathname === "/saas/dashboard") {
    return (
      <Link
        href={`/${locale}/saas/dashboard`}
        className="text-gray-500 transition hover:text-gray-700 dark:text-gray-400 hover:dark:text-gray-300"
      >
        Dashboard
      </Link>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="ml-2">
      <ol role="list" className="flex items-center space-x-3 text-sm">
        {/* Always include Dashboard as the first breadcrumb */}
        <li className="flex">
          <Link
            href={`/${locale}/saas/dashboard`}
            className="text-gray-500 transition hover:text-gray-700 dark:text-gray-400 hover:dark:text-gray-300"
          >
            Dashboard
          </Link>
        </li>

        {/* Map through our generated breadcrumbs */}
        {breadcrumbs.map(
          (crumb, index) =>
            // Skip "saas" in the visible breadcrumbs since we already have Home
            crumb.label !== "SaaS" &&
            crumb.label !== locale && (
              <li key={crumb.href} className="flex">
                <div className="flex items-center">
                  {index > 0 && index < breadcrumbs.length && (
                    <ChevronRight className="size-4 shrink-0 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                  )}
                  <Link
                    href={crumb.href}
                    aria-current={crumb.isCurrent ? "page" : undefined}
                    className={`${
                      crumb.isCurrent
                        ? "font-medium text-gray-900 dark:text-gray-50"
                        : "text-gray-500 transition hover:text-gray-700 dark:text-gray-400 hover:dark:text-gray-300"
                    } ${index > 0 ? "ml-3" : ""}`}
                  >
                    {crumb.label}
                  </Link>
                </div>
              </li>
            ),
        )}
      </ol>
    </nav>
  );
}
