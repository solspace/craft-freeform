import { type SVGProps, useId } from "react";

const outline =
  "M8.75 1.72 13.65 4.48Q14.4 4.9 14.4 5.76v4.48q0 .86-.75 1.28l-4.9 2.76q-.75.42-1.5 0l-4.9-2.76Q1.6 11.1 1.6 10.24V5.76q0-.86.75-1.28l4.9-2.76q.75-.42 1.5 0Z";
const faceEdges = "M1.9 5.1 7.4 8.2q.6.3 1.2 0l5.5-3.1M8 8.5v5.8";
const DiePips = () => (
  <>
    <ellipse cx="6.1" cy="4.2" rx=".85" ry=".48" />
    <ellipse cx="9.9" cy="5.7" rx=".85" ry=".48" />
    <ellipse
      cx="4.8"
      cy="9.8"
      rx=".65"
      ry=".85"
      transform="rotate(-25 4.8 9.8)"
    />
    <ellipse
      cx="12.7"
      cy="7.4"
      rx=".6"
      ry=".8"
      transform="rotate(25 12.7 7.4)"
    />
    <ellipse
      cx="11.2"
      cy="9.8"
      rx=".6"
      ry=".8"
      transform="rotate(25 11.2 9.8)"
    />
    <ellipse
      cx="9.7"
      cy="12.2"
      rx=".6"
      ry=".8"
      transform="rotate(25 9.7 12.2)"
    />
  </>
);

export const DiceIcon = ({
  solid = false,
  ...props
}: SVGProps<SVGSVGElement> & { solid?: boolean }) => {
  const faceClip = useId();
  const solidMask = `${faceClip}-solid`;
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <defs>
        {solid ? (
          <mask
            id={solidMask}
            x="0"
            y="0"
            width="16"
            height="16"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "luminance" }}
          >
            <path d={outline} fill="white" />
            <path
              d={faceEdges}
              stroke="black"
              strokeWidth=".85"
              strokeLinecap="round"
            />
            <g fill="black">
              <DiePips />
            </g>
          </mask>
        ) : (
          <clipPath id={faceClip}>
            <path d={outline} />
          </clipPath>
        )}
      </defs>
      {solid ? (
        <path d={outline} fill="currentColor" mask={`url(#${solidMask})`} />
      ) : (
        <>
          <g clipPath={`url(#${faceClip})`}>
            <path
              d="M8 1.3 14.4 4.9 8 8.5 1.6 4.9Z"
              fill="currentColor"
              fillOpacity=".05"
            />
            <path
              d="M1.6 4.9 8 8.5v6.2l-6.4-3.6Z"
              fill="currentColor"
              fillOpacity=".10"
            />
            <path
              d="m8 8.5 6.4-3.6v6.2L8 14.7Z"
              fill="currentColor"
              fillOpacity=".18"
            />
          </g>
          <path
            d={outline}
            stroke="currentColor"
            strokeWidth="1.15"
            strokeLinejoin="round"
          />
          <path
            d={faceEdges}
            stroke="currentColor"
            strokeWidth="1.15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g fill="currentColor">
            <DiePips />
          </g>
        </>
      )}
    </svg>
  );
};
