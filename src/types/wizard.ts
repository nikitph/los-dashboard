type StepStatus = "current" | "upcoming" | "completed";

interface Step {
  label: string;
  status: StepStatus;
}
