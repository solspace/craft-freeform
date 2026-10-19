import type { Form } from "@ff-client/types/forms";

export const createFormSearch = (search: string) => {
  const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);

  return (form: Pick<Form, "name" | "handle" | "description">): boolean => {
    const text = [form.name, form.handle, form.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return terms.every((term) => text.includes(term));
  };
};
