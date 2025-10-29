import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
}

function PageContainer({ children }: PageContainerProps) {
  return (
    <section className="flex flex-col w-full 2xl:w-4/5 gap-6 p-6">
      {children}
    </section>
  );
}

export default PageContainer;
