import type { Item } from "./limited-users.types";

const propertyFieldTypes: Record<string, readonly string[]> = {
  date: ["Pro\\DatetimeField"],
  phone: ["Pro\\PhoneField"],
  file: ["FileUploadField", "Pro\\FileDragAndDropField"],
  html: ["HtmlField"],
  table: ["Pro\\TableField"],
  rating: ["Pro\\RatingField"],
  signature: ["Pro\\SignatureField"],
  calculation: ["Pro\\CalculationField"],
  cards: ["Pro\\CardsField"],
  image: ["Pro\\ImageField"],
};

export const getHiddenPropertyGroups = (items: Item[]): ReadonlySet<string> => {
  const fieldTypes = items
    .find(({ id }) => id === "layout")
    ?.children?.find(({ id }) => id === "fieldTypes");
  if (fieldTypes?.type !== "toggles") return new Set();

  const enabledTypes = new Set(fieldTypes.values);
  return new Set(
    Object.entries(propertyFieldTypes)
      .filter(
        ([, types]) =>
          !types.some((type) =>
            enabledTypes.has(
              `Solspace\\Freeform\\Fields\\Implementations\\${type}`,
            ),
          ),
      )
      .map(([id]) => id),
  );
};
