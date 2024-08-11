import { Button as HUButton } from "@headlessui/react";

export function Button({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <HUButton
      className={`border px-6 py-4 rounded text-white text-2xl bg-slate-800 hover:bg-slate-600 ${className}`}
      {...props}
    >
      {children}
    </HUButton>
  );
}
