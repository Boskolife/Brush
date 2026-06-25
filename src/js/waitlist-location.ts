type IpApiResponse = {
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
};

const LOCATION_TIMEOUT_MS = 3000;

export async function getWaitlistLocation(): Promise<string> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    LOCATION_TIMEOUT_MS,
  );

  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    });

    if (!response.ok) {
      return 'Unknown';
    }

    const data = (await response.json()) as IpApiResponse;
    const parts = [data.city, data.region, data.country_name || data.country_code]
      .map((part) => String(part || '').trim())
      .filter(Boolean);

    return parts.length ? parts.join(', ') : 'Unknown';
  } catch {
    return 'Unknown';
  } finally {
    window.clearTimeout(timeoutId);
  }
}
