import type { ReactFieldRendererProps } from "../../types.js";

export function ImageFieldRenderer(props: ReactFieldRendererProps) {
  const contentClass =
    props.classNames.content ?? props.classNames.input ?? "ff-field__content";
  const config = (props.field.frontend?.config ?? {}) as {
    style?: Record<string, string>;
    src?: string | null;
    srcset?: string | null;
    alt?: string | null;
  };
  const image = (
    props.field.content as
      | {
          image?: {
            style?: Record<string, string>;
            src?: string | null;
            srcset?: string | null;
            alt?: string | null;
          };
        }
      | undefined
  )?.image;
  const src = image?.src || config.src;
  const srcset = image?.srcset || config.srcset;
  const alt = image?.alt || config.alt || props.field.label || "";

  if (!src) {
    return null;
  }

  return (
    <img
      className={contentClass}
      src={src}
      srcSet={srcset || undefined}
      style={Object.fromEntries(
        Object.entries(image?.style ?? config.style ?? {}).map(
          ([key, value]) => [
            key.replace(/-([a-z])/g, (_match, letter: string) =>
              letter.toUpperCase(),
            ),
            value,
          ],
        ),
      )}
      alt={alt}
    />
  );
}
