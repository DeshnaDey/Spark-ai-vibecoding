"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect /project/new → home where the create form lives
export default function NewProjectRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex gap-2">
        <div className="typing-dot" style={{ background: "#f5a623" }} />
        <div className="typing-dot" style={{ background: "#f5a623" }} />
        <div className="typing-dot" style={{ background: "#f5a623" }} />
      </div>
    </div>
  );
}
