export interface ProjectStatusInfo {
  label: string;
  variant: "secondary" | "success" | "warning" | "danger" | "outline";
}

export function getProjectStatusInfo(status: string, ventureScore: number | null): ProjectStatusInfo {
  switch (status) {
    case "draft":
      return { label: "Draft", variant: "outline" };
    case "generating":
      return { label: "Generating…", variant: "secondary" };
    case "error":
      return { label: "Generation Failed", variant: "danger" };
    case "ready":
      if (ventureScore !== null && ventureScore >= 70) return { label: "Launch Ready", variant: "success" };
      if (ventureScore !== null && ventureScore >= 50) return { label: "Needs Refinement", variant: "warning" };
      return { label: "High Risk", variant: "danger" };
    default:
      return { label: status, variant: "secondary" };
  }
}
