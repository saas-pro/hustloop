import { Suspense } from "react";
import MainView from "@/components/views/main-view";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MainView />
    </Suspense>
  );
}