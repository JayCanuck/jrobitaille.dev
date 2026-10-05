import type { SiteImage } from '@/content/schema';

interface PictureProps {
  image: SiteImage;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
}

// AVIF with a WebP fallback and explicit dimensions (CLS budget 0); an SVG source renders as is.
// The static export has no image optimizer and next/image cannot emit <source> fallbacks, so this
// is the one place a plain <img> is used (the Next lint rule allows it inside <picture>).
export function Picture({ image, className, imgClassName, priority = false, sizes }: PictureProps) {
  const isSvg = image.src.endsWith('.svg');
  // With extra widths, each <source> lists the variants so the browser picks by rendered size.
  const srcSet = (ext: string) =>
    image.widths
      ? [...image.widths, image.width]
          .map(w => `${image.src}${w === image.width ? '' : `-${String(w)}`}.${ext} ${String(w)}w`)
          .join(', ')
      : `${image.src}.${ext}`;
  return (
    <picture className={className}>
      {!isSvg && <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />}
      {!isSvg && <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />}
      <img
        src={isSvg ? image.src : `${image.src}.webp`}
        width={image.width}
        height={image.height}
        alt={image.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={imgClassName}
      />
    </picture>
  );
}
