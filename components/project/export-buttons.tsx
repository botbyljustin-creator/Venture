"use client";

import { FileDown, FileSpreadsheet, Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";

export function ExportButtons({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={`/api/projects/${projectId}/export/pdf`}
        className={buttonVariants()}
        onClick={() => track("pdf_exported", { projectId })}
      >
        <FileDown className="h-4 w-4" />
        Download PDF Report
      </a>
      <a
        href={`/api/projects/${projectId}/export/xlsx`}
        className={buttonVariants({ variant: "outline" })}
        onClick={() => track("xlsx_exported", { projectId })}
      >
        <FileSpreadsheet className="h-4 w-4" />
        Download Excel Model
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className={buttonVariants({ variant: "ghost" })}
      >
        <Printer className="h-4 w-4" />
        Print
      </button>
    </div>
  );
}
