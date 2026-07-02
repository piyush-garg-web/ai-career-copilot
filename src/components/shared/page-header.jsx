import React from "react";

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/40 mb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground font-medium">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 mt-4 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
