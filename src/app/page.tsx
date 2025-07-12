import { Suspense } from "react";
import MainView from "@/components/views/main-view";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MainView />
    </Suspense>
  );
}