import { Fields } from "@ff-client/types/field.classes";
import type { FieldType } from "@ff-client/types/fields";
import translate from "@ff-client/utils/translations";

import { additionalComponentPresets } from "./component.additional-presets";
import {
  type ComponentFieldType,
  type ComponentNode,
  type ComponentPreset,
  type ComponentVariant,
  columns,
  heading,
  image,
  section,
  text,
} from "./component.recipes";

export type {
  ComponentFieldType,
  ComponentNode,
  ComponentPreset,
  ComponentVariant,
} from "./component.recipes";

export const getComponentPresets = (): ComponentPreset[] => {
  const heroText = [
    heading("Hero heading", "Let’s get started", "h1"),
    text(
      "Hero introduction",
      `<p>${translate("Tell visitors what this page is about and what they can expect.")}</p>`,
    ),
  ];
  const imageText = [
    heading("Section heading", "A little more about us"),
    text(
      "Section text",
      `<p>${translate("Share your story, explain your service, or introduce the next step.")}</p>`,
    ),
  ];
  const card = (number: number): ComponentNode[] => [
    heading(
      `Card ${number} heading`,
      translate("Helpful detail {number}", { number }),
      "h3",
    ),
    text(
      `Card ${number} text`,
      `<p>${translate("Add a short description or a helpful piece of information.")}</p>`,
    ),
  ];
  return [
    {
      id: "hero",
      name: "Hero",
      description:
        "A welcoming heading and introduction, with an optional image.",
      variants: [
        {
          id: "background",
          label: "Background image",
          root: {
            ...section(
              "Hero",
              heroText.map((node) => ({
                ...node,
                properties: {
                  ...node.properties,
                  ...(node.typeClass === Fields.Heading
                    ? { alignment: "center" }
                    : {
                        content: `<p style="text-align: center;">${translate("Tell visitors what this page is about and what they can expect.")}</p>`,
                      }),
                },
              })),
            ),
            properties: {
              preset: "one",
              background: "image",
              verticalAlignment: "middle",
              backgroundColor: "#374151",
              textColor: "#ffffff",
              overlayColor: "#000000",
              overlayOpacity: 10,
              overlayOpacityPreset: "light",
              padding: "large",
              minHeight: 320,
            },
          },
        },
        { id: "text", label: "Text only", root: section("Hero", heroText) },
        {
          id: "right",
          label: "Image right",
          root: columns("Hero", "wide", [heroText, [image("Hero image")]]),
        },
        {
          id: "left",
          label: "Image left",
          root: columns("Hero", "narrow", [[image("Hero image")], heroText]),
        },
      ],
    },
    {
      id: "text",
      name: "Text section",
      description:
        "A heading and formatted text for your story or instructions.",
      variants: [
        {
          id: "default",
          label: "Text section",
          root: section("Text section", [
            heading("Text section heading", "Make yourself at home"),
            text(
              "Text section body",
              `<p>${translate("Use this space to share more information, explain the process, or answer common questions before visitors fill out your form.")}</p>`,
            ),
          ]),
        },
      ],
    },
    {
      id: "image-text",
      name: "Image + text",
      description: "An image alongside a heading and supporting copy.",
      variants: [
        {
          id: "left",
          label: "Image left",
          root: columns("Image and text", "narrow", [
            [image("Section image")],
            imageText,
          ]),
        },
        {
          id: "right",
          label: "Image right",
          root: columns("Image and text", "wide", [
            imageText,
            [image("Section image")],
          ]),
        },
      ],
    },
    {
      id: "cards",
      name: "Information cards",
      description:
        "Styled cards for useful details, benefits, or next steps. Customize their colors, borders, and spacing.",
      variants: [2, 3, 4, 5, 6].map((count) => {
        const id = (
          { 2: "two", 3: "three", 4: "four", 5: "five", 6: "six" } as Record<
            number,
            string
          >
        )[count];
        const root = columns(
          "Information cards",
          id,
          Array.from({ length: count }, (_, index) => card(index + 1)),
        );
        root.properties = { ...root.properties, columnStyle: "cards" };
        return {
          id,
          label: translate("{number} cards", { number: count }),
          root,
        };
      }),
    },
    {
      id: "contact",
      name: "Contact details",
      description:
        "An introduction beside your address and contact information.",
      variants: [
        {
          id: "default",
          label: "Contact details",
          root: columns("Contact details", "wide", [
            [
              heading("Contact heading", "We’d love to hear from you"),
              text(
                "Contact introduction",
                `<p>${translate("Have a question? Fill out the form below or contact our team directly.")}</p>`,
              ),
            ],
            [
              heading("Contact information heading", "Get in touch", "h3"),
              text(
                "Contact information",
                `<p>${translate("Your organization")}<br>${translate("123 Example Street")}<br>${translate("City, Region")}</p><p>hello@example.com<br>+1 555 010 1234</p>`,
              ),
            ],
          ]),
        },
      ],
    },
    {
      id: "intro",
      name: "Section introduction",
      description:
        "A title, a short description, and a divider for longer forms.",
      variants: [
        {
          id: "default",
          label: "Section introduction",
          root: section("Section introduction", [
            heading("Introduction heading", "Tell us a little about yourself"),
            text(
              "Introduction text",
              `<p>${translate("A few details will help us point you in the right direction.")}</p>`,
            ),
            {
              typeClass: Fields.Divider,
              label: "Section divider",
              properties: { spacing: "medium", lineStyle: "solid" },
            },
          ]),
        },
      ],
    },
    ...additionalComponentPresets(),
  ];
};

export const componentNodes = (node: ComponentNode): ComponentNode[] => [
  node,
  ...(node.children ?? []).flatMap(componentNodes),
  ...(node.columns ?? []).flatMap((column) => column.flatMap(componentNodes)),
];

export const availableComponents = (
  types: FieldType[],
  hidden: string[],
): ComponentPreset[] => {
  const allowed = new Set(
    types
      .filter((type) => type.visible && !hidden.includes(type.typeClass))
      .map((type) => type.typeClass),
  );
  return getComponentPresets()
    .map((preset) => ({
      ...preset,
      variants: preset.variants.filter((variant) =>
        componentNodes(variant.root).every((node) =>
          allowed.has(node.typeClass),
        ),
      ),
    }))
    .filter((preset) => preset.variants.length > 0);
};

export const componentFieldType = (
  preset: ComponentPreset,
  variant: ComponentVariant,
  types: FieldType[],
): ComponentFieldType => ({
  ...types.find((type) => type.typeClass === variant.root.typeClass)!,
  name: translate(preset.name),
  component: { root: variant.root, types },
});

export const isComponentType = (type: FieldType): type is ComponentFieldType =>
  "component" in type;
