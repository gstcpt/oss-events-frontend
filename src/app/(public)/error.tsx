"use client";

import ErrorView from "@/components/common/ErrorView";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
    return <ErrorView code="500" reset={reset} />;
}
