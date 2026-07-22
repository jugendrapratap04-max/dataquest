import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { RoomsLobby } from "@/components/RoomsLobby";

export default async function RoomsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <RoomsLobby />;
}
