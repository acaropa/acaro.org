export function LibraryPageTransition({
  active,
}: {
  active: boolean;
}) {
  return (
    <div
      aria-hidden={!active}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#fbf9f5] transition-opacity duration-300 dark:bg-background ${
        active ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {active && (
      <div className="flex flex-col items-center">
        <svg
          className="coffee-loader h-28 w-32"
          viewBox="0 0 180 185"
          role="img"
          aria-label="Sirviendo cafe"
        >
          <defs>
            <clipPath id="coffee-cup-fill">
              <path d="M43 124 H109 V146 C109 163 95 175 76 175 C57 175 43 163 43 146 Z" />
            </clipPath>
          </defs>

          <g className="coffee-pot">
            <path
              d="M64 14 H119 L112 64 Q105 78 86 76 Q68 73 62 57 Z"
              fill="#f2eee8"
              stroke="#2b1710"
              strokeLinejoin="round"
              strokeWidth="4"
            />
            <path
              d="M64 48 Q87 55 114 45 L112 64 Q105 78 86 76 Q68 73 62 57 Z"
              fill="#7b3f12"
            />
            <path
              d="M64 43 L44 57 L62 59"
              fill="#f2eee8"
              stroke="#2b1710"
              strokeLinejoin="round"
              strokeWidth="4"
            />
            <path
              d="M118 24 Q143 24 139 47 Q136 59 119 58"
              fill="none"
              stroke="#2b1710"
              strokeLinecap="round"
              strokeWidth="5"
            />
            <path
              d="M70 13 Q91 5 114 14"
              fill="none"
              stroke="#2b1710"
              strokeLinecap="round"
              strokeWidth="4"
            />
          </g>

          <path
            className="coffee-stream"
            d="M46 58 C43 78 55 91 58 117"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="5"
          />

          <path
            d="M39 121 H112 V146 C112 165 97 178 76 178 C54 178 39 165 39 146 Z"
            fill="#fffdf8"
            stroke="#2b1710"
            strokeWidth="4"
          />
          <g className="coffee-level" clipPath="url(#coffee-cup-fill)">
            <rect x="40" y="120" width="74" height="58" fill="#7b3f12" />
            <ellipse cx="76" cy="122" rx="33" ry="6" fill="#92501b" />
          </g>
          <path
            d="M112 130 H125 C141 130 148 140 148 152 C148 166 138 173 125 173 H111"
            fill="none"
            stroke="#2b1710"
            strokeWidth="4"
          />
          <ellipse cx="76" cy="121" rx="37" ry="10" fill="#fffdf8" stroke="#2b1710" strokeWidth="4" />
          <ellipse className="coffee-top" cx="76" cy="122" rx="31" ry="6" fill="#7b3f12" />
          <ellipse
            className="coffee-ripple"
            cx="76"
            cy="122"
            rx="13"
            ry="3"
            fill="none"
            stroke="#d7a24a"
            strokeWidth="1.5"
          />
          <path
            d="M56 179 Q76 185 96 179"
            fill="none"
            stroke="#2b1710"
            strokeLinecap="round"
            strokeWidth="4"
          />
        </svg>
      </div>
      )}
    </div>
  );
}
