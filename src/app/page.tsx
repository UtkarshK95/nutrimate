import { redirect } from "next/navigation";

// Stage 2 will replace this with the landing page + disclaimer modal.
// For now, go straight to the dashboard.
export default function Home() {
  redirect("/dashboard");
}
