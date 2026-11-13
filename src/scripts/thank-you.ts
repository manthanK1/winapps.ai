// Opens the shared thank-you pop-up (ThankYouDialog.astro). Call it only once a
// submission is confirmed: after Web3Forms' success reply or Tally's submit event.

export function showThankYou(kind: "lead" | "careers" | "training", returnFocus?: HTMLElement | null): void {
  const dialog = document.querySelector<HTMLDialogElement>("[data-thank-you]");
  const text = dialog?.querySelector("[data-thank-you-text]");
  if (!dialog || !text || dialog.open) return;
  text.textContent = dialog.dataset[kind] ?? dialog.dataset.lead ?? "";
  dialog.addEventListener("close", () => returnFocus?.focus(), { once: true });
  dialog.showModal();
}
