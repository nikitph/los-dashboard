import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export default async function OverviewPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  console.log("data", data);

  return <p>Hello {data.user.phone}</p>;
}
