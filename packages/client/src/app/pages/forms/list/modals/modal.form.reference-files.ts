import translate from "@ff-client/utils/translations";

export const REFERENCE_MAX_FILES = 5;
export const REFERENCE_MAX_BYTES = 10 * 1024 * 1024;
export const referenceFileError = (files: File[]): string | undefined => {
  if (files.length > REFERENCE_MAX_FILES)
    return translate("Attach up to 5 reference files.");
  if (
    files.some((file) => file.size === 0) ||
    files.reduce((total, file) => total + file.size, 0) > REFERENCE_MAX_BYTES
  ) {
    return translate(
      "Reference files must be nonempty and total no more than 10 MB.",
    );
  }
  if (
    files.some(
      (file) =>
        !/\.(pdf|png|jpe?g)$/i.test(file.name) ||
        (file.type &&
          !["application/pdf", "image/png", "image/jpeg"].includes(file.type)),
    )
  ) {
    return translate("Reference files must be valid PDF, PNG, or JPEG files.");
  }
};
export const fileMimeType = (file: File): string =>
  file.type ||
  (/\.pdf$/i.test(file.name)
    ? "application/pdf"
    : /\.png$/i.test(file.name)
      ? "image/png"
      : "image/jpeg");
