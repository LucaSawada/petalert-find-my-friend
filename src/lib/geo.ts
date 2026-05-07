export interface GeoResult {
  latitude: number;
  longitude: number;
  address: string;
}

/**
 * Captura a localização atual do usuário e tenta resolver o endereço via Nominatim (OpenStreetMap).
 * Em caso de falha do reverse geocoding, retorna coordenadas formatadas.
 */
export async function getCurrentLocation(): Promise<GeoResult> {
  // Tenta usar Capacitor Geolocation se disponível (app nativo)
  try {
    const cap = await import("@capacitor/core");
    if (cap.Capacitor.isNativePlatform()) {
      const { Geolocation } = await import("@capacitor/geolocation");
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      return reverseGeocode(pos.coords.latitude, pos.coords.longitude);
    }
  } catch {
    // fallback para web
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalização não suportada neste dispositivo."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => resolve(await reverseGeocode(pos.coords.latitude, pos.coords.longitude)),
      (err) => reject(new Error(err.message || "Não foi possível obter sua localização.")),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}

async function reverseGeocode(latitude: number, longitude: number): Promise<GeoResult> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
      { headers: { "Accept-Language": "pt-BR" } },
    );
    const data = await res.json();
    const a = data?.address ?? {};
    const parts = [
      a.road,
      a.suburb || a.neighbourhood,
      a.city || a.town || a.village,
      a.state,
    ].filter(Boolean);
    const address = parts.join(", ") || data?.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    return { latitude, longitude, address };
  } catch {
    return { latitude, longitude, address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` };
  }
}

/**
 * Observa a posição do usuário em tempo real. Retorna uma função para parar a observação.
 */
export function watchLocation(
  onUpdate: (coords: { latitude: number; longitude: number }) => void,
  onError?: (err: Error) => void,
): () => void {
  let stopped = false;
  let webWatchId: number | null = null;
  let nativeCleanup: (() => void) | null = null;

  (async () => {
    try {
      const cap = await import("@capacitor/core");
      if (cap.Capacitor.isNativePlatform()) {
        const { Geolocation } = await import("@capacitor/geolocation");
        const id = await Geolocation.watchPosition(
          { enableHighAccuracy: true, timeout: 10000 },
          (pos, err) => {
            if (stopped) return;
            if (err) { onError?.(new Error(err.message)); return; }
            if (pos) onUpdate({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          },
        );
        nativeCleanup = () => { void Geolocation.clearWatch({ id }); };
        return;
      }
    } catch {/* fallback web */}

    if (!navigator.geolocation) {
      onError?.(new Error("Geolocalização não suportada."));
      return;
    }
    webWatchId = navigator.geolocation.watchPosition(
      (pos) => onUpdate({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => onError?.(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );
  })();

  return () => {
    stopped = true;
    if (webWatchId !== null) navigator.geolocation.clearWatch(webWatchId);
    nativeCleanup?.();
  };
}