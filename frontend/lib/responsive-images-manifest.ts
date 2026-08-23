import manifest from "@/public/responsive-images-manifest.json";

export type ResponsiveVariant = {
  src: string;
  width: number;
  bytes: number;
};

export type ResponsiveImageEntry = {
  src: string;
  width: number;
  height: number;
  format: string;
  variants: Partial<Record<"avif" | "webp" | "jpg" | "png", ResponsiveVariant[]>>;
};

export const responsiveImages = manifest as Record<string, ResponsiveImageEntry>;
