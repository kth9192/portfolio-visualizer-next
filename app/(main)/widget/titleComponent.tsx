"use client";

import { authClient } from "@/lib/auth-clinet";
import React from "react";

function TitleComponent() {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold text-gray-900">
        환영합니다!{" "}
        {session?.user?.name.includes("guest")
          ? "- guest"
          : session?.user?.name}
        님
      </h1>
    </div>
  );
}

export default TitleComponent;
