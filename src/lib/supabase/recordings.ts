import { SupabaseClient } from "@supabase/supabase-js";
import { UserRecording, UploadRecordingInput } from "@/types/recording";

const BUCKET_NAME = "jam-recordings";

/**
 * Upload an MP3 blob to Supabase Storage and register the record in user_recordings.
 */
export async function uploadRecordingToCloud(
  supabase: SupabaseClient,
  mp3Blob: Blob,
  input: UploadRecordingInput
): Promise<{ recording: UserRecording | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        recording: null,
        error: new Error("Please log in to save recordings to your cloud pass."),
      };
    }

    const timestamp = Date.now();
    const filePath = `${user.id}/${timestamp}.mp3`;

    // 1. Upload to Supabase Storage bucket
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, mp3Blob, {
        contentType: "audio/mp3",
        upsert: true,
      });

    if (uploadError) {
      console.warn("Storage upload failed, attempting fallback:", uploadError);
      return {
        recording: null,
        error: new Error(`Cloud storage upload failed: ${uploadError.message}`),
      };
    }

    // 2. Obtain Public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    // 3. Insert metadata record in user_recordings table
    const { data: record, error: insertError } = await supabase
      .from("user_recordings")
      .insert({
        user_id: user.id,
        title: input.title || `Jam Session ${new Date().toLocaleDateString()}`,
        duration_ms: input.duration_ms,
        notes_count: input.notes_count,
        audio_url: publicUrl,
        instruments: input.instruments,
      })
      .select("*")
      .single();

    if (insertError) {
      console.warn("Failed to insert recording row:", insertError);
      return {
        recording: null,
        error: new Error(`Database record creation failed: ${insertError.message}`),
      };
    }

    return { recording: record as UserRecording, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown upload error";
    return { recording: null, error: new Error(message) };
  }
}

/**
 * Fetch all cloud-saved jam recordings for the current user.
 */
export async function getUserRecordings(
  supabase: SupabaseClient
): Promise<{ recordings: UserRecording[]; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { recordings: [], error: null };
    }

    const { data, error } = await supabase
      .from("user_recordings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Could not fetch user recordings:", error.message);
      return { recordings: [], error: new Error(error.message) };
    }

    return { recordings: (data as UserRecording[]) || [], error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown fetch error";
    return { recordings: [], error: new Error(message) };
  }
}

/**
 * Delete a recording from the database and storage bucket.
 */
export async function deleteUserRecording(
  supabase: SupabaseClient,
  recordingId: string,
  audioUrl?: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: new Error("Unauthorized") };
    }

    // Delete database record
    const { error: dbError } = await supabase
      .from("user_recordings")
      .delete()
      .eq("id", recordingId)
      .eq("user_id", user.id);

    if (dbError) {
      return { success: false, error: new Error(dbError.message) };
    }

    // If audioUrl is in our storage bucket, delete object
    if (audioUrl && audioUrl.includes(BUCKET_NAME)) {
      try {
        const parts = audioUrl.split(`${BUCKET_NAME}/`);
        if (parts.length > 1) {
          const storagePath = parts[1];
          await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
        }
      } catch {
        // Non-critical if storage deletion fails
      }
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown delete error";
    return { success: false, error: new Error(message) };
  }
}
