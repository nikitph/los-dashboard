import Image from "next/image";
import type { ComponentProps } from "react";

interface LogoProps extends Omit<ComponentProps<typeof Image>, "src" | "alt"> {
  alt?: string;
}

export const Logo = ({ alt = "Logo", className, ...props }: LogoProps) => (
  <Image src="/images/logos/minimal.svg" alt={alt} className={className} {...props} width={133} height={133} />
);
