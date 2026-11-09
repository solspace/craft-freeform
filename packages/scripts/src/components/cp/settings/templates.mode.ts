export const loadTemplatesModeScript = (root: ParentNode = document): void => {
  const field = root.querySelector("#template-method-field");
  const globalBlock = root.querySelector("#global-email-block");
  if (!field || !globalBlock) return;

  const update = () => {
    const selected = field.querySelector<HTMLInputElement>(
      'input[name="settings[emailTemplateMethod]"]:checked',
    );
    globalBlock.classList.toggle("hidden", selected?.value === "form");
  };
  field.addEventListener("change", update);
  update();
};

export const loadTemplateStorageScript = (
  root: ParentNode = document,
): void => {
  const field = root.querySelector("#storage-type-field");
  const filesDirectory = root.querySelector("#files-directory");
  const templateDefault = root.querySelector("#template-default");
  if (!field || !filesDirectory || !templateDefault) return;
  const update = () => {
    const selected = field.querySelector<HTMLInputElement>(
      'input[name="settings[emailTemplateStorageType]"]:checked',
    )?.value;
    const combined = selected === "files_database";
    filesDirectory.classList.toggle("hidden", selected === "database");
    templateDefault.classList.toggle("combined", combined);
    templateDefault.classList.toggle(
      "hidden",
      !combined || !templateDefault.classList.contains("builder-templates"),
    );
  };
  field.addEventListener("change", update);
  update();
};
