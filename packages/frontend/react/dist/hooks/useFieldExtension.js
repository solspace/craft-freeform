"use client";
import { useEffect, useRef } from "react";
export function useFieldExtension(field, form) {
    const ref = useRef(null);
    const mountRef = useRef(form.mountFieldExtension);
    const isVisibleRef = useRef(form.isFieldVisible);
    mountRef.current = form.mountFieldExtension;
    isVisibleRef.current = form.isFieldVisible;
    const extension = field.frontend?.extension;
    useEffect(() => {
        const element = ref.current;
        if (!element || !extension) {
            return;
        }
        if (!isVisibleRef.current(field.handle)) {
            return;
        }
        return mountRef.current(field.handle, element);
    }, [extension, field.handle]);
    return ref;
}
