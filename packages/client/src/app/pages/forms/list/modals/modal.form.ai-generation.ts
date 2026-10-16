import translate from "@ff-client/utils/translations";
import axios from "axios";

export type GenerationState = {
  status:
    | "queued"
    | "running"
    | "complete"
    | "failed"
    | "expired"
    | "interrupted";
  formId?: number;
  message?: string;
};

export class GenerationError extends Error {
  constructor(
    message: string,
    public terminal = false,
  ) {
    super(message);
  }
}

export const pendingGenerationKey = "freeform.pending-ai-generation";
const pendingGenerationTimeKey = `${pendingGenerationKey}.started-at`;
export function newGenerationId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
}

export function rememberGeneration(
  id: string | null,
  startedAt = Date.now(),
): void {
  try {
    if (id) {
      localStorage.setItem(pendingGenerationKey, id);
      localStorage.setItem(
        pendingGenerationTimeKey,
        JSON.stringify({ id, startedAt }),
      );
    } else {
      localStorage.removeItem(pendingGenerationKey);
      localStorage.removeItem(pendingGenerationTimeKey);
    }
    sessionStorage.removeItem(pendingGenerationKey);
  } catch {
    // Browser storage can be disabled. In-memory polling still works.
  }
}

export function pendingGeneration(): string | null {
  try {
    const value =
      localStorage.getItem(pendingGenerationKey) ??
      sessionStorage.getItem(pendingGenerationKey);
    return value && /^[a-f0-9]{32}$/.test(value) ? value : null;
  } catch {
    return null;
  }
}

export function pendingGenerationStartedAt(id: string): number | null {
  try {
    const saved = JSON.parse(
      localStorage.getItem(pendingGenerationTimeKey) ?? "null",
    );
    return saved?.id === id &&
      Number.isSafeInteger(saved.startedAt) &&
      saved.startedAt >= 0 &&
      saved.startedAt <= Date.now()
      ? saved.startedAt
      : null;
  } catch {
    return null;
  }
}

const uncertainMessage = () =>
  translate(
    "Could not confirm generation progress. Reopen Create with AI to check again, and check the Forms list before starting another request.",
  );

export async function waitForGeneration(
  requestId: string,
  signal: AbortSignal,
  onStatus: (state: GenerationState["status"]) => void,
): Promise<number> {
  let failures = 0;
  let missing = 0;
  const started = Date.now();
  while (!signal.aborted && Date.now() - started < 15 * 60_000) {
    let state: GenerationState | null = null;
    try {
      const { data } = await axios.post<GenerationState>(
        `/api/forms/ai-generation-progress/${requestId}`,
        {},
        { signal, timeout: 15_000 },
      );
      if (
        !data ||
        ![
          "queued",
          "running",
          "complete",
          "failed",
          "expired",
          "interrupted",
        ].includes(data.status)
      ) {
        throw new Error("Invalid generation status.");
      }
      state = data;
      failures = 0;
    } catch (error) {
      if (signal.aborted) throw error;
      // A lost start response can precede the first status write; allow a short grace period.
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        if (++missing >= 5) throw new GenerationError(uncertainMessage());
      } else if (++failures >= 3) {
        throw new GenerationError(uncertainMessage());
      }
    }
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    if (
      state?.status === "complete" &&
      Number.isInteger(state.formId) &&
      state.formId! > 0
    ) {
      return state.formId!;
    }
    if (state?.status === "failed") {
      const message =
        typeof state.message === "string" &&
        !/<(?:!doctype|html|head|body|script|style)\b/i.test(state.message)
          ? state.message
          : "";
      throw new GenerationError(
        message ||
          translate(
            "Form generation could not complete. Check the Forms list before starting another request.",
          ),
        true,
      );
    }
    if (state?.status === "expired" || state?.status === "interrupted") {
      throw new GenerationError(uncertainMessage());
    }
    if (state) onStatus(state.status);
    await new Promise<void>((resolve, reject) => {
      const abort = () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      };
      const timer = setTimeout(() => {
        signal.removeEventListener("abort", abort);
        resolve();
      }, 2000);
      signal.addEventListener("abort", abort, { once: true });
    });
  }
  throw new GenerationError(uncertainMessage());
}
