import type { Page, PageButton } from "@editor/builder/types/layout";

type ButtonGroups = Array<Array<PageButton>>;

export const getButtonGroups = (page: Page): ButtonGroups => {
  const layout = page.buttons?.layout || "save back|submit";
  const groups = layout.split(" ");

  const buttonGroups: Array<Array<PageButton>> = [];
  groups.forEach((group) => {
    const buttons = group.split("|");
    const buttonGroup: PageButton[] = [];
    buttons.forEach((buttonHandle) => {
      if (buttonHandle === "back" && page.order === 0) {
        return;
      }

      switch (buttonHandle) {
        case "submit":
          buttonGroup.push({
            handle: "submit",
            label: page.buttons?.submitLabel || "Submit",
            enabled: true,
            assetId: page.buttons?.submitIcon?.[0] || undefined,
            iconPosition: page.buttons?.submitIconPosition || "left",
          });

          break;

        case "back":
          if (page.buttons?.back) {
            buttonGroup.push({
              handle: "back",
              label: page.buttons?.backLabel || "Back",
              enabled: page.buttons?.back || false,
              assetId: page.buttons?.backIcon?.[0] || undefined,
              iconPosition: page.buttons?.backIconPosition || "left",
            });
          }

          break;

        case "save":
          if (page.buttons?.save) {
            buttonGroup.push({
              handle: "save",
              label: page.buttons?.saveLabel || "Save",
              enabled: page.buttons?.save || false,
              assetId: page.buttons?.saveIcon?.[0] || undefined,
              iconPosition: page.buttons?.saveIconPosition || "left",
            });
          }

          break;

        default:
          return;
      }
    });

    buttonGroups.push(buttonGroup);
  });

  return buttonGroups;
};
