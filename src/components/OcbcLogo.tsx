import Image from "next/image";

interface OcbcLogoProps {
  /** "stacked" = icon + "OCBC Bank" (for login hero panel), "inline" = small horizontal header logo */
  variant?: "stacked" | "inline";
  className?: string;
}

export default function OcbcLogo({ variant = "inline", className = "" }: OcbcLogoProps) {
  if (variant === "stacked") {
    return (
      <Image
        src="/ocbc-bank-logo.png"
        alt="OCBC Bank"
        width={140}
        height={160}
        className={className}
        priority
      />
    );
  }

  // Inline: just the logo mark scaled small for the header
  return (
    <Image
      src="/ocbc-bank-logo.png"
      alt="OCBC Bank"
      width={48}
      height={55}
      className={className}
      priority
    />
  );
}
