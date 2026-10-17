export function FormStartArt({
  method,
}: {
  method: "wizard" | "ai" | "blank";
}) {
  return (
    <span className="form-start-art" aria-hidden="true">
      <svg
        aria-hidden="true"
        viewBox="0 0 260 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {method === "wizard" ? (
          <>
            <path
              d="M33 32h66c15 0 15 36 30 36h14"
              strokeDasharray="3 5"
              opacity=".3"
            />
            <circle cx="30" cy="32" r="12" fill="currentColor" stroke="none" />
            <path d="m25 32 3 3 7-7" stroke="white" strokeWidth="2" />
            <circle cx="76" cy="32" r="10" fill="white" />
            <circle cx="76" cy="32" r="3" fill="currentColor" stroke="none" />
            <circle cx="119" cy="56" r="7" fill="white" opacity=".6" />
            <g className="form-start-art-sheet" transform="rotate(-4 189 50)">
              <rect
                x="144"
                y="12"
                width="92"
                height="78"
                rx="7"
                fill="white"
                strokeOpacity=".3"
              />
              <path d="M156 26h34" strokeWidth="3" opacity=".7" />
              <rect
                x="156"
                y="37"
                width="68"
                height="11"
                rx="3"
                strokeOpacity=".25"
              />
              <rect
                x="156"
                y="55"
                width="30"
                height="11"
                rx="3"
                strokeOpacity=".25"
              />
              <rect
                x="192"
                y="55"
                width="32"
                height="11"
                rx="3"
                strokeOpacity=".25"
              />
              <rect
                x="156"
                y="74"
                width="24"
                height="6"
                rx="3"
                fill="currentColor"
                stroke="none"
                opacity=".6"
              />
            </g>
          </>
        ) : method === "ai" ? (
          <>
            <g className="form-start-art-sheet" transform="rotate(-4 89 50)">
              <rect
                x="23"
                y="24"
                width="129"
                height="56"
                rx="9"
                fill="white"
                strokeOpacity=".3"
              />
              <path
                d="M38 40h69 M38 50h92 M38 60h45"
                strokeWidth="3"
                opacity=".3"
              />
              <circle
                cx="135"
                cy="68"
                r="12"
                fill="currentColor"
                stroke="none"
              />
              <path d="M130 68h10 m-4-4 4 4-4 4" stroke="white" />
            </g>
            <path
              className="form-start-art-spark"
              d="m195 18 6 15 15 6-15 6-6 15-6-15-15-6 15-6Z"
              fill="white"
              strokeWidth="1.8"
            />
            <path
              d="m229 63 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z M164 12v8 M160 16h8"
              opacity=".5"
            />
            <path d="M173 72h24 M173 80h16" strokeWidth="3" opacity=".25" />
          </>
        ) : (
          <>
            <g opacity=".65">
              <rect
                x="21"
                y="27"
                width="58"
                height="16"
                rx="4"
                fill="white"
                strokeOpacity=".4"
              />
              <rect
                x="21"
                y="50"
                width="58"
                height="16"
                rx="4"
                fill="white"
                strokeOpacity=".4"
              />
              <path
                d="M29 35h4 M29 58h4 M40 35h28 M40 58h20"
                strokeWidth="2"
                opacity=".5"
              />
            </g>
            <path d="M87 45h27 m-5-5 5 5-5 5" opacity=".4" />
            <g className="form-start-art-sheet" transform="rotate(3 181 50)">
              <rect
                x="132"
                y="12"
                width="102"
                height="78"
                rx="7"
                fill="white"
                strokeOpacity=".3"
              />
              <path d="M145 26h34" strokeWidth="3" opacity=".65" />
              <rect
                x="145"
                y="39"
                width="76"
                height="11"
                rx="3"
                strokeOpacity=".35"
              />
              <rect
                x="145"
                y="58"
                width="76"
                height="21"
                rx="4"
                strokeDasharray="3 4"
                strokeOpacity=".45"
              />
              <path d="M179 68h8 M183 64v8" opacity=".65" />
            </g>
          </>
        )}
      </svg>
    </span>
  );
}
