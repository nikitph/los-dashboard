import Image from "next/image";
import type { ComponentProps } from "react";

interface LogoProps extends Omit<ComponentProps<typeof Image>, "src" | "alt"> {
  alt?: string;
}

export const FullLogo = ({ alt = "Logo", className, ...props }: LogoProps) => (
  <Image src="/images/logos/full.svg" alt={alt} className={className} {...props} width={333} height={133} />
);
