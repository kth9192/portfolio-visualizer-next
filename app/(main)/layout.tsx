import SideBar from "@/components/sideBar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <SideBar />
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
