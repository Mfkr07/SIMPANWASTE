import React from "react";
import { Recycle } from "lucide-react";

export default function LandingIllustration() {
  return (
    <svg
      viewBox="0 0 720 590"
      role="img"
      aria-labelledby="landing-illustration-title landing-illustration-desc"
      className="h-auto w-full"
    >
      <title id="landing-illustration-title">Ilustrasi pemilahan sampah anorganik</title>
      <desc id="landing-illustration-desc">
        Warga memilah botol, kertas, dan kaleng ke dalam wadah daur ulang.
      </desc>
      <path
        d="M77 463C95 365 141 318 224 291C310 263 334 164 433 144C539 123 638 200 654 308C671 423 596 504 482 522C356 542 61 550 77 463Z"
        fill="#DCFCE7"
      />
      <circle cx="569" cy="132" r="55" fill="#BBF7D0" />
      <path d="M570 86v92M524 132h92" stroke="#86EFAC" strokeWidth="2" opacity=".8" />
      <path d="M130 482h477" stroke="#166534" strokeWidth="4" strokeLinecap="round" />

      <g transform="translate(375 260)">
        <path d="M25 46h178l-13 190H38L25 46Z" fill="#15803D" />
        <path d="M16 27h197l-7 34H23l-7-34Z" fill="#166534" />
        <rect x="78" width="74" height="34" rx="15" fill="#14532D" />
        <circle cx="78" cy="240" r="12" fill="#1E293B" />
        <circle cx="158" cy="240" r="12" fill="#1E293B" />
        <Recycle
          x={73}
          y={99}
          width={82}
          height={82}
          color="white"
          strokeWidth={2.15}
          aria-label="Simbol daur ulang"
        />
      </g>

      <g transform="translate(143 159)">
        <circle cx="94" cy="48" r="39" fill="#F3C9A9" />
        <path
          d="M57 46C57 8 82-5 107 2c21 5 34 25 27 48-13-13-25-22-45-23-7 13-18 20-32 19Z"
          fill="#1E293B"
        />
        <path
          d="M65 102c27-17 59-13 79 8 20 22 25 67 22 106l-89 2c-12-43-34-87-12-116Z"
          fill="#166534"
        />
        <path d="M79 116c19 18 42 18 62-1l7 67H72l7-66Z" fill="#22C55E" opacity=".45" />
        <path d="M79 214 54 323h42l29-83 18 83h43l-20-110-87 1Z" fill="#334155" />
        <path d="M55 323h43v15H45c-8-7-4-13 10-15ZM143 323h43l11 15h-52l-2-15Z" fill="#1E293B" />
        <path
          d="M68 121c-29 35-31 86-8 104 19 15 61-5 92-25"
          fill="none"
          stroke="#F3C9A9"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <path
          d="M155 199c17-9 31-10 40-3"
          fill="none"
          stroke="#F3C9A9"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path d="m183 164 18 5-8 38-20-5 10-38Z" fill="#60A5FA" />
        <path d="m185 155 16 4-3 12-16-4 3-12Z" fill="#2563EB" />
      </g>

      <g transform="translate(72 367)">
        <path d="M0 21h113l-9 104H12L0 21Z" fill="#F59E0B" />
        <path d="M-5 8h123v24H-5V8Z" fill="#D97706" />
        <path d="M43 47h28v51H43z" fill="#FEF3C7" opacity=".8" />
        <path d="M47 42h20v11H47z" fill="#92400E" />
      </g>

      <g transform="translate(560 369)">
        <path d="M0 21h98l-8 104H11L0 21Z" fill="#0EA5E9" />
        <path d="M-5 8h108v24H-5V8Z" fill="#0284C7" />
        <path d="M42 45h18v53H42z" fill="#E0F2FE" opacity=".85" />
        <path d="M39 39h24v12H39z" fill="#075985" />
      </g>

      <g fill="#16A34A">
        <path d="M91 146c-36-4-54-27-58-68 38 3 59 24 58 68Z" />
        <path d="M92 146c4-41 25-63 64-66-2 39-24 62-64 66Z" opacity=".75" />
        <path d="M618 281c-31-4-47-24-50-58 33 3 51 21 50 58Z" />
      </g>
      <path
        d="M91 144 51 99M93 145l41-43M618 280l-34-36"
        stroke="#14532D"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <g transform="translate(289 102)">
        <path d="M17 0h34l5 16-8 8 9 71H10l8-71-7-8 6-16Z" fill="#38BDF8" />
        <path d="M20 29h29l3 43H16l4-43Z" fill="#BAE6FD" />
        <path d="M20 0h28v11H20z" fill="#0369A1" />
      </g>
    </svg>
  );
}
