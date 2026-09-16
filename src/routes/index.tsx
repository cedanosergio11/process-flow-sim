import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/hmi/app-shell";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <AppShell />;
}
