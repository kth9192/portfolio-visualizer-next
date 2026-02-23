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

      {session?.user?.name.includes("guest") && (
        <span className="text-sm ">
          게스트 모드로 이용중입니다. 사용 정보는 24시간 이후 자동 삭제됩니다.
        </span>
      )}
    </div>
  );
}

export default TitleComponent;
