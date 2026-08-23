/* eslint-disable @next/next/no-img-element */
import { responsiveImages } from "@/lib/responsive-images-manifest";

type OptimizedImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "sizes" | "loading" | "fetchPriority"
> & {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  quality?: number;
  fetchPriority?: "high" | "low" | "auto";
};

function srcSetFor(src: string, format: "avif" | "webp" | "jpg" | "png") {
  const variants = responsiveImages[src]?.variants[format];
  return variants?.map(variant => `${variant.src} ${variant.width}w`).join(", ");
}

function fallbackFor(src: string) {
  const entry = responsiveImages[src];
  if (!entry) return src;

  const fallbackFormat = entry.variants.jpg ? "jpg" : entry.variants.png ? "png" : null;
  if (!fallbackFormat) return src;

  const variants = entry.variants[fallbackFormat];
  return variants?.[variants.length - 1]?.src || src;
}

const uploadWidths = [480, 768, 1200, 1920, 2560];
const optimizedUploadPattern = /^((?:https?:\/\/[^/]+)?\/(?:api\/)?uploads\/.+\/)([^/]+)-(\d+)\.webp$/;

function uploadVariant(src: string, width: number, format: "avif" | "webp") {
  const match = src.match(optimizedUploadPattern);
  if (!match) return null;
  return `${match[1]}responsive/${match[2]}-${width}.${format}`;
}

function uploadSrcSetFor(src: string, format: "avif" | "webp") {
  const match = src.match(optimizedUploadPattern);
  if (!match) return null;

  const maxWidth = Number(match[3]);
  const widths = uploadWidths.filter(width => width <= maxWidth);
  if (!widths.includes(maxWidth)) widths.push(maxWidth);

  return widths
    .map(width => {
      const variantSrc = width === maxWidth && format === "webp"
        ? src
        : uploadVariant(src, width, format);
      return `${variantSrc} ${width}w`;
    })
    .join(", ");
}

export function OptimizedImage({
  src,
  alt,
  sizes,
  priority = false,
  decoding = "async",
  className,
  style,
  width,
  height,
  fetchPriority,
  ...props
}: OptimizedImageProps) {
  const entry = responsiveImages[src];
  const isLocalRaster = Boolean(entry);
  const uploadWebpSrcSet = uploadSrcSetFor(src, "webp");
  const uploadAvifSrcSet = uploadSrcSetFor(src, "avif");
  const isSvg = src.endsWith(".svg");
  const loading = priority ? "eager" : "lazy";
  const resolvedFetchPriority = fetchPriority || (priority ? "high" : "auto");

  if ((!isLocalRaster && !uploadWebpSrcSet) || isSvg) {
    return (
      <img
        {...props}
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={loading}
        decoding={decoding}
        fetchPriority={resolvedFetchPriority}
        className={className}
        style={style}
      />
    );
  }

  if (uploadWebpSrcSet) {
    return (
      <picture>
        {uploadAvifSrcSet && <source type="image/avif" srcSet={uploadAvifSrcSet} sizes={sizes} />}
        <source type="image/webp" srcSet={uploadWebpSrcSet} sizes={sizes} />
        <img
          {...props}
          src={src}
          srcSet={uploadWebpSrcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding={decoding}
          fetchPriority={resolvedFetchPriority}
          className={className}
          style={style}
        />
      </picture>
    );
  }

  const renderedWidth = width || entry.width;
  const renderedHeight = height || entry.height;
  const fallbackFormat = entry.variants.jpg ? "jpg" : entry.variants.png ? "png" : null;
  const fallbackSrcSet = fallbackFormat ? srcSetFor(src, fallbackFormat) : undefined;

  return (
    <picture>
      {entry.variants.avif && <source type="image/avif" srcSet={srcSetFor(src, "avif")} sizes={sizes} />}
      {entry.variants.webp && <source type="image/webp" srcSet={srcSetFor(src, "webp")} sizes={sizes} />}
      <img
        {...props}
        src={fallbackFor(src)}
        srcSet={fallbackSrcSet}
        sizes={sizes}
        alt={alt}
        width={renderedWidth}
        height={renderedHeight}
        loading={loading}
        decoding={decoding}
        fetchPriority={resolvedFetchPriority}
        className={className}
        style={style}
      />
    </picture>
  );
}
