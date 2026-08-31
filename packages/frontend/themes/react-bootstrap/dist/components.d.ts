import type { FormEvent, ReactNode } from "react";
type BootstrapFormProps = {
    className?: string;
    children: ReactNode;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    colorMode: "light" | "dark";
};
export declare function BootstrapLightForm(props: Omit<BootstrapFormProps, "colorMode">): import("react").JSX.Element;
export declare function BootstrapDarkForm(props: Omit<BootstrapFormProps, "colorMode">): import("react").JSX.Element;
export {};
//# sourceMappingURL=components.d.ts.map