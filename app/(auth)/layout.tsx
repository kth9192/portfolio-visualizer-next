export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <main className="w-full h-screen overflow-y-auto">{children}</main>
    </div>
  );
}
