// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";

export function ImageFieldRenderer(props: VueFieldRendererProps) {
  const contentClass =
    props.classNames.content ?? props.classNames.input ?? "ff-field__content";
  const config = (props.field.frontend?.config ?? {}) as {
    src?: string | null;
    srcset?: string | null;
    alt?: string | null;
  };
  const image = (
    props.field.content as
      | {
          image?: {
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
      class={contentClass}
      src={src}
      srcset={srcset || undefined}
      alt={alt}
    />
  );
}
