import { Fields } from "@ff-client/types/field.classes";
import translate from "@ff-client/utils/translations";
import { escape as escapeHtml } from "lodash";
import {
  type ComponentNode,
  type ComponentPreset,
  columns,
  heading,
  image,
  section,
  text,
} from "./component.recipes";

// Recipes become normal editable fields, including the dedicated link control.
const copy = (value: string) => escapeHtml(translate(value));
const paragraph = (value: string) => `<p>${copy(value)}</p>`;
const centered = (node: ComponentNode): ComponentNode => ({
  ...node,
  properties: { ...node.properties, alignment: "center" },
});
const action = (label: string, caption: string): ComponentNode => ({
  typeClass: Fields.ButtonLink,
  label,
  properties: {
    linkText: translate(caption),
    alignment: "center",
    useComponentAccent: true,
  },
});
const columnPreset = (count: number): string =>
  (({ 2: "two", 3: "three", 4: "four" }) as Record<number, string>)[count];
const repeated = (
  label: string,
  count: number,
  content: (number: number) => ComponentNode[],
  cards = false,
): ComponentNode => ({
  ...columns(
    label,
    columnPreset(count),
    Array.from({ length: count }, (_, index) => content(index + 1)),
  ),
  properties: {
    preset: columnPreset(count),
    gap: "large",
    mobile: "stack",
    designStyle: "form",
    ...(cards ? { columnStyle: "cards" } : {}),
  },
});
const photo = (label: string, ratio = "square"): ComponentNode => ({
  ...image(label),
  properties: {
    customizeDisplay: true,
    aspectRatio: ratio,
    imageFit: "cover",
    cropPosition: "center",
  },
});
const countVariants = (
  counts: number[],
  noun: string,
  build: (count: number) => ComponentNode,
) =>
  counts.map((count) => ({
    id: columnPreset(count),
    label: translate(noun, { number: count }),
    root: build(count),
  }));

export const additionalComponentPresets = (): ComponentPreset[] => {
  const sidebarLink = (label: string, caption: string): ComponentNode => ({
    typeClass: Fields.ButtonLink,
    label,
    properties: {
      linkText: translate(caption),
      appearance: "link",
      alignment: "left",
      useComponentAccent: true,
    },
  });
  const question = (number: number): ComponentNode[] => [
    heading(
      `FAQ ${number} question`,
      translate("Common question {number}", { number }),
      "h3",
    ),
    text(
      `FAQ ${number} answer`,
      paragraph("Add a helpful answer so visitors know what to expect."),
    ),
  ];
  const quote = (number: number, withPhoto: boolean): ComponentNode[] => [
    ...(withPhoto ? [photo(`Testimonial ${number} photo`)] : []),
    text(
      `Testimonial ${number} quote`,
      `<blockquote style="margin: 0; font-size: 1.125em;">${paragraph("Share a few words from a happy customer about their experience.")}</blockquote>`,
    ),
    heading(
      `Testimonial ${number} name`,
      translate("Customer {number}", { number }),
      "h3",
    ),
    text(`Testimonial ${number} attribution`, paragraph("Role, organization")),
  ];
  return [
    {
      id: "sidebar",
      name: "Sidebar",
      description:
        "An editable guide with a title, supporting copy, links, and a call to action. Fits a narrow column.",
      variants: [
        {
          id: "guide",
          label: "Guide",
          root: {
            ...section("Sidebar", [
              heading("Sidebar heading", "Your quick guide", "h2"),
              text(
                "Sidebar introduction",
                paragraph("Give visitors a few helpful places to go next."),
              ),
              sidebarLink("Sidebar link 1", "Explore the details →"),
              sidebarLink("Sidebar link 2", "Frequently asked questions →"),
              sidebarLink("Sidebar link 3", "Contact us →"),
              text(
                "Sidebar note",
                paragraph("Add one useful tip or reminder here."),
              ),
              {
                typeClass: Fields.ButtonLink,
                label: "Sidebar action",
                properties: {
                  linkText: translate("Get started"),
                  useComponentAccent: true,
                },
              },
            ]),
            properties: {
              preset: "one",
              gap: "medium",
              mobile: "stack",
              designStyle: "form",
            },
          },
        },
      ],
    },
    {
      id: "cta",
      name: "Call to action",
      description:
        "A clear next step with a heading, supporting text, and an editable button link.",
      variants: [
        {
          id: "centered",
          label: "Centered",
          root: {
            ...section("Call to action", [
              centered(
                heading(
                  "Call to action heading",
                  "Ready to take the next step?",
                ),
              ),
              text(
                "Call to action text",
                `<p style="text-align: center;">${copy("Tell visitors why they should get in touch and what happens next.")}</p>`,
              ),
              action("Call to action link", "Get started"),
            ]),
            properties: {
              preset: "one",
              gap: "medium",
              mobile: "stack",
              background: "color",
              backgroundColor: "#f1f5f9",
              padding: "medium",
              designStyle: "form",
            },
          },
        },
        {
          id: "split",
          label: "Text beside button",
          root: {
            ...columns("Call to action", "wide", [
              [
                heading("Call to action heading", "Let’s make it happen"),
                text(
                  "Call to action text",
                  paragraph(
                    "A short invitation to get in touch or explore the next step.",
                  ),
                ),
              ],
              [action("Call to action link", "Get started")],
            ]),
            properties: {
              preset: "wide",
              gap: "large",
              mobile: "stack",
              verticalAlignment: "middle",
              padding: "medium",
              designStyle: "form",
            },
          },
        },
      ],
    },
    {
      id: "faq",
      name: "FAQ",
      description:
        "Editable questions and answers, arranged in one or two columns.",
      variants: [
        {
          id: "one",
          label: "One column",
          root: {
            ...section("FAQ", [1, 2, 3].flatMap(question)),
            properties: {
              preset: "one",
              gap: "medium",
              mobile: "stack",
              designStyle: "form",
            },
          },
        },
        {
          id: "two",
          label: "Two columns",
          root: {
            ...columns("FAQ", "two", [
              [1, 2].flatMap(question),
              [3, 4].flatMap(question),
            ]),
            properties: {
              preset: "two",
              gap: "large",
              mobile: "stack",
              designStyle: "form",
            },
          },
        },
      ],
    },
    {
      id: "testimonials",
      name: "Testimonials",
      description:
        "Customer quotes with names and attribution, with an optional photo.",
      variants: [
        {
          id: "two",
          label: "Two quotes",
          root: repeated(
            "Testimonials",
            2,
            (number) => quote(number, false),
            true,
          ),
        },
        {
          id: "three",
          label: "Three quotes",
          root: repeated(
            "Testimonials",
            3,
            (number) => quote(number, false),
            true,
          ),
        },
        {
          id: "photos",
          label: "2 with photos",
          root: repeated(
            "Testimonials",
            2,
            (number) => quote(number, true),
            true,
          ),
        },
      ],
    },
    {
      id: "steps",
      name: "Steps / Process",
      description:
        "Numbered steps that explain how it works or what happens next.",
      variants: countVariants([3, 4], "{number} steps", (count) =>
        repeated("Steps", count, (number) => [
          {
            ...heading(`Step ${number} number`, String(number), "h3"),
            properties: {
              content: String(number),
              level: "h3",
              textSize: "large",
            },
          },
          heading(
            `Step ${number} heading`,
            translate("Step {number}", { number }),
            "h3",
          ),
          text(
            `Step ${number} description`,
            paragraph("Explain this step and what visitors need to do."),
          ),
        ]),
      ),
    },
    {
      id: "features",
      name: "Feature grid",
      description:
        "Images or icons with headings and short descriptions for your benefits or services.",
      variants: [
        ...countVariants([3, 4], "{number} features", (count) =>
          repeated("Feature grid", count, (number) => [
            photo(`Feature ${number} image`, "photo"),
            heading(
              `Feature ${number} heading`,
              translate("Feature {number}", { number }),
              "h3",
            ),
            text(
              `Feature ${number} description`,
              paragraph(
                "Describe a benefit and why it matters to your visitors.",
              ),
            ),
          ]),
        ),
        ...[3, 4].map((count) => ({
          id: `icons-${count}`,
          label: translate("{number} with icons", { number: count }),
          root: repeated("Feature grid", count, (number) => [
            {
              typeClass: Fields.Icon,
              label: `Feature ${number} icon`,
              properties: {
                icon: ["star", "check", "heart", "info"][number - 1],
                alignment: "center",
                iconSize: 48,
              },
            },
            centered(
              heading(
                `Feature ${number} heading`,
                translate("Feature {number}", { number }),
                "h3",
              ),
            ),
            text(
              `Feature ${number} description`,
              `<p style="text-align: center;">${copy("Describe a benefit and why it matters to your visitors.")}</p>`,
            ),
          ]),
        })),
      ],
    },
    {
      id: "statistics",
      name: "Statistics",
      description:
        "Large numbers and short labels to highlight achievements or key facts.",
      variants: countVariants([3, 4], "{number} statistics", (count) =>
        repeated("Statistics", count, (number) => [
          {
            ...heading(
              `Statistic ${number} value`,
              ["100+", "98%", "10+", "24/7"][number - 1],
              "h3",
            ),
            properties: {
              content: ["100+", "98%", "10+", "24/7"][number - 1],
              level: "h3",
              textSize: "large",
              alignment: "center",
            },
          },
          text(
            `Statistic ${number} label`,
            `<p style="text-align: center;">${copy("Describe this achievement")}</p>`,
          ),
        ]),
      ),
    },
    {
      id: "gallery",
      name: "Image gallery",
      description:
        "A row of images with editable captions, or images on their own.",
      variants: [
        ...countVariants([3, 4], "{number} with captions", (count) =>
          repeated("Image gallery", count, (number) => [
            photo(`Gallery image ${number}`, "photo"),
            text(
              `Gallery image ${number} caption`,
              `<p style="text-align: center;">${escapeHtml(translate("Image {number} caption", { number }))}</p>`,
            ),
          ]),
        ),
        {
          id: "images",
          label: "Three images only",
          root: repeated("Image gallery", 3, (number) => [
            photo(`Gallery image ${number}`, "photo"),
          ]),
        },
      ],
    },
    {
      id: "pricing",
      name: "Pricing cards",
      description:
        "Styled plans with a price, feature list, and editable button link.",
      variants: countVariants([3, 2], "{number} plans", (count) =>
        repeated(
          "Pricing cards",
          count,
          (number) => [
            centered(
              heading(
                `Plan ${number} name`,
                ["Starter", "Professional", "Enterprise"][number - 1],
                "h3",
              ),
            ),
            {
              ...heading(
                `Plan ${number} price`,
                ["$19", "$49", "$99"][number - 1],
              ),
              properties: {
                content: ["$19", "$49", "$99"][number - 1],
                level: "h3",
                textSize: "large",
                alignment: "center",
              },
            },
            text(
              `Plan ${number} billing`,
              `<p style="text-align: center;">${copy("per month")}</p>`,
            ),
            text(
              `Plan ${number} features`,
              `<ul><li>${copy("A helpful feature")}</li><li>${copy("Another useful benefit")}</li><li>${copy("Support when you need it")}</li></ul>`,
            ),
            action(`Plan ${number} link`, "Choose plan"),
          ],
          true,
        ),
      ),
    },
  ];
};
