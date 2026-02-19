import { redirect } from "next/navigation";

// Dashboard lives at root (/). This route redirects for convenience.
export default function DashboardRedirect() {
  redirect("/");
}
