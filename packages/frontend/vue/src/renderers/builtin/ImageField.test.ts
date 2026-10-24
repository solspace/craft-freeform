import { expect, it } from "vitest";
import { createApp, h, nextTick, reactive } from "vue";
import type { VueFieldRendererProps } from "../../types.js";
import { ImageFieldRenderer } from "./ImageField.js";

it("keeps legacy images unchanged and supports optional display crops", async () => {
  const props = reactive({
    field: { label: "Image", content: { image: { src: "/image.jpg" } } },
    classNames: {},
  }) as unknown as VueFieldRendererProps;
  const host = document.createElement("div");
  const app = createApp({ render: () => h(ImageFieldRenderer, props) });
  app.mount(host);
  try {
    expect(host.querySelector("img")?.style.width).toBe("");
    props.field.content = {
      image: {
        src: "/image.jpg",
        style: {
          width: "280px",
          "aspect-ratio": "1 / 1",
          "object-fit": "cover",
        },
      },
    };
    await nextTick();
    const image = host.querySelector("img")!;
    expect(image.style.width).toBe("280px");
    expect(image.style.aspectRatio).toBe("1 / 1");
    expect(image.style.objectFit).toBe("cover");
    expect(image.getAttribute("src")).toBe("/image.jpg");
  } finally {
    app.unmount();
  }
});
