type WaitlistSubmitResult = {
  success: boolean;
  duplicate?: boolean;
  error?: string;
};

const SCRIPT_URL = import.meta.env.VITE_WAITLIST_SCRIPT_URL;
const SCRIPT_TOKEN = import.meta.env.VITE_WAITLIST_SCRIPT_TOKEN;

export function isWaitlistSubmitConfigured(): boolean {
  return Boolean(SCRIPT_URL && SCRIPT_TOKEN);
}

export async function submitWaitlistEmail(
  email: string,
): Promise<WaitlistSubmitResult> {
  if (!isWaitlistSubmitConfigured()) {
    console.error(
      '[waitlist] VITE_WAITLIST_SCRIPT_URL or VITE_WAITLIST_SCRIPT_TOKEN is not set.',
    );
    throw new Error('Waitlist is not configured.');
  }

  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      email,
      token: SCRIPT_TOKEN,
    }),
  });

  if (!response.ok) {
    throw new Error('Waitlist request failed.');
  }

  const result = (await response.json()) as WaitlistSubmitResult;

  if (!result.success) {
    throw new Error(result.error || 'Waitlist request failed.');
  }

  return result;
}
