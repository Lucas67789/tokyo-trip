"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateStationPasses(stationId: string, subwayPassLink: string | null, expressPassLink: string | null, panelTitle?: string | null) {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL)) throw new Error("Unauthorized");

    const { error } = await supabase
      .from("stations")
      .update({
        subway_pass_link: subwayPassLink,
        express_pass_link: expressPassLink,
      })
      .eq("id", stationId);

    if (error) {
      console.error("Error updating station passes:", error);
      return { success: false, error: error.message };
    }

    if (panelTitle !== undefined) {
      if (panelTitle) {
        await supabase
          .from("site_settings")
          .upsert({ key: `station_panel_title_${stationId}`, value: panelTitle }, { onConflict: "key" });
      } else {
        await supabase
          .from("site_settings")
          .delete()
          .eq("key", `station_panel_title_${stationId}`);
      }
    }

    revalidatePath("/admin");
    revalidatePath("/");
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error occurred" };
  }
}

export async function addStationAttraction(data: {
  station_id?: string | null;
  name: string;
  category: string;
  icon: string;
  description: string;
  detail_content: string;
  image_url: string;
  affiliate_url: string;
}) {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL)) throw new Error("Unauthorized: 로그인 세션이 만료되었거나 관리자 권한이 없습니다.");

    const { error } = await supabase
      .from("station_attractions")
      .insert([data]);

    if (error) {
      console.error("Error adding station attraction:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/");
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error occurred" };
  }
}

export async function updateStationAttraction(id: string, data: {
  station_id?: string | null;
  name: string;
  category: string;
  icon: string;
  description: string;
  detail_content: string;
  image_url: string;
  affiliate_url: string;
}) {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL)) throw new Error("Unauthorized: 로그인 세션이 만료되었거나 관리자 권한이 없습니다.");

    const { error } = await supabase
      .from("station_attractions")
      .update(data)
      .eq("id", id);

    if (error) {
      console.error("Error updating station attraction:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/");
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error occurred" };
  }
}

export async function deleteStationAttraction(id: string) {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL)) throw new Error("Unauthorized");

    const { error } = await supabase
      .from("station_attractions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting station attraction:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/");
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error occurred" };
  }
}
