import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const BANNER_STORAGE_KEY = "fam_banners";
const BANNER_BUCKET = "fam-banners";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", BANNER_STORAGE_KEY)
    .single();

  if (error || !data) {
    return NextResponse.json({ banners: [] });
  }

  return NextResponse.json({ banners: data.value as Banner[] });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const desktopFile = formData.get("desktop") as File | null;
    const mobileFile = formData.get("mobile") as File | null;
    const target = formData.get("target") as string;

    if (!target || (target !== "affiliate" && target !== "client")) {
      return NextResponse.json({ error: "Target must be 'affiliate' or 'client'" }, { status: 400 });
    }

    if (!desktopFile || !mobileFile) {
      return NextResponse.json({ error: "Both desktop and mobile images are required" }, { status: 400 });
    }

    const timestamp = Date.now();
    const desktopPath = `${target}/desktop_${timestamp}.${desktopFile.name.split(".").pop()}`;
    const mobilePath = `${target}/mobile_${timestamp}.${mobileFile.name.split(".").pop()}`;

    const desktopBuffer = Buffer.from(await desktopFile.arrayBuffer());
    const mobileBuffer = Buffer.from(await mobileFile.arrayBuffer());

    const [desktopUpload, mobileUpload] = await Promise.all([
      supabaseAdmin.storage.from(BANNER_BUCKET).upload(desktopPath, desktopBuffer, {
        contentType: desktopFile.type,
        upsert: true,
      }),
      supabaseAdmin.storage.from(BANNER_BUCKET).upload(mobilePath, mobileBuffer, {
        contentType: mobileFile.type,
        upsert: true,
      }),
    ]);

    if (desktopUpload.error) throw new Error(`Desktop upload failed: ${desktopUpload.error.message}`);
    if (mobileUpload.error) throw new Error(`Mobile upload failed: ${mobileUpload.error.message}`);

    const { data: desktopUrl } = supabaseAdmin.storage.from(BANNER_BUCKET).getPublicUrl(desktopPath);
    const { data: mobileUrl } = supabaseAdmin.storage.from(BANNER_BUCKET).getPublicUrl(mobilePath);

    const { data: existingData } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", BANNER_STORAGE_KEY)
      .single();

    let banners = existingData?.value ? [...(existingData.value as Banner[])] : [];

    banners = banners.filter((b) => b.target !== target);

    banners.push({
      desktop_url: desktopUrl.publicUrl,
      mobile_url: mobileUrl.publicUrl,
      target,
      active: true,
      created_at: new Date().toISOString(),
    });

    const { error: upsertError } = await supabaseAdmin
      .from("settings")
      .upsert({ key: BANNER_STORAGE_KEY, value: banners }, { onConflict: "key" });

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true, banners });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { target } = await request.json();

    if (!target || (target !== "affiliate" && target !== "client")) {
      return NextResponse.json({ error: "Target must be 'affiliate' or 'client'" }, { status: 400 });
    }

    const { data: existingData } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", BANNER_STORAGE_KEY)
      .single();

    if (!existingData?.value) {
      return NextResponse.json({ banners: [] });
    }

    const banners = existingData.value as Banner[];
    const bannerToDelete = banners.find((b) => b.target === target);

    if (bannerToDelete) {
      const desktopPath = bannerToDelete.desktop_url.split("/").pop();
      const mobilePath = bannerToDelete.mobile_url.split("/").pop();
      if (desktopPath) {
        await supabaseAdmin.storage.from(BANNER_BUCKET).remove([`${target}/${desktopPath}`]);
      }
      if (mobilePath) {
        await supabaseAdmin.storage.from(BANNER_BUCKET).remove([`${target}/${mobilePath}`]);
      }
    }

    const updatedBanners = banners.filter((b) => b.target !== target);

    const { error: upsertError } = await supabaseAdmin
      .from("settings")
      .upsert({ key: BANNER_STORAGE_KEY, value: updatedBanners }, { onConflict: "key" });

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true, banners: updatedBanners });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface Banner {
  desktop_url: string;
  mobile_url: string;
  target: "affiliate" | "client";
  active: boolean;
  created_at: string;
}
