interface OcbcLogoProps {
  variant?: "red" | "white";
  className?: string;
}

export default function OcbcLogo({ variant = "red", className = "" }: OcbcLogoProps) {
  const textColor = variant === "white" ? "text-white" : "text-[#E2231A]";
  const markFill = variant === "white" ? "#ffffff" : "#E2231A";
  const innerFill = variant === "white" ? "#E2231A" : "#ffffff";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Lens mark */}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="11" cy="14" rx="9" ry="13" fill={markFill} opacity="0.85" />
        <ellipse cx="17" cy="14" rx="9" ry="13" fill={markFill} />
        <ellipse cx="14" cy="14" rx="4.5" ry="8" fill={innerFill} opacity="0.95" />
      </svg>
      {/* Wordmark */}
      <span className={`font-extrabold text-xl tracking-widest leading-none ${textColor}`}>
        OCBC
      </span>
    </div>
  );
}
