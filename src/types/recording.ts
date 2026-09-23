export interface UserRecording {
  id: string;
  user_id: string;
  title: string;
  duration_ms: number;
  notes_count: number;
  audio_url: string;
  instruments: string[];
  created_at: string;
}

export interface UploadRecordingInput {
  title?: string;
  duration_ms: number;
  notes_count: number;
  instruments: string[];
}
