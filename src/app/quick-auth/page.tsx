import { Metadata } from "next";
import { APP_NAME } from "~/lib/constants";
import dynamic from "next/dynamic";

const QuickAuthExample = dynamic(() => import("~/components/QuickAuthExample").then(mod => ({ default: mod.QuickAuthExample })), {
  ssr: false,
});

export const metadata: Metadata = {
  title: `Quick Auth Demo - ${APP_NAME}`,
  description: "Demonstration of Farcaster Quick Auth implementation",
};

export default function QuickAuthPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <QuickAuthExample />
    </div>
  );
} 