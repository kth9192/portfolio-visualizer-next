import SideBar from "@/components/sideBar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <SideBar />
      <main className="flex-1 w-0 overflow-x-hidden overflow-y-auto">
        <ScrollArea className="min-h-screen">{children}</ScrollArea>
      </main>
      ;
    </div>
  );
}
