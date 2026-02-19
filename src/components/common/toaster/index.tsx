"use client";

import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

export function ThemedToaster() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      containerStyle={{
        top: 50,
      }}
      gutter={12}
      toastOptions={{
        duration: 4000,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        },
      }}
    />
  );
}
