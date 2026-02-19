import React from "react";
import { toast, Toast } from "react-hot-toast";

const TOAST_ID = "notification-toast";

interface CustomToastProps {
  t: Toast;
  message: string;
  icon: React.ReactNode;
  description?: string;
}

export const CustomToast: React.FC<CustomToastProps> = ({
  t,
  message,
  icon,
}) => {
  return (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } max-w-md w-full pointer-events-auto bg-[#FFFFFF] shadow-md rounded-md p-4 text-[#18181B]`}
      style={{
        opacity: t.visible ? 1 : 0,
        transition: "opacity 0.35s ease-in-out",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 mr-2">
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#18181B] leading-5">
              {message}
            </p>
          </div>
        </div>
        <button
          onClick={() => toast.remove(t.id)}
          className="ml-4 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-100 focus:outline-none"
          aria-label="Close notification"
        >
          <svg
            className="w-3.5 h-3.5 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export const showSuccessToast = (
  message: string,
  icon: string = "✅",
  description?: string
) => {
  // First remove any existing toasts to prevent stacking
  toast.remove(TOAST_ID);

  // Create a new toast with explicit timeout handling
  const toastId = toast.custom(
    (t: Toast) => (
      <CustomToast
        t={t}
        message={message}
        icon={icon}
        description={description}
      />
    ),
    {
      id: TOAST_ID,
      duration: 5000,
      position: "top-right",
    }
  );

  // Additional safety timeout to ensure toast is removed
  setTimeout(() => {
    toast.remove(toastId);
  }, 5100);
};

export const showErrorToast = (message: string, description?: string) => {
  // First remove any existing toasts to prevent stacking
  toast.remove(TOAST_ID);

  // Create a new toast with explicit timeout handling
  const toastId = toast.custom(
    (t: Toast) => (
      <CustomToast
        t={t}
        message={message}
        icon="❌"
        description={description}
      />
    ),
    {
      id: TOAST_ID,
      duration: 5000,
      position: "top-right",
    }
  );

  // Additional safety timeout to ensure toast is removed
  setTimeout(() => {
    toast.remove(toastId);
  }, 5100);
};
