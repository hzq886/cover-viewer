"use client";

import type { SVGProps } from "react";

type SvgWithTitleProps = SVGProps<SVGSVGElement> & { title?: string };

// Outline heart icon (Material Symbols Light Favorite Outline)
export function MaterialSymbolsLightFavoriteOutline({
  title,
  ...props
}: SvgWithTitleProps) {
  const resolvedTitle =
    typeof title === "string" && title.trim().length > 0
      ? title
      : "Favorite outline icon";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>{resolvedTitle}</title>
      {/* Icon from Material Symbols Light by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="m12 19.654l-.758-.685q-2.448-2.236-4.05-3.828q-1.601-1.593-2.528-2.81t-1.296-2.2T3 8.15q0-1.908 1.296-3.204T7.5 3.65q1.32 0 2.475.675T12 6.289Q12.87 5 14.025 4.325T16.5 3.65q1.908 0 3.204 1.296T21 8.15q0 .996-.368 1.98q-.369.986-1.296 2.202t-2.519 2.809q-1.592 1.592-4.06 3.828zm0-1.354q2.4-2.17 3.95-3.716t2.45-2.685t1.25-2.015Q20 9.006 20 8.15q0-1.5-1-2.5t-2.5-1q-1.194 0-2.204.682T12.49 7.385h-.978q-.817-1.39-1.817-2.063q-1-.672-2.194-.672q-1.48 0-2.49 1T4 8.15q0 .856.35 1.734t1.25 2.015t2.45 2.675T12 18.3m0-6.825"
      />
    </svg>
  );
}

// Filled heart icon (Material Symbols Light Favorite)
export function MaterialSymbolsLightFavorite({
  title,
  ...props
}: SvgWithTitleProps) {
  const resolvedTitle =
    typeof title === "string" && title.trim().length > 0
      ? title
      : "Favorite icon";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>{resolvedTitle}</title>
      {/* Icon from Material Symbols Light by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="m12 19.654l-.758-.685q-2.448-2.236-4.05-3.828q-1.601-1.593-2.528-2.81t-1.296-2.2T3 8.15q0-1.908 1.296-3.204T7.5 3.65q1.32 0 2.475.675T12 6.289Q12.87 5 14.025 4.325T16.5 3.65q1.908 0 3.204 1.296T21 8.15q0 .996-.368 1.98q-.369.986-1.296 2.202t-2.519 2.809q-1.592 1.592-4.06 3.828z"
      />
    </svg>
  );
}

export function MaterialSymbolsThumbUpOutline({
  title,
  ...props
}: SvgWithTitleProps) {
  const resolvedTitle =
    typeof title === "string" && title.trim().length > 0
      ? title
      : "Thumb up outline icon";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>{resolvedTitle}</title>
      {/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M18 21H7V8l7-7l1.25 1.25q.175.175.288.475t.112.575v.35L14.55 8H21q.8 0 1.4.6T23 10v2q0 .175-.05.375t-.1.375l-3 7.05q-.225.5-.75.85T18 21m-9-2h9l3-7v-2h-9l1.35-5.5L9 8.85zM9 8.85V19zM7 8v2H4v9h3v2H2V8z"
      />
    </svg>
  );
}
