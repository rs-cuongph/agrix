import { Toaster } from "sonner";

export default function PosLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-center" />
    </>
  );
}
