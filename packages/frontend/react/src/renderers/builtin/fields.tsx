import {
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFieldExtension } from "../../hooks/useFieldExtension.js";
import type { ReactFieldRendererProps } from "../../types.js";

type TableCellValue = string | number | boolean | null | File | File[] | string;
type TableFieldValue = TableCellValue[][];

function inputProps(props: ReactFieldRendererProps) {
  const raw = props.input as {
    id?: string;
    name?: string;
    value?: string;
    onChange?: (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => void;
    onBlur?: () => void;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string | null;
    "aria-invalid"?: boolean;
  };

  return {
    ...raw,
    placeholder: raw.placeholder ?? undefined,
  };
}

export function TextFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="text" className={props.classNames.input} {...input} />;
}

export function WebsiteFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="url" className={props.classNames.input} {...input} />;
}

export function RegexFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const pattern =
    (props.field.validation?.pattern as string | undefined) ||
    ((props.field.frontend?.config?.pattern as string | undefined) ??
      undefined);

  return (
    <input
      type="text"
      className={props.classNames.input}
      pattern={pattern || undefined}
      {...input}
    />
  );
}

export function PasswordFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return (
    <input type="password" className={props.classNames.input} {...input} />
  );
}

export function ConfirmFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const targetType = props.field.frontend?.config?.targetType as
    | string
    | undefined;
  const type = targetType === "password" ? "password" : "text";

  return <input type={type} className={props.classNames.input} {...input} />;
}

export function EmailFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="email" className={props.classNames.input} {...input} />;
}

export function NumberFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="number" className={props.classNames.input} {...input} />;
}

export function PhoneFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="tel" className={props.classNames.input} {...input} />;
}

export function HiddenFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="hidden" {...input} />;
}

export function TextareaFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <textarea className={props.classNames.input} rows={4} {...input} />;
}

export function SelectFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const value = String(input.value ?? "");

  return (
    <select className={props.classNames.input} {...input} value={value}>
      {props.field.placeholder ? (
        <option value="">{props.field.placeholder}</option>
      ) : null}
      {(props.field.options ?? []).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function MultipleSelectFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const selected = Array.isArray(props.value)
    ? props.value.map(String)
    : props.value
      ? [String(props.value)]
      : [];

  return (
    <select
      className={props.classNames.input}
      id={input.id}
      name={input.name}
      multiple
      disabled={input.disabled}
      aria-invalid={input["aria-invalid"]}
      value={selected}
      onChange={(event) => {
        const next = Array.from(event.target.selectedOptions).map(
          (option) => option.value,
        );
        props.form.setValue(props.field.handle, next);
      }}
      onBlur={input.onBlur}
    >
      {(props.field.options ?? []).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function CheckboxFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const checked =
    input.value === "1" || props.value === true || input.value === "true";

  return (
    <label className={props.classNames.input}>
      <input
        type="checkbox"
        id={input.id}
        name={input.name}
        checked={checked}
        disabled={input.disabled}
        aria-invalid={input["aria-invalid"]}
        onChange={(event) => {
          props.form.setValue(
            props.field.handle,
            event.target.checked ? "1" : "",
          );
        }}
        onBlur={input.onBlur}
      />
      <span>{props.field.label}</span>
    </label>
  );
}

export function CheckboxesFieldRenderer(props: ReactFieldRendererProps) {
  const selected = Array.isArray(props.value)
    ? props.value.map(String)
    : props.value
      ? [String(props.value)]
      : [];

  return (
    <div className={props.classNames.input}>
      {(props.field.options ?? []).map((option) => (
        <label key={option.value}>
          <input
            type="checkbox"
            name={`${props.field.handle}[]`}
            value={option.value}
            checked={selected.includes(option.value)}
            disabled={!props.form.isFieldEnabled(props.field.handle)}
            onChange={(event) => {
              const next = new Set(selected);
              if (event.target.checked) {
                next.add(option.value);
              } else {
                next.delete(option.value);
              }
              props.form.setValue(props.field.handle, [...next]);
            }}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

export function RadioFieldRenderer(props: ReactFieldRendererProps) {
  const value = String(props.value ?? "");

  return (
    <div className={props.classNames.input} role="radiogroup">
      {(props.field.options ?? []).map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name={props.field.handle}
            value={option.value}
            checked={value === option.value}
            disabled={!props.form.isFieldEnabled(props.field.handle)}
            onChange={() =>
              props.form.setValue(props.field.handle, option.value)
            }
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

export function OpinionScaleFieldRenderer(props: ReactFieldRendererProps) {
  const value = String(props.value ?? "");
  const legends = (props.field.frontend?.config?.legends as string[]) ?? [];

  return (
    <div className={props.classNames.input}>
      <div role="radiogroup" style={{ display: "flex", gap: "0.75rem" }}>
        {(props.field.options ?? []).map((option) => (
          <label
            key={option.value}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <input
              type="radio"
              name={props.field.handle}
              value={option.value}
              checked={value === option.value}
              disabled={!props.form.isFieldEnabled(props.field.handle)}
              onChange={() =>
                props.form.setValue(props.field.handle, option.value)
              }
            />
            <span>{option.label || option.value}</span>
          </label>
        ))}
      </div>
      {legends.length > 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          {legends.map((legend) => (
            <span key={legend}>{legend}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function RatingFieldRenderer(props: ReactFieldRendererProps) {
  const value = String(props.value ?? "");
  const config = (props.field.frontend?.config ?? {}) as {
    colorIdle?: string;
    colorSelected?: string;
  };
  const idle = config.colorIdle || "#dddddd";
  const selected = config.colorSelected || "#ff7700";

  return (
    <div className={props.classNames.input} role="radiogroup">
      {(props.field.options ?? []).map((option) => {
        const active = Number(value) >= Number(option.value);
        return (
          <label
            key={option.value}
            style={{
              cursor: "pointer",
              color: active ? selected : idle,
              fontSize: "1.5rem",
              marginRight: "0.25rem",
            }}
          >
            <input
              type="radio"
              name={props.field.handle}
              value={option.value}
              checked={value === option.value}
              disabled={!props.form.isFieldEnabled(props.field.handle)}
              onChange={() =>
                props.form.setValue(props.field.handle, option.value)
              }
              style={{
                position: "absolute",
                opacity: 0,
                pointerEvents: "none",
              }}
            />
            <span aria-hidden="true">★</span>
            <span className="ff-sr-only">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export function CardsFieldRenderer(props: ReactFieldRendererProps) {
  const cards =
    ((props.field.frontend?.config?.cards as Array<{
      label: string;
      value: string;
      description?: string;
      imageUrl?: string | null;
    }>) ??
      []) ||
    [];
  const maxSelected = Number(
    props.field.frontend?.config?.maxSelectedValues ?? 0,
  );
  const selected = Array.isArray(props.value)
    ? props.value.map(String)
    : props.value
      ? [String(props.value)]
      : [];
  const singleSelect = maxSelected === 1;

  return (
    <div
      className={props.classNames.input}
      style={{
        display: "grid",
        gap: "0.75rem",
        gridTemplateColumns: `repeat(${Math.min(
          Number(props.field.frontend?.config?.cardsPerRow ?? 3) || 3,
          4,
        )}, minmax(0, 1fr))`,
      }}
    >
      {cards.map((card) => {
        const checked = selected.includes(card.value);
        return (
          <label
            key={card.value}
            style={{
              border: checked ? "2px solid currentColor" : "1px solid #ccc",
              borderRadius: "0.5rem",
              padding: "0.75rem",
              cursor: "pointer",
            }}
          >
            <input
              type={singleSelect ? "radio" : "checkbox"}
              name={`${props.field.handle}${singleSelect ? "" : "[]"}`}
              value={card.value}
              checked={checked}
              disabled={!props.form.isFieldEnabled(props.field.handle)}
              onChange={(event) => {
                if (singleSelect) {
                  props.form.setValue(props.field.handle, [card.value]);
                  return;
                }

                const next = new Set(selected);
                if (event.target.checked) {
                  if (maxSelected > 0 && next.size >= maxSelected) {
                    return;
                  }
                  next.add(card.value);
                } else {
                  next.delete(card.value);
                }
                props.form.setValue(props.field.handle, [...next]);
              }}
            />
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt=""
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              />
            ) : null}
            <strong>{card.label}</strong>
            {card.description ? <div>{card.description}</div> : null}
          </label>
        );
      })}
    </div>
  );
}

export function FileFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const config = (props.field.frontend?.config ?? {}) as {
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
  };

  return (
    <input
      type="file"
      className={props.classNames.input}
      id={input.id}
      name={input.name}
      disabled={input.disabled}
      aria-invalid={input["aria-invalid"]}
      accept={config.accept || undefined}
      multiple={Boolean(config.multiple ?? (config.maxFiles ?? 1) > 1)}
      onChange={(event) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
          props.form.setValue(props.field.handle, null);
          return;
        }

        props.form.setValue(
          props.field.handle,
          files.length === 1 ? files[0] : Array.from(files),
        );
      }}
      onBlur={input.onBlur}
    />
  );
}

export function FileDndFieldRenderer(props: ReactFieldRendererProps) {
  const hostRef = useFieldExtension(props.field, props.form);

  return (
    <div
      ref={hostRef}
      className={props.classNames.input}
      data-freeform-file-dnd={props.field.handle}
    />
  );
}

export function HtmlFieldRenderer(props: ReactFieldRendererProps) {
  const contentClass =
    props.classNames.content ?? props.classNames.input ?? "ff-field__content";
  const html = props.field.content?.rendered?.html?.trim();

  if (props.allowRawHtml && html) {
    return (
      <div
        className={contentClass}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Empty rich-text / html with no renderable content — don't invent a second row.
  if (!props.field.instructions) {
    return null;
  }

  return (
    <div className={contentClass} role="note">
      {props.field.instructions}
    </div>
  );
}

export function ImageFieldRenderer(props: ReactFieldRendererProps) {
  const contentClass =
    props.classNames.content ?? props.classNames.input ?? "ff-field__content";
  const config = (props.field.frontend?.config ?? {}) as {
    src?: string | null;
    srcset?: string | null;
    alt?: string | null;
  };
  const image = (
    props.field.content as
      | {
          image?: {
            src?: string | null;
            srcset?: string | null;
            alt?: string | null;
          };
        }
      | undefined
  )?.image;
  const src = image?.src || config.src;
  const srcset = image?.srcset || config.srcset;
  const alt = image?.alt || config.alt || props.field.label || "";

  if (!src) {
    return null;
  }

  return (
    <img
      className={contentClass}
      src={src}
      srcSet={srcset || undefined}
      alt={alt}
    />
  );
}

export function DatetimeFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const config = (props.field.frontend?.config ?? {}) as {
    useNativeTypes?: boolean;
    nativeInputType?: string;
    useDatepicker?: boolean;
  };
  const inputType = config.useNativeTypes
    ? config.nativeInputType || "datetime-local"
    : "text";
  const hostRef = useFieldExtension(props.field, props.form);

  return (
    <div ref={hostRef} data-freeform-datetime={props.field.handle}>
      <input
        type={inputType}
        className={props.classNames.input}
        data-datepicker=""
        data-datepicker-enabled={config.useDatepicker ? "1" : "0"}
        {...input}
      />
    </div>
  );
}

type TableColumn = {
  label: string;
  type: string;
  value?: string;
  options?: string[] | Array<{ label: string; value: string }>;
  placeholder?: string;
  checked?: boolean;
  required?: boolean;
};

function emptyTableRow(columns: TableColumn[]): TableFieldValue[number] {
  return columns.map((column) => {
    if (column.type === "checkbox") {
      return column.checked ? "1" : "";
    }
    if (column.type === "file") {
      return [];
    }
    return column.value ?? "";
  });
}

export function TableFieldRenderer(props: ReactFieldRendererProps) {
  const config = (props.field.frontend?.config ?? {}) as {
    columns?: TableColumn[];
    maxRows?: number | null;
    minRows?: number | null;
    addButtonLabel?: string;
    removeButtonLabel?: string;
  };
  const columns = config.columns ?? [];
  const rows: TableFieldValue = Array.isArray(props.value)
    ? (props.value as unknown as TableFieldValue)
    : [emptyTableRow(columns)];

  const setRows = (next: TableFieldValue) => {
    props.form.setValue(
      props.field.handle,
      next as unknown as Parameters<typeof props.form.setValue>[1],
    );
  };

  const canAdd = !config.maxRows || rows.length < config.maxRows;

  return (
    <div className={props.classNames.input}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.label} style={{ textAlign: "left" }}>
                {column.label}
              </th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {columns.map((column, colIndex) => {
                const cellValue = row[colIndex];
                const optionList = (column.options ?? []).map((option) =>
                  typeof option === "string"
                    ? { label: option, value: option }
                    : option,
                );

                if (column.type === "checkbox") {
                  return (
                    <td key={column.label}>
                      <input
                        type="checkbox"
                        checked={Boolean(cellValue)}
                        disabled={
                          !props.form.isFieldEnabled(props.field.handle)
                        }
                        onChange={(event) => {
                          const next = rows.map((item) => [...item]);
                          next[rowIndex][colIndex] = event.target.checked
                            ? "1"
                            : "";
                          setRows(next);
                        }}
                      />
                    </td>
                  );
                }

                if (column.type === "select") {
                  return (
                    <td key={column.label}>
                      <select
                        value={String(cellValue ?? "")}
                        disabled={
                          !props.form.isFieldEnabled(props.field.handle)
                        }
                        onChange={(event) => {
                          const next = rows.map((item) => [...item]);
                          next[rowIndex][colIndex] = event.target.value;
                          setRows(next);
                        }}
                      >
                        <option value="">
                          {column.placeholder || "Select…"}
                        </option>
                        {optionList.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                }

                if (column.type === "textarea") {
                  return (
                    <td key={column.label}>
                      <textarea
                        value={String(cellValue ?? "")}
                        placeholder={column.placeholder}
                        disabled={
                          !props.form.isFieldEnabled(props.field.handle)
                        }
                        onChange={(event) => {
                          const next = rows.map((item) => [...item]);
                          next[rowIndex][colIndex] = event.target.value;
                          setRows(next);
                        }}
                      />
                    </td>
                  );
                }

                return (
                  <td key={column.label}>
                    <input
                      type={column.type === "radio" ? "text" : "text"}
                      value={String(cellValue ?? "")}
                      placeholder={column.placeholder}
                      disabled={!props.form.isFieldEnabled(props.field.handle)}
                      onChange={(event) => {
                        const next = rows.map((item) => [...item]);
                        next[rowIndex][colIndex] = event.target.value;
                        setRows(next);
                      }}
                    />
                  </td>
                );
              })}
              <td>
                <button
                  type="button"
                  disabled={
                    !props.form.isFieldEnabled(props.field.handle) ||
                    rows.length <= (config.minRows ?? 1)
                  }
                  onClick={() => {
                    setRows(rows.filter((_, index) => index !== rowIndex));
                  }}
                >
                  {config.removeButtonLabel || "Remove"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        disabled={!props.form.isFieldEnabled(props.field.handle) || !canAdd}
        onClick={() => setRows([...rows, emptyTableRow(columns)])}
      >
        {config.addButtonLabel || "Add row"}
      </button>
    </div>
  );
}

export function SignatureFieldRenderer(props: ReactFieldRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(Boolean(props.value));
  const config = (props.field.frontend?.config ?? {}) as {
    width?: number;
    height?: number;
    showClearButton?: boolean;
    borderColor?: string;
    backgroundColor?: string;
    penColor?: string;
    penDotSize?: number;
  };
  const width = config.width ?? 400;
  const height = config.height ?? 100;

  const commit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    props.form.setValue(props.field.handle, canvas.toDataURL("image/png"));
  }, [props.field.handle, props.form]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Initialize on mount/size only. Including props.value would clear strokes whenever commit() updates the form value mid-draw.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    context.fillStyle = config.backgroundColor || "rgba(0,0,0,0)";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = config.penColor || "#000000";
    context.lineWidth = config.penDotSize ?? 2.5;
    context.lineCap = "round";
    context.lineJoin = "round";

    if (typeof props.value === "string" && props.value.startsWith("data:")) {
      const image = new Image();
      image.onload = () => {
        context.drawImage(image, 0, 0);
        setHasInk(true);
      };
      image.src = props.value;
    }
  }, [width, height]);

  const point = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * width,
      y: ((event.clientY - rect.top) / rect.height) * height,
    };
  };

  return (
    <div className={props.classNames.input}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: "100%",
          maxWidth: width,
          height,
          border: `1px solid ${config.borderColor || "#999"}`,
          touchAction: "none",
          cursor: "crosshair",
          display: "block",
        }}
        onPointerDown={(event) => {
          if (!props.form.isFieldEnabled(props.field.handle)) {
            return;
          }
          const canvas = canvasRef.current;
          const context = canvas?.getContext("2d");
          if (!context) {
            return;
          }
          drawing.current = true;
          canvas?.setPointerCapture(event.pointerId);
          const { x, y } = point(event);
          context.beginPath();
          context.moveTo(x, y);
        }}
        onPointerMove={(event) => {
          if (!drawing.current) {
            return;
          }
          const context = canvasRef.current?.getContext("2d");
          if (!context) {
            return;
          }
          const { x, y } = point(event);
          context.lineTo(x, y);
          context.stroke();
          setHasInk(true);
        }}
        onPointerUp={() => {
          if (!drawing.current) {
            return;
          }
          drawing.current = false;
          commit();
        }}
        onPointerLeave={() => {
          if (!drawing.current) {
            return;
          }
          drawing.current = false;
          commit();
        }}
      />
      {config.showClearButton !== false ? (
        <button
          type="button"
          disabled={!hasInk || !props.form.isFieldEnabled(props.field.handle)}
          onClick={() => {
            const canvas = canvasRef.current;
            const context = canvas?.getContext("2d");
            if (!canvas || !context) {
              return;
            }
            context.clearRect(0, 0, width, height);
            context.fillStyle = config.backgroundColor || "rgba(0,0,0,0)";
            context.fillRect(0, 0, width, height);
            setHasInk(false);
            props.form.setValue(props.field.handle, "");
          }}
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}

export function UnsupportedFieldRenderer(props: ReactFieldRendererProps) {
  return (
    <div className={props.classNames.input} role="alert">
      Unsupported field type: {props.field.type}
    </div>
  );
}
