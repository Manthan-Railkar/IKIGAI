import { SupabaseClient } from "@supabase/supabase-js";
import { Profile, ProfileUpdateInput } from "@/types/profile";

/**
 * Retrieves the currently authenticated user's profile.
 * If the profile record doesn't exist yet, it automatically creates one from user metadata.
 */
export async function getCurrentProfile(
  supabase: SupabaseClient
): Promise<{ profile: Profile | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { profile: null, error: authError || null };
    }

    // Try fetching existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching profile:", fetchError);
      return { profile: null, error: fetchError };
    }

    if (existingProfile) {
      return { profile: existingProfile as Profile, error: null };
    }

    // Profile does not exist yet; auto-provision a profile row from user auth metadata
    const metadata = user.user_metadata || {};
    const defaultName =
      metadata.full_name ||
      metadata.name ||
      user.email?.split("@")[0] ||
      "Museum Explorer";
    const defaultAvatar = metadata.avatar_url || metadata.picture || null;

    const newProfileData: Partial<Profile> = {
      id: user.id,
      email: user.email ?? null,
      full_name: defaultName,
      avatar_url: defaultAvatar,
      role: "visitor",
      updated_at: new Date().toISOString(),
    };

    const { data: createdProfile, error: insertError } = await supabase
      .from("profiles")
      .upsert(newProfileData)
      .select("*")
      .single();

    if (insertError) {
      console.error("Error creating profile:", insertError);
      return { profile: null, error: insertError };
    }

    return { profile: createdProfile as Profile, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Failed to get profile");
    return { profile: null, error };
  }
}

/**
 * Updates the currently authenticated user's profile.
 */
export async function updateCurrentProfile(
  supabase: SupabaseClient,
  updates: ProfileUpdateInput
): Promise<{ profile: Profile | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { profile: null, error: authError || new Error("Not authenticated") };
    }

    const payload: Record<string, unknown> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id)
      .select("*")
      .single();

    if (updateError) {
      return { profile: null, error: updateError };
    }

    return { profile: updatedProfile as Profile, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Failed to update profile");
    return { profile: null, error };
  }
}
