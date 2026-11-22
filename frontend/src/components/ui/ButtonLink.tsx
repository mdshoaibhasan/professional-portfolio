import type { ReactNode } from "react";
import { Link, type LinkProps } from "react-router";
import { buttonClasses, type ButtonVariant } from "@/components/ui/button-styles";

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function ButtonLink({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClasses(variant, typeof className === "string" ? className : undefined)}
      {...props}
    >
      {children}
    </Link>
  );
}
