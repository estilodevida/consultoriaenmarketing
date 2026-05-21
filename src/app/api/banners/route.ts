import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const BANNER_STORAGE_KEY = "fam_banners";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", BANNER_STORAGE_KEY)
    .single();

  if (error || !data) {
    return NextResponse.json({ banners: [] });
  }

  const banners = data.value as {
    desktop_url: string;
    mobile_url: string;
    target: "affiliate" | "client";
    active: boolean;
    created_at: string;
  }[];

  return NextResponse.json({ banners: banners.filter((b) => b.active) });
}
