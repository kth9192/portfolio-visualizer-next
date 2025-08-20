import SideBar from "@/components/sideBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full overflow-hidden">
      <SideBar />
      <main className="flex-1 overflow-hidden">
        <div className="w-full h-full overflow-auto">{children}</div>
      </main>
    </div>
  );
}
