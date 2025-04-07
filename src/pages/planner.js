import dynamic from "next/dynamic";

const LoadDistributionPlanner = dynamic(
  () => import("@/components/LoadDistributionPlanner"),
  { ssr: false }
);

export default function PlannerPage() {
  return <LoadDistributionPlanner />;
}
