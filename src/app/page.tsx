import { Suspense } from "react";
import MainView from "@/components/views/main-view";
import PageLoader from "@/components/layout/page-loader";

export default function Home() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MainView />
    </Suspense>
  );
}
