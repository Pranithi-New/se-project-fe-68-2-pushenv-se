export function extractErrorMessage(err: unknown, fallback: string) {
  return err && typeof err === "object" && "message" in err
    ? String((err as { message: unknown }).message)
    : fallback;
}

export function toDateInput(iso: string) {
  return iso.slice(0, 10);
}
