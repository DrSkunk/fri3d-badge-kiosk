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
      className={`border-2 border-black px-6 py-4 rounded-xl text-black text-2xl font-display font-bold bg-fri3d-mint shadow-sticker-sm transition active:translate-x-1 active:translate-y-1 active:shadow-none ${className} disabled:bg-fri3d-darkgrey disabled:text-white disabled:shadow-none`}
      {...props}
    >
      {children}
    </HUButton>
  );
}
