import { CheckIcon, InfoIcon } from "lucide-react";
import { toast } from "sonner";

const ToastIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "success":
      return <CheckIcon className="size-4 text-pbaa-system-green" />;
    case "error":
      return <InfoIcon className="size-4 " />;
    case "warning":
      return <InfoIcon className="size-4 " />;
    case "info":
      return <InfoIcon className="size-4 " />;
    default:
      return <></>;
  }
};

export const showToast = {
  success: (title: string, description?: string) => {
    toast.custom(() => (
      <div className="flex min-w-80 items-center gap-2.5 bg-primary text-white shadow px-3 py-4  rounded-[10px]">
        <ToastIcon type="success" />
        <span className="text-sm font-medium">{title}</span>
        {description && (
          <span className="text-sm font-medium">{description}</span>
        )}
      </div>
    ));
  },

  error: (title: string, description?: string) => {
    toast.custom(() => (
      <div className="flex min-w-80 items-center gap-2.5 bg-destructive text-white shadow px-3 py-4 rounded-[10px]">
        <ToastIcon type="error" />
        <span className="text-sm font-medium">{title}</span>
        {description && (
          <span className="text-sm font-medium">{description}</span>
        )}
      </div>
    ));
  },
};
