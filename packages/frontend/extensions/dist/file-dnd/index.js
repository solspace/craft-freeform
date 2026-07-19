import { resolveUrl } from "@solspace/freeform-core";
function getConfig(field) {
    return (field.frontend?.config ?? {});
}
function supportsFileDnd(field) {
    return (field.type === "file-dnd" ||
        field.frontend?.extension === "file-dnd" ||
        field.frontend?.renderer === "file-dnd");
}
function resolveUploadToken(formHandle) {
    const key = `ff-upload-token:${formHandle}`;
    try {
        const existing = sessionStorage.getItem(key);
        if (existing) {
            return existing;
        }
        const token = typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `ff-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(key, token);
        return token;
    }
    catch {
        return `ff-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
}
function formatSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    let value = bytes;
    let unit = 0;
    const units = ["B", "KB", "MB", "GB"];
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit += 1;
    }
    return `${value.toFixed(1).replace(/\.0$/, "")} ${units[unit]}`;
}
function isImage(extension) {
    return ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"].includes((extension ?? "").toLowerCase());
}
async function readCsrfToken(baseUrl, manifestCsrfUrl) {
    if (!manifestCsrfUrl) {
        return null;
    }
    try {
        const response = await fetch(resolveUrl(baseUrl, manifestCsrfUrl), {
            credentials: "include",
            headers: { Accept: "application/json" },
        });
        if (!response.ok) {
            return null;
        }
        const json = (await response.json());
        if (json.csrf?.name && json.csrf?.value) {
            return { name: json.csrf.name, value: json.csrf.value };
        }
        return null;
    }
    catch {
        return null;
    }
}
function resolveBaseUrl(context) {
    if (context.baseUrl) {
        return context.baseUrl;
    }
    return context.manifest.site?.baseUrl ?? "";
}
export function createFileDndExtension() {
    return {
        name: "file-dnd",
        version: "0.1.0-beta.1",
        supports: supportsFileDnd,
        async mount(context) {
            const { field, element, setValue, value, manifest } = context;
            if (!supportsFileDnd(field)) {
                return;
            }
            const baseUrl = resolveBaseUrl(context);
            const config = getConfig(field);
            const uploadUrl = config.uploadUrl
                ? resolveUrl(baseUrl, config.uploadUrl)
                : undefined;
            const deleteUrl = config.deleteUrl
                ? resolveUrl(baseUrl, config.deleteUrl)
                : undefined;
            if (!uploadUrl || !deleteUrl) {
                element.replaceChildren();
                const alert = document.createElement("div");
                alert.setAttribute("role", "alert");
                alert.textContent =
                    "File DnD upload endpoints are missing from the manifest.";
                element.append(alert);
                return;
            }
            const formHandle = manifest.form.handle;
            const uploadToken = resolveUploadToken(formHandle);
            const maxFiles = config.maxFiles ?? 1;
            const maxBytes = config.maxFileSizeBytes ?? 2048 * 1000;
            const uploaded = [];
            if (Array.isArray(value)) {
                for (const item of value) {
                    if (typeof item === "string" && item) {
                        uploaded.push({ id: item, name: item });
                    }
                    else if (item &&
                        typeof item === "object" &&
                        "id" in item &&
                        typeof item.id === "string") {
                        uploaded.push(item);
                    }
                }
            }
            // Value submitted to Freeform is asset UID array.
            const syncValue = () => {
                setValue(uploaded.map((file) => file.id));
            };
            element.replaceChildren();
            element.style.setProperty("--accent", config.accent || "#3a85ee");
            const dropzone = document.createElement("button");
            dropzone.type = "button";
            dropzone.className = "ff-file-dnd";
            dropzone.dataset.theme = config.theme || "light";
            dropzone.setAttribute("aria-label", config.placeholder || "Upload a file");
            const placeholder = document.createElement("div");
            placeholder.className = "ff-file-dnd__placeholder";
            placeholder.textContent =
                config.placeholder || "Upload a file or drag and drop";
            const previewZone = document.createElement("div");
            previewZone.className = "ff-file-dnd__preview-zone";
            const messages = document.createElement("ul");
            messages.className = "ff-file-dnd__messages";
            messages.setAttribute("aria-live", "polite");
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.hidden = true;
            fileInput.multiple = Boolean(config.multiple ?? maxFiles > 1);
            if (config.accept) {
                fileInput.accept = config.accept;
            }
            dropzone.append(placeholder, previewZone, messages, fileInput);
            element.append(dropzone);
            if (!document.getElementById("ff-file-dnd-styles")) {
                const style = document.createElement("style");
                style.id = "ff-file-dnd-styles";
                style.textContent = `
          .ff-file-dnd {
            display: block;
            width: 100%;
            text-align: left;
            border: 2px dashed color-mix(in srgb, var(--accent, #3a85ee) 55%, transparent);
            border-radius: 8px;
            padding: 1rem;
            background: transparent;
            color: inherit;
            cursor: pointer;
          }
          .ff-file-dnd[data-dragging] {
            border-style: solid;
            background: color-mix(in srgb, var(--accent, #3a85ee) 12%, transparent);
          }
          .ff-file-dnd__placeholder { margin-bottom: 0.75rem; opacity: 0.85; }
          .ff-file-dnd__preview-zone { display: grid; gap: 0.5rem; }
          .ff-file-dnd__preview {
            display: grid;
            grid-template-columns: 48px 1fr auto;
            gap: 0.75rem;
            align-items: center;
            padding: 0.5rem;
            border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
            border-radius: 6px;
          }
          .ff-file-dnd__thumb {
            width: 48px;
            height: 48px;
            border-radius: 4px;
            background: color-mix(in srgb, currentColor 10%, transparent) center/cover no-repeat;
            display: grid;
            place-items: center;
            font-size: 0.7rem;
          }
          .ff-file-dnd__meta { display: grid; gap: 0.15rem; }
          .ff-file-dnd__meta strong { font-size: 0.9rem; }
          .ff-file-dnd__meta span { font-size: 0.75rem; opacity: 0.7; }
          .ff-file-dnd__remove {
            border: 0;
            background: transparent;
            color: inherit;
            text-decoration: underline;
            cursor: pointer;
          }
          .ff-file-dnd__messages {
            margin: 0.75rem 0 0;
            padding: 0;
            list-style: none;
            font-size: 0.85rem;
            opacity: 0.85;
          }
        `;
                document.head.append(style);
            }
            const setMessage = (text) => {
                messages.replaceChildren();
                if (!text) {
                    return;
                }
                const item = document.createElement("li");
                item.textContent = text;
                messages.append(item);
            };
            const renderPreviews = () => {
                previewZone.replaceChildren();
                for (const file of uploaded) {
                    const card = document.createElement("div");
                    card.className = "ff-file-dnd__preview";
                    card.dataset.completed = "";
                    const thumb = document.createElement("div");
                    thumb.className = "ff-file-dnd__thumb";
                    if (isImage(file.extension) &&
                        file.url &&
                        /^https?:\/\//i.test(file.url)) {
                        thumb.style.backgroundImage = `url(${JSON.stringify(file.url)})`;
                    }
                    else {
                        thumb.textContent = (file.extension || "?").toUpperCase();
                    }
                    const meta = document.createElement("div");
                    meta.className = "ff-file-dnd__meta";
                    const nameEl = document.createElement("strong");
                    nameEl.textContent = file.name;
                    const sizeEl = document.createElement("span");
                    sizeEl.textContent =
                        file.size === undefined || file.size === null
                            ? ""
                            : String(file.size);
                    meta.append(nameEl, sizeEl);
                    const remove = document.createElement("button");
                    remove.type = "button";
                    remove.className = "ff-file-dnd__remove";
                    remove.textContent = "Remove";
                    remove.addEventListener("click", async (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        const confirmed = window.confirm(config.removeFileMessage || "Are you sure?");
                        if (!confirmed) {
                            return;
                        }
                        try {
                            const csrf = await readCsrfToken(baseUrl, manifest.security.csrf?.tokenEndpoint ??
                                manifest.endpoints.csrf?.url);
                            const body = new FormData();
                            body.append("id", file.id);
                            body.append("uploadToken", uploadToken);
                            const headers = {
                                "X-Freeform-Upload-Token": uploadToken,
                                Accept: "application/json",
                            };
                            if (csrf) {
                                headers["X-CSRF-Token"] = csrf.value;
                                body.append(csrf.name, csrf.value);
                            }
                            const response = await fetch(deleteUrl, {
                                method: "POST",
                                credentials: "include",
                                headers,
                                body,
                            });
                            if (!response.ok) {
                                throw new Error("Delete failed");
                            }
                            const index = uploaded.findIndex((item) => item.id === file.id);
                            if (index >= 0) {
                                uploaded.splice(index, 1);
                            }
                            renderPreviews();
                            syncValue();
                            setMessage(null);
                        }
                        catch {
                            setMessage("Could not remove file.");
                        }
                    });
                    card.append(thumb, meta, remove);
                    previewZone.append(card);
                }
                if (uploaded.length > 0) {
                    dropzone.dataset.containsFiles = "";
                }
                else {
                    delete dropzone.dataset.containsFiles;
                }
            };
            const uploadFiles = async (fileList) => {
                const files = Array.from(fileList);
                for (const file of files) {
                    if (uploaded.length >= maxFiles) {
                        setMessage(`Maximum file upload limit of ${maxFiles} reached`);
                        break;
                    }
                    if (file.size > maxBytes) {
                        setMessage(`Maximum file upload size is ${Math.round(maxBytes / 1000)}KB`);
                        continue;
                    }
                    const csrf = await readCsrfToken(baseUrl, manifest.security.csrf?.tokenEndpoint ??
                        manifest.endpoints.csrf?.url);
                    const body = new FormData();
                    body.append(field.handle, file);
                    body.append("uploadToken", uploadToken);
                    const headers = {
                        "X-Freeform-Upload-Token": uploadToken,
                        Accept: "application/json",
                    };
                    if (csrf) {
                        headers["X-CSRF-Token"] = csrf.value;
                        body.append(csrf.name, csrf.value);
                    }
                    setMessage("Upload in progress...");
                    try {
                        const response = await fetch(uploadUrl, {
                            method: "POST",
                            credentials: "include",
                            headers,
                            body,
                        });
                        const json = (await response.json());
                        if (!response.ok || !json.success || !json.data?.id) {
                            setMessage(json.errors?.[0] || json.message || "Upload failed.");
                            continue;
                        }
                        uploaded.push({
                            id: json.data.id,
                            name: json.data.name || file.name,
                            extension: json.data.extension ||
                                file.name.split(".").pop()?.toLowerCase(),
                            size: json.data.size ?? formatSize(file.size),
                            url: json.data.url,
                        });
                        renderPreviews();
                        syncValue();
                        setMessage("Upload complete!");
                    }
                    catch {
                        setMessage("Upload failed.");
                    }
                }
            };
            const onDrag = (event) => {
                event.preventDefault();
                event.stopPropagation();
                dropzone.dataset.dragging = "";
            };
            const onDragLeave = (event) => {
                event.preventDefault();
                event.stopPropagation();
                delete dropzone.dataset.dragging;
            };
            const onDrop = (event) => {
                event.preventDefault();
                event.stopPropagation();
                delete dropzone.dataset.dragging;
                if (event.dataTransfer?.files?.length) {
                    void uploadFiles(event.dataTransfer.files);
                }
            };
            dropzone.addEventListener("dragenter", onDrag);
            dropzone.addEventListener("dragover", onDrag);
            dropzone.addEventListener("dragleave", onDragLeave);
            dropzone.addEventListener("drop", onDrop);
            dropzone.addEventListener("click", (event) => {
                if (event.target.closest(".ff-file-dnd__remove")) {
                    return;
                }
                fileInput.click();
            });
            fileInput.addEventListener("change", () => {
                if (fileInput.files?.length) {
                    void uploadFiles(fileInput.files);
                    fileInput.value = "";
                }
            });
            // Keep UID values when remounting after restore.
            renderPreviews();
            syncValue();
            return () => {
                dropzone.removeEventListener("dragenter", onDrag);
                dropzone.removeEventListener("dragover", onDrag);
                dropzone.removeEventListener("dragleave", onDragLeave);
                dropzone.removeEventListener("drop", onDrop);
                element.replaceChildren();
            };
        },
    };
}
export const fileDndExtension = createFileDndExtension();
