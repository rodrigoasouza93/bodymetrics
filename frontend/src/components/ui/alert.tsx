import type { ReactNode } from "react";

interface AlertProps {
  readonly children: ReactNode;
  readonly tone: "error" | "success" | "warning";
}

const toneClassNames: Record<AlertProps["tone"], string> = {
  error: "border-error/30 bg-error/10 text-error",
  success: "border-success/30 bg-success/10 text-body-strong",
  warning: "border-warning/30 bg-warning/10 text-body-strong",
};

export function Alert({ children, tone }: AlertProps) {
  return (
    <p
      className={`rounded-md border px-4 py-3 text-sm leading-6 ${toneClassNames[tone]}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
