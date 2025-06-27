import { CheckIcon, InfoIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const ToastIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "success":
      return <CheckIcon className="size-4 text-pbaa-system-green" />;
    case "error":
      return <div>error</div>;
    case "warning":
      return <div>warning</div>;
    case "info":
      return <div>info</div>;
    default:
      return <></>;
  }
};

export const showToast = {
  success: (title: string, description?: string) => {
    toast.custom(() => (
      <div className="flex min-w-80 items-center gap-2.5 bg-primary text-white shadow px-3 py-4  rounded-[10px]">
        <CheckIcon className="size-4 text-pbaa-system-green" />
        <span className="text-sm font-medium">{title}</span>
      </div>
    ));
  },

  error: (title: string, description?: string) => {
    toast.custom(() => (
      <div className="flex min-w-80 items-center gap-2.5 bg-destructive text-white shadow px-3 py-4 rounded-[10px]">
        <InfoIcon className="size-4 " />
        <span className="text-sm font-medium">{title}</span>
      </div>
    ));
  },
};
