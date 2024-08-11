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
      className={`border px-4 py-2 rounded text-white bg-slate-800 hover:bg-slate-600 ${className}`}
      {...props}
    >
      {children}
    </HUButton>
  );
}
