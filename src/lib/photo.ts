import { supabase } from "@/integrations/supabase/client";

/**
 * Abre câmera (nativa) ou file picker (web) e devolve um File.
 */
export async function pickPhoto(): Promise<File | null> {
  try {
    const cap = await import("@capacitor/core");
    if (cap.Capacitor.isNativePlatform()) {
      const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });
      if (!photo.dataUrl) return null;
      const blob = await (await fetch(photo.dataUrl)).blob();
      return new File([blob], `pet-${Date.now()}.${photo.format ?? "jpg"}`, { type: blob.type });
    }
  } catch {
    /* fallback web */
  }

  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}

export async function uploadPetPhoto(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("pet-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("pet-photos").getPublicUrl(path);
  return data.publicUrl;
}