interface BracketHeadingProps {
  children: string;
  className?: string;
}

// "[ Heading ]" whose brackets slide in from the sides as it scrolls into view
// (lib/animations/textEffects.ts → initBracketHeading).
export default function BracketHeading({ children, className = "" }: BracketHeadingProps) {
  return (
    <h2 data-bracket-heading="" className={`heading-h2 ${className}`.trim()}>
      <span data-bracket-left="" className="heading-bracket is--left">
        [
      </span>
      {children}
      <span data-bracket-right="" className="heading-bracket is--right">
        ]
      </span>
    </h2>
  );
}
