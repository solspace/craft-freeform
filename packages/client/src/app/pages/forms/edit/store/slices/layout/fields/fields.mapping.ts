import type { OptionCollection } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";

const components = {
  line1: "Address Line 1",
  line2: "Address Line 2 / Apartment",
  city: "City",
  state: "State / Province",
  postalCode: "Postal Code",
  country: "Country",
};

export const locationMappingOptions = (
  uid: string,
  label: string,
  includedComponents?: string[],
): OptionCollection => {
  const included = includedComponents ?? Object.keys(components);
  const options: OptionCollection = [
    { value: uid, label },
    {
      value: `${uid}.fullAddress`,
      label: `${label} — ${translate("Full Address")}`,
    },
  ];
  for (const [component, name] of Object.entries(components)) {
    if (!included.includes(component)) continue;
    options.push({
      value: `${uid}.${component}`,
      label: `${label} — ${translate(name)}`,
    });
    if (component === "state" || component === "country") {
      const codeLabel =
        component === "state" ? "State / Province Code" : "Country Code";
      options.push({
        value: `${uid}.${component}Code`,
        label: `${label} — ${translate(codeLabel)}`,
      });
    }
  }
  return options;
};
