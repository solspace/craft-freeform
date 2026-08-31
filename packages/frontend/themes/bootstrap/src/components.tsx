import type { FormEvent, ReactNode } from "react";

type BootstrapFormProps = {
  className?: string;
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  colorMode: "light" | "dark";
};

function BootstrapForm({
  className,
  children,
  onSubmit,
  colorMode,
}: BootstrapFormProps) {
  return (
    <form
      className={className}
      onSubmit={onSubmit}
      noValidate
      data-bs-theme={colorMode}
      data-freeform-bootstrap={colorMode === "dark" ? "dark" : true}
    >
      {children}
    </form>
  );
}

export function BootstrapLightForm(
  props: Omit<BootstrapFormProps, "colorMode">,
) {
  return <BootstrapForm {...props} colorMode="light" />;
}

export function BootstrapDarkForm(
  props: Omit<BootstrapFormProps, "colorMode">,
) {
  return <BootstrapForm {...props} colorMode="dark" />;
}
