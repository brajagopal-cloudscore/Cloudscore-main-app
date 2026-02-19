 "use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemedToaster() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
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
        // Default duration
        duration: 4000,
      }}
    />
  );
}

