import Link from "next/link";
import type { ReactNode } from "react";

interface ButtonProps {
  readonly children: ReactNode;
  readonly disabled?: boolean;
  readonly type?: "button" | "submit";
}

interface LinkButtonProps {
  readonly children: ReactNode;
  readonly href: string;
}

const buttonClassName =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium leading-none text-on-primary transition hover:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-muted";

export function Button({ children, disabled = false, type = "button" }: ButtonProps) {
  return (
    <button className={buttonClassName} disabled={disabled} type={type}>
      {children}
    </button>
  );
}

export function LinkButton({ children, href }: LinkButtonProps) {
  return (
    <Link className={buttonClassName} href={href}>
      {children}
    </Link>
  );
}
