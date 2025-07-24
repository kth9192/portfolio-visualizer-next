import SideBar from "@/components/sideBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <SideBar />
      <main className="w-full h-screen overflow-y-auto">{children}</main>;
    </div>
  );
}
