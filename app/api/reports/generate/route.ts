import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { project_id, report_type } = body;

  if (!project_id || !report_type) {
    return NextResponse.json(
      { error: "Missing project_id or report_type" },
      { status: 400 }
    );
  }

  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      project_id,
      report_type,
      status: "GENERATING",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // In production, trigger a Supabase Edge Function here
  // For now, simulate report generation
  setTimeout(async () => {
    await supabase
      .from("reports")
      .update({ status: "READY", file_url: null })
      .eq("id", report.id);
  }, 3000);

  return NextResponse.json({ report_id: report.id, status: "GENERATING" });
}