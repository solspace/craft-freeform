import {
  fieldId,
  getSignatureConfig,
  isSignatureValueEmpty,
  mountSignaturePad,
  SIGNATURE_PEN_CURSOR,
  type SignaturePadController,
} from "@solspace/freeform-core";
import { useEffect, useRef, useState } from "react";
import type { ReactFieldRendererProps } from "../../types.js";

/**
 * Signature pad renderer. Register `signatureExtension` from
 * @solspace/freeform-extensions so manifests that require it resolve.
 */
export function SignatureFieldRenderer(props: ReactFieldRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controllerRef = useRef<SignaturePadController | null>(null);
  const resetVersion = props.form.resetVersion;
  const previousReset = useRef(resetVersion);
  const latest = useRef(props);
  latest.current = props;
  const [typed, setTyped] = useState("");
  const [hasInk, setHasInk] = useState(!isSignatureValueEmpty(props.value));
  const config = getSignatureConfig(props.field);
  const width = config.width ?? 400;
  const height = config.height ?? 100;
  const enabled = props.form.isFieldEnabled(props.field.handle);
  const penColor = config.penColor || "#000000";
  const backgroundColor = config.backgroundColor || "rgba(0,0,0,0)";
  const borderColor = config.borderColor || "#999999";
  const penSize = config.penDotSize ?? 2.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const controller = mountSignaturePad(
      canvas,
      {
        width,
        height,
        penColor,
        backgroundColor,
        penDotSize: penSize,
      },
      {
        onChange: (value) => {
          const { form, field } = latest.current;
          form.setValue(field.handle, value);
        },
        onInkChange: setHasInk,
        onDrawStart: () => setTyped(""),
        isEnabled: () => {
          const { form, field } = latest.current;
          return form.isFieldEnabled(field.handle);
        },
      },
    );
    controllerRef.current = controller;
    controller.update(latest.current.value);
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [width, height, penColor, backgroundColor, penSize]);

  useEffect(() => {
    if (!props.value) setTyped("");
    controllerRef.current?.update(
      props.value,
      previousReset.current !== resetVersion,
    );
    previousReset.current = resetVersion;
  }, [props.value, resetVersion]);

  return (
    <div className={props.classNames.input} data-freeform-signature="">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: "100%",
          maxWidth: width,
          height,
          border: `1px solid ${borderColor}`,
          touchAction: "none",
          cursor: enabled
            ? config.showPenCursor !== false
              ? SIGNATURE_PEN_CURSOR
              : "crosshair"
            : "not-allowed",
          display: "block",
          backgroundColor:
            config.customizeAppearance === false ? "#fff" : backgroundColor,
        }}
        tabIndex={-1}
        aria-hidden="true"
      />
      {config.allowTypedSignature === true && (
        <div className="freeform-signature-type">
          <label
            className={props.classNames.label}
            htmlFor={`${fieldId(props.field)}-typed`}
          >
            {config.typedLabel ?? "Or type your signature"}
          </label>
          <input
            className={props.classNames.input}
            id={`${fieldId(props.field)}-typed`}
            type="text"
            autoComplete="off"
            maxLength={200}
            disabled={!enabled}
            value={typed}
            aria-describedby={
              props.input["aria-describedby"] as string | undefined
            }
            aria-invalid={props.input["aria-invalid"] as boolean | undefined}
            onChange={(event) => {
              setTyped(event.target.value);
              controllerRef.current?.type(event.target.value);
            }}
          />
        </div>
      )}
      <button
        type="button"
        disabled={(!hasInk && !props.value && !typed) || !enabled}
        onClick={() => {
          setTyped("");
          controllerRef.current?.clear();
        }}
      >
        {config.clearLabel ?? "Clear"}
      </button>
    </div>
  );
}
