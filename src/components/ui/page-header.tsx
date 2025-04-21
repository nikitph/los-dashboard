import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * A reusable page header component with title, description, and actions
 *
 * @param {PageHeaderProps} props - Component props
 * @returns {JSX.Element} Rendered page header
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
