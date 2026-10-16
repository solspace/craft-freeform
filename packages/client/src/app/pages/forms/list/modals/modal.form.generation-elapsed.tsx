import translate from "@ff-client/utils/translations";
import { useEffect, useState } from "react";
import styled from "styled-components";

const Elapsed = styled.p`
  && { margin: 16px 0 0; color: #667582; font-size: 12px; }
  time { margin-left: 6px; font-variant-numeric: tabular-nums; }
`;

export function formatElapsed(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainder = String(total % 60).padStart(2, "0");
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${remainder}`
    : `${String(minutes).padStart(2, "0")}:${remainder}`;
}

export function GenerationElapsed({
  startedAt,
  finishedAt,
}: {
  startedAt: number | null;
  finishedAt: number | null;
}) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (startedAt === null || finishedAt !== null) return;
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, 1000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, [startedAt, finishedAt]);

  if (startedAt === null) return null;
  const seconds = Math.max(
    0,
    Math.floor(((finishedAt ?? now) - startedAt) / 1000),
  );
  return (
    <Elapsed
      aria-live="off"
      title={translate("Time since this request was started.")}
    >
      {translate("Elapsed:")}
      <time dateTime={`PT${seconds}S`}>{formatElapsed(seconds)}</time>
    </Elapsed>
  );
}
