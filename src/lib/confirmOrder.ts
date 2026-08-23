export async function confirmPaidOrder(sessionId: string): Promise<void> {
  const response = await fetch('/api/confirm-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? 'Nepavyko patvirtinti užsakymo');
  }
}
