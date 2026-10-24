import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import type { ReactFieldRendererProps } from "../../types.js";
import { ImageFieldRenderer } from "./ImageField.js";

it("preserves legacy image sizing and applies optional display crops without changing the asset", () => {
  const props = {
    field: { label: "Image", content: { image: { src: "/image.jpg" } } },
    classNames: {},
  } as unknown as ReactFieldRendererProps;
  const view = render(<ImageFieldRenderer {...props} />);
  expect(view.container.querySelector("img")?.getAttribute("style")).toBeNull();
  const field = {
    ...props.field,
    content: {
      image: {
        src: "/image.jpg",
        style: {
          width: "280px",
          "max-width": "100%",
          "aspect-ratio": "1 / 1",
          "object-fit": "cover",
        },
      },
    },
  };
  view.rerender(<ImageFieldRenderer {...props} field={field} />);
  const image = view.container.querySelector("img")!;
  expect(image.style.width).toBe("280px");
  expect(image.style.aspectRatio).toBe("1 / 1");
  expect(image.style.objectFit).toBe("cover");
  expect(image.getAttribute("src")).toBe("/image.jpg");
});
