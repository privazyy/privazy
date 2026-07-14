import * as React from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export interface DataTableColumn<Row> {
  align?: "left" | "right" | "center";
  className?: string;
  header: React.ReactNode;
  key: string;
  render: (row: Row) => React.ReactNode;
}

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  emptyDescription?: React.ReactNode;
  emptyHeading?: React.ReactNode;
  getRowKey: (row: Row, index: number) => React.Key;
  rows: Row[];
}

const alignClasses = {
  center: "text-center",
  left: "text-left",
  right: "text-right",
};

export function DataTable<Row>({
  columns,
  emptyDescription = "Zmien filtry albo dodaj pierwszy rekord.",
  emptyHeading = "Brak danych",
  getRowKey,
  rows,
}: DataTableProps<Row>) {
  if (rows.length === 0) {
    return <EmptyState description={emptyDescription} heading={emptyHeading} />;
  }

  return (
    <div className="pvz-h-scroll min-w-0 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)]" data-responsive-scroll="true">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead className="bg-[var(--surface-sunken)] text-xs font-semibold uppercase text-[var(--text-muted)]">
          <tr>
            {columns.map((column) => (
              <th className={cn("px-4 py-3", alignClasses[column.align ?? "left"], column.className)} key={column.key}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {rows.map((row, index) => (
            <tr className="hover:bg-[var(--gray-50)]" key={getRowKey(row, index)}>
              {columns.map((column) => (
                <td
                  className={cn("min-w-0 px-4 py-3 align-top text-[var(--text-body)]", alignClasses[column.align ?? "left"], column.className)}
                  key={column.key}
                >
                  <div className="min-w-0 break-words">{column.render(row)}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
