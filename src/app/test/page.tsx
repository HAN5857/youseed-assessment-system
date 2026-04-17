import { Suspense } from "react";
import TestEntry from "./TestEntry";

export default function TestEntryPage() {
  return (
    <Suspense fallback={<div className="kid-bg min-h-screen" />}>
      <TestEntry />
    </Suspense>
  );
}
