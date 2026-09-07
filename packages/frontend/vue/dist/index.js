import { Fragment as e, computed as t, createBlock as n, createCommentVNode as r, createElementBlock as i, createElementVNode as a, createTextVNode as o, createVNode as s, defineComponent as c, mergeProps as l, normalizeClass as u, normalizeProps as d, normalizeStyle as f, onMounted as p, onScopeDispose as m, onUnmounted as h, openBlock as g, reactive as _, ref as v, renderList as y, renderSlot as b, resolveComponent as x, resolveDynamicComponent as S, shallowRef as C, toDisplayString as w, toValue as ee, unref as T, watch as E, watchEffect as te, withCtx as D } from "vue";
import { canAddTableRow as O, canRemoveTableRow as k, collectExtensionSubmitMeta as ne, createFormState as A, createFreeformClient as re, emptyTableRow as j, evaluateCalculation as M, getCalculationConfig as N, getSignatureConfig as P, getTableConfig as F, isSignatureValueEmpty as I, normalizeTableRows as L, prepareSubmitValues as ie, resolveTableColumnOptions as R, runExtensionAfterSubmit as ae, runExtensionSetups as oe } from "@solspace/freeform-core";
//#region src/components/FormLoader.vue?vue&type=script&setup=true&lang.ts
var z = ["data-variant"], B = {
	key: 0,
	class: "ff-loader-skeleton",
	"aria-hidden": "true"
}, V = {
	key: 1,
	class: "ff-loader-spinner",
	"aria-hidden": "true"
}, se = { class: "ff-loader-message" }, ce = /*#__PURE__*/ ((e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
})(/* @__PURE__ */ c({
	__name: "FormLoader",
	props: {
		message: { default: "Loading form…" },
		loaderClass: { default: "ff-loader" },
		variant: { default: "skeleton" }
	},
	setup(t) {
		return (n, r) => (g(), i("div", {
			role: "status",
			"aria-live": "polite",
			"aria-busy": "true",
			"data-variant": t.variant,
			class: u(["ff-loader-root", t.loaderClass])
		}, [t.variant === "skeleton" ? (g(), i("div", B, [
			r[0] ||= a("div", { class: "ff-loader-line ff-loader-line--title" }, null, -1),
			(g(), i(e, null, y(3, (e) => a("div", {
				key: e,
				class: "ff-loader-field"
			}, [a("div", {
				class: "ff-loader-line ff-loader-line--label",
				style: f({ animationDelay: `${e * .12}s` })
			}, null, 4), a("div", {
				class: "ff-loader-line ff-loader-line--input",
				style: f({
					width: e === 2 ? "62%" : "100%",
					animationDelay: `${e * .12}s`
				})
			}, null, 4)])), 64)),
			r[1] ||= a("div", {
				class: "ff-loader-line ff-loader-line--button",
				style: { animationDelay: "0.36s" }
			}, null, -1)
		])) : (g(), i("div", V)), a("p", se, w(t.message), 1)], 10, z));
	}
}), [["__scopeId", "data-v-36bcdb81"]]), H = {
	name: "default",
	framework: "vue",
	classNameStrategy: "merge",
	classNames: {
		form: "ff-form",
		page: "ff-page",
		row: "ff-row",
		field: "ff-field",
		fieldRequired: "ff-field--required",
		fieldHidden: "ff-field--hidden",
		fieldHasErrors: "ff-field--has-errors",
		label: "ff-field__label",
		instructions: "ff-field__instructions",
		input: "ff-field__input",
		content: "ff-field__content",
		errors: "ff-field__errors",
		error: "ff-field__error",
		buttons: "ff-form__buttons",
		button: "ff-button",
		submitButton: "ff-button ff-button--submit",
		nextButton: "ff-button ff-button--next",
		backButton: "ff-button ff-button--back",
		saveButton: "ff-button ff-button--save",
		success: "ff-form__success"
	},
	defaults: {
		renderLabels: !0,
		renderInstructions: !0,
		renderErrors: !0,
		requiredIndicator: "*",
		colorScheme: "system"
	}
};
function U(e, t) {
	if (!e && !t) return;
	let n = /* @__PURE__ */ new Set([...Object.keys(e ?? {}), ...Object.keys(t ?? {})]), r = {};
	for (let i of n) r[i] = {
		...e?.[i],
		...t?.[i]
	};
	return r;
}
function le(e = {}) {
	let t = e.classNameStrategy ?? H.classNameStrategy, n = t !== "replace";
	return {
		...H,
		...e,
		classNameStrategy: t,
		classNames: n ? {
			...H.classNames,
			...e.classNames
		} : { ...e.classNames },
		classNamesByType: U(n ? H.classNamesByType : void 0, e.classNamesByType),
		defaults: {
			...H.defaults,
			...e.defaults
		},
		renderers: {
			...H.renderers,
			...e.renderers,
			handles: {
				...H.renderers?.handles,
				...e.renderers?.handles
			},
			frontend: {
				...H.renderers?.frontend,
				...e.renderers?.frontend
			},
			types: {
				...H.renderers?.types,
				...e.renderers?.types
			}
		}
	};
}
//#endregion
//#region src/version.ts
var ue = "0.1.17", de = "@solspace/freeform-vue";
//#endregion
//#region src/utils/securityMeta.ts
function fe(e) {
	let t = {};
	return e.security.honeypot?.name && (t.honeypot = {
		name: e.security.honeypot.name,
		value: ""
	}), e.security.javascriptTest?.name && (t.javascriptTest = {
		name: e.security.javascriptTest.name,
		value: e.security.javascriptTest.value ?? ""
	}), t;
}
//#endregion
//#region src/composables/useFreeform.ts
function pe(e, t) {
	return {
		values: { ...e.values },
		touched: { ...e.touched },
		fieldErrors: { ...e.fieldErrors },
		formErrors: [...e.formErrors],
		pageErrors: [...e.pageErrors],
		currentPageIndex: e.currentPageIndex,
		visibilityVersion: t
	};
}
function me(e) {
	let n = t(() => ee(e)), r = t(() => n.value.theme ?? H), i = t(() => n.value.renderers ?? {}), a = t(() => n.value.allowRawHtml ?? !1), o = C(null), s = C(null), c = C(/* @__PURE__ */ new Map()), l = C(/* @__PURE__ */ new Map()), u = C([]), d = v(0), f = v(null), p = v(n.value.manifest ?? null), h = v(!n.value.manifest), g = v(null), y = v(!1), b = v(!1), x = v(null), S = v({
		values: {},
		touched: {},
		fieldErrors: {},
		formErrors: [],
		pageErrors: [],
		currentPageIndex: 0,
		visibilityVersion: 0
	});
	E(() => n.value.extensions, (e) => {
		u.value = e ?? [];
	}, { immediate: !0 });
	function w() {
		let e = s.value;
		e && (d.value += 1, S.value = pe(e, d.value));
	}
	function T() {
		o.value ||= re({
			baseUrl: n.value.baseUrl,
			clientVersion: n.value.clientVersion ?? "0.1.17",
			fetch: n.value.fetch,
			credentials: n.value.credentials
		});
		for (let e of u.value) o.value.extensions.register(e);
		return o.value;
	}
	E(() => n.value.extensions, () => {
		let e = T();
		for (let t of u.value) e.extensions.register(t);
	}), E(p, (e) => {
		e && oe(u.value, { manifest: e });
	}), E(() => [
		n.value.handle,
		n.value.profile,
		n.value.properties,
		n.value.manifest,
		n.value.initialValues
	], () => {
		if (n.value.manifest) {
			s.value = A({
				manifest: n.value.manifest,
				initialValues: n.value.initialValues,
				draftToken: n.value.draftToken,
				draftKey: n.value.draftKey
			}), p.value = n.value.manifest, w(), h.value = !1;
			return;
		}
		if (!n.value.handle && !n.value.profile) {
			g.value = /* @__PURE__ */ Error("Either handle, profile, or manifest is required."), h.value = !1;
			return;
		}
		let e = !1;
		(async () => {
			h.value = !0, g.value = null;
			try {
				let t = await T().loadManifest({
					handle: n.value.handle,
					profile: n.value.profile,
					properties: n.value.properties
				});
				if (e) return;
				s.value = A({
					manifest: t,
					initialValues: n.value.initialValues,
					draftToken: n.value.draftToken,
					draftKey: n.value.draftKey
				}), p.value = t, w(), n.value.onManifestLoaded?.(t);
			} catch (t) {
				e || (g.value = t instanceof Error ? t : /* @__PURE__ */ Error("Failed to load manifest."));
			} finally {
				e || (h.value = !1);
			}
		})(), m(() => {
			e = !0;
		});
	}, { immediate: !0 }), E(() => [n.value.draftToken, n.value.draftKey], () => {
		let e = s.value;
		e && (n.value.draftToken !== void 0 && (e.draftToken = n.value.draftToken ?? null), n.value.draftKey !== void 0 && (e.draftKey = n.value.draftKey ?? null));
	});
	function D(e, t) {
		s.value?.setValue(e, t), w();
	}
	function O(e) {
		return s.value?.getValue(e);
	}
	function k(e) {
		return s.value?.isFieldVisible(e) ?? !1;
	}
	function j(e) {
		return s.value?.isFieldEnabled(e) ?? !0;
	}
	function M(e) {
		let t = s.value, n = p.value?.fields[e], r = t?.getValue(e);
		return {
			id: `freeform-${e}`,
			name: e,
			value: r ?? "",
			onChange: (t) => {
				let n = t.target;
				D(e, n.value);
			},
			onBlur: () => {
				let t = s.value;
				t && (t.touched = {
					...t.touched,
					[e]: !0
				}, w());
			},
			disabled: !j(e),
			required: n?.required ?? !1,
			placeholder: n?.placeholder ?? void 0,
			"aria-invalid": (t?.fieldErrors[e]?.length ?? 0) > 0
		};
	}
	async function N(e = "submit") {
		let t = s.value, r = p.value;
		if (!(!t || !r)) {
			y.value = !0;
			try {
				let i = t.getValuesForSubmit(), { values: a, files: o } = ie(i, r.fields), s = {
					...t.getSubmitContext(),
					sourceUrl: typeof window < "u" ? window.location.href : void 0
				}, c = fe(r), l = await ne(u.value, {
					manifest: r,
					intent: e,
					values: a,
					meta: c,
					context: s,
					baseUrl: n.value.baseUrl
				}), d = await T().submit({
					manifest: r,
					request: {
						values: a,
						intent: e,
						context: s,
						meta: {
							client: de,
							clientVersion: n.value.clientVersion ?? "0.1.17",
							...l
						}
					},
					files: Object.keys(o).length > 0 ? o : void 0
				});
				return t.applySubmitResponse(d), w(), await ae(u.value, {
					manifest: r,
					intent: e,
					response: d,
					baseUrl: n.value.baseUrl
				}), d.complete && (b.value = !0, x.value = d.message ?? r.settings.successMessage ?? "Thank you for your submission."), d.success ? n.value.onSuccess?.(d) : n.value.onError?.(d), d;
			} catch (e) {
				if (e instanceof Error && (e.name === "StripePaymentRedirectError" || e.name === "MolliePaymentRedirectError")) return;
				let r = e instanceof Error ? e : /* @__PURE__ */ Error("Something went wrong while submitting the form.");
				t && (t.formErrors = [r.message], t.fieldErrors = {}, t.pageErrors = [], w()), n.value.onError?.({
					success: !1,
					status: "error",
					complete: !1,
					errors: {
						fields: {},
						form: [r.message],
						page: []
					}
				});
				return;
			} finally {
				y.value = !1;
			}
		}
	}
	let P = () => N("validate"), F = () => N("next"), I = () => N("back"), L = () => N("saveDraft");
	E(() => [
		p.value,
		n.value.draftToken,
		n.value.draftKey
	], () => {
		if (!p.value) return;
		let e = n.value.draftToken, t = n.value.draftKey;
		if (!e || !t) return;
		let r = `${e}:${t}`;
		f.value !== r && (f.value = r, N("validate"));
	});
	function R() {
		p.value && (s.value = A({
			manifest: p.value,
			initialValues: n.value.initialValues,
			draftToken: n.value.draftToken,
			draftKey: n.value.draftKey
		}), b.value = !1, x.value = null, w());
	}
	async function z(e) {
		e?.preventDefault();
		let t = p.value;
		if (!t) return;
		let n = t.layout.pages, r = n.length === 0 || S.value.currentPageIndex >= n.length - 1;
		if (t.settings.multiPage && !r) {
			await F();
			return;
		}
		await N("submit");
	}
	function B(e, t) {
		let r = p.value;
		if (!r) return () => {};
		c.value.set(e, t);
		let i = r.fields[e];
		if (!i) return () => {
			c.value.delete(e);
		};
		let a = !1, o = [];
		return (async () => {
			for (let c of u.value) {
				if (c.supports && !c.supports(i) || !c.mount) continue;
				let l = await c.mount({
					manifest: r,
					field: i,
					element: t,
					value: s.value?.getValue(e),
					setValue: (t) => {
						s.value?.setValue(e, t), w();
					},
					getValues: () => s.value?.getValuesForSubmit() ?? {},
					baseUrl: n.value.baseUrl,
					requestSubmit: () => {
						N("submit");
					}
				});
				if (a) {
					typeof l == "function" && l();
					return;
				}
				typeof l == "function" && o.push(l);
			}
		})(), () => {
			a = !0;
			for (let e of o) e();
			c.value.delete(e);
		};
	}
	function V(e, t) {
		let n = p.value;
		if (!n) return () => {};
		let r = !1, i = [];
		(async () => {
			for (let a of u.value) {
				let o = await a.mountCaptcha?.({
					manifest: n,
					captcha: e,
					element: t
				});
				if (r) {
					typeof o == "function" && o();
					return;
				}
				typeof o == "function" && i.push(o);
			}
		})();
		let a = () => {
			r = !0;
			for (let e of i) e();
			l.value.delete(e.name);
		};
		return l.value.set(e.name, a), a;
	}
	let se = t(() => {
		let e = p.value;
		return e ? {
			manifest: e,
			values: S.value.values,
			touched: S.value.touched,
			fieldErrors: S.value.fieldErrors,
			formErrors: S.value.formErrors,
			pageErrors: S.value.pageErrors,
			currentPageIndex: S.value.currentPageIndex,
			isSubmitting: y.value,
			isComplete: b.value,
			successMessage: x.value,
			setValue: D,
			getValue: O,
			isFieldVisible: k,
			isFieldEnabled: j,
			getFieldProps: M,
			submit: N,
			validate: P,
			goNext: F,
			goBack: I,
			saveDraft: L,
			reset: R,
			handleSubmit: z,
			mountFieldExtension: B,
			mountCaptcha: V
		} : null;
	}), ce = {
		values: {},
		touched: {},
		fieldErrors: {},
		formErrors: [],
		pageErrors: [],
		currentPageIndex: 0,
		isSubmitting: !1,
		isComplete: !1,
		successMessage: null,
		setValue: D,
		getValue: O,
		isFieldVisible: k,
		isFieldEnabled: j,
		getFieldProps: M,
		submit: N,
		validate: P,
		goNext: F,
		goBack: I,
		saveDraft: L,
		reset: R,
		handleSubmit: z,
		mountFieldExtension: B,
		mountCaptcha: V
	}, U = _({});
	return te(() => {
		let e = se.value;
		if (!e) {
			Object.assign(U, {
				loading: h.value,
				error: g.value,
				manifest: null,
				theme: r.value,
				renderers: i.value,
				allowRawHtml: a.value,
				...ce
			});
			return;
		}
		Object.assign(U, {
			...e,
			loading: h.value,
			error: g.value,
			manifest: p.value,
			theme: r.value,
			renderers: i.value,
			allowRawHtml: a.value
		});
	}), U;
}
//#endregion
//#region src/components/Freeform.vue?vue&type=script&setup=true&lang.ts
var he = { role: "alert" }, ge = /* @__PURE__ */ c({
	__name: "Freeform",
	props: {
		handle: {},
		profile: {},
		properties: {},
		baseUrl: {},
		manifest: {},
		initialValues: {},
		draftToken: {},
		draftKey: {},
		clientVersion: {},
		fetch: {},
		credentials: {},
		theme: {},
		renderers: {},
		extensions: {},
		allowRawHtml: { type: Boolean },
		onSuccess: { type: Function },
		onError: { type: Function },
		onManifestLoaded: { type: Function },
		class: {},
		loadingMessage: {}
	},
	setup(e) {
		let i = e, o = me(() => i), c = t(() => o.manifest ? o : null);
		return (t, l) => {
			let d = x("FormLoader"), f = x("FreeformView");
			return t.$slots.default ? b(t.$slots, "default", { form: T(o) }, void 0, void 0, 0) : T(o).loading ? b(t.$slots, "loading", {}, () => [s(d, { message: e.loadingMessage ?? "Loading form…" }, null, 8, ["message"])], void 0, 1) : T(o).error ? b(t.$slots, "error", { error: T(o).error }, () => [a("div", he, w(T(o).error.message), 1)], void 0, 2) : c.value ? (g(), n(f, {
				key: 3,
				form: c.value,
				class: u(i.class)
			}, null, 8, ["form", "class"])) : r("", !0);
		};
	}
});
//#endregion
//#region src/composables/useFieldExtension.ts
function _e(e, t) {
	let n = v(null), r;
	function i() {
		r?.(), r = void 0;
		let i = n.value;
		!i || !e.frontend?.extension || t.isFieldVisible(e.handle) && (r = t.mountFieldExtension(e.handle, i));
	}
	return p(i), E(() => [
		e.frontend?.extension,
		e.handle,
		t.isFieldVisible(e.handle)
	], i), h(() => {
		r?.();
	}), n;
}
//#endregion
//#region src/components/ExtensionHost.vue?vue&type=script&setup=true&lang.ts
var ve = ["hidden"], W = /* @__PURE__ */ c({
	__name: "ExtensionHost",
	props: {
		field: {},
		form: {},
		class: {},
		dataAttr: {},
		dataValue: {},
		hidden: { type: Boolean }
	},
	setup(e) {
		let t = e, n = _e(t.field, t.form);
		function r(e) {
			n.value = e ?? null;
		}
		return (n, a) => (g(), i("div", d({
			ref: r,
			class: t.class,
			[e.dataAttr || ""]: e.dataValue ?? e.field.handle,
			hidden: e.hidden || void 0
		}), [b(n.$slots, "default")], 16, ve));
	}
});
//#endregion
//#region src/renderers/builtin/fields.tsx
function G(e) {
	let t = e.input;
	return {
		...t,
		placeholder: t.placeholder ?? void 0
	};
}
function ye(e) {
	let t = G(e);
	return s("input", l({
		type: "text",
		class: e.classNames.input
	}, t), null);
}
function be(e) {
	let t = G(e);
	return s("input", l({
		type: "url",
		class: e.classNames.input
	}, t), null);
}
function xe(e) {
	let t = G(e), n = e.field.validation?.pattern || (e.field.frontend?.config?.pattern ?? void 0);
	return s("input", l({
		type: "text",
		class: e.classNames.input,
		pattern: n || void 0
	}, t), null);
}
function Se(e) {
	let t = G(e);
	return s("input", l({
		type: "password",
		class: e.classNames.input
	}, t), null);
}
function Ce(e) {
	let t = G(e), n = e.field.frontend?.config?.targetType === "password" ? "password" : "text";
	return s("input", l({
		type: n,
		class: e.classNames.input
	}, t), null);
}
function we(e) {
	let t = G(e);
	return s("input", l({
		type: "email",
		class: e.classNames.input
	}, t), null);
}
function Te(e) {
	let t = G(e);
	return s("input", l({
		type: "number",
		class: e.classNames.input
	}, t), null);
}
function Ee(e) {
	let t = G(e);
	return s("input", l({
		type: "tel",
		class: e.classNames.input
	}, t), null);
}
function De(e) {
	let t = G(e);
	return s("input", l({ type: "hidden" }, t), null);
}
function Oe(e) {
	let t = G(e);
	return s("textarea", l({
		class: e.classNames.input,
		rows: 4
	}, t), null);
}
function K(e) {
	let t = G(e), n = String(t.value ?? "");
	return s("select", l({ class: e.classNames.input }, t, { value: n }), [e.field.placeholder ? s("option", { value: "" }, [e.field.placeholder]) : null, (e.field.options ?? []).map((e) => s("option", {
		key: e.value,
		value: e.value
	}, [e.label]))]);
}
function ke(e) {
	let t = G(e), n = Array.isArray(e.value) ? e.value.map(String) : e.value ? [String(e.value)] : [];
	return s("select", {
		class: e.classNames.input,
		id: t.id,
		name: t.name,
		multiple: !0,
		disabled: t.disabled,
		"aria-invalid": t["aria-invalid"],
		value: n,
		onChange: (t) => {
			let n = Array.from(t.target.selectedOptions).map((e) => e.value);
			e.form.setValue(e.field.handle, n);
		},
		onBlur: t.onBlur
	}, [(e.field.options ?? []).map((e) => s("option", {
		key: e.value,
		value: e.value
	}, [e.label]))]);
}
function Ae(e) {
	let t = G(e), n = t.value === "1" || e.value === !0 || t.value === "true";
	return s("label", { class: e.classNames.optionLabel ?? e.classNames.input }, [s("input", {
		type: "checkbox",
		class: e.classNames.optionInput,
		id: t.id,
		name: t.name,
		checked: n,
		disabled: t.disabled,
		"aria-invalid": t["aria-invalid"],
		onChange: (t) => {
			e.form.setValue(e.field.handle, t.target.checked ? "1" : "");
		},
		onBlur: t.onBlur
	}, null), s("span", null, [e.field.label])]);
}
function je(e) {
	let t = Array.isArray(e.value) ? e.value.map(String) : e.value ? [String(e.value)] : [];
	return s("div", { class: e.classNames.input }, [(e.field.options ?? []).map((n) => s("label", {
		key: n.value,
		class: e.classNames.optionLabel
	}, [s("input", {
		type: "checkbox",
		class: e.classNames.optionInput,
		name: `${e.field.handle}[]`,
		value: n.value,
		checked: t.includes(n.value),
		disabled: !e.form.isFieldEnabled(e.field.handle),
		onChange: (r) => {
			let i = new Set(t);
			r.target.checked ? i.add(n.value) : i.delete(n.value), e.form.setValue(e.field.handle, [...i]);
		}
	}, null), s("span", null, [n.label])]))]);
}
function q(e) {
	let t = String(e.value ?? "");
	return s("div", {
		class: e.classNames.input,
		role: "radiogroup"
	}, [(e.field.options ?? []).map((n) => s("label", {
		key: n.value,
		class: e.classNames.optionLabel
	}, [s("input", {
		type: "radio",
		class: e.classNames.optionInput,
		name: e.field.handle,
		value: n.value,
		checked: t === n.value,
		disabled: !e.form.isFieldEnabled(e.field.handle),
		onChange: () => e.form.setValue(e.field.handle, n.value)
	}, null), s("span", null, [n.label])]))]);
}
function Me(e) {
	let t = String(e.value ?? ""), n = e.field.frontend?.config?.legends ?? [];
	return s("div", { class: e.classNames.input }, [s("div", {
		role: "radiogroup",
		style: {
			display: "flex",
			gap: "0.75rem"
		}
	}, [(e.field.options ?? []).map((n) => s("label", {
		key: n.value,
		class: e.classNames.optionLabel,
		style: e.classNames.optionLabel ? void 0 : {
			display: "flex",
			flexDirection: "column",
			alignItems: "center"
		}
	}, [s("input", {
		type: "radio",
		class: e.classNames.optionInput,
		name: e.field.handle,
		value: n.value,
		checked: t === n.value,
		disabled: !e.form.isFieldEnabled(e.field.handle),
		onChange: () => e.form.setValue(e.field.handle, n.value)
	}, null), s("span", null, [n.label || n.value])]))]), n.length > 0 ? s("div", { style: {
		display: "flex",
		justifyContent: "space-between",
		marginTop: "0.5rem",
		fontSize: "0.875rem"
	} }, [n.map((e) => s("span", { key: e }, [e]))]) : null]);
}
function Ne(e) {
	let t = String(e.value ?? ""), n = e.field.frontend?.config ?? {}, r = n.colorIdle || "#dddddd", i = n.colorSelected || "#ff7700";
	return s("div", {
		class: e.classNames.input,
		role: "radiogroup"
	}, [(e.field.options ?? []).map((n) => {
		let a = Number(t) >= Number(n.value);
		return s("label", {
			key: n.value,
			class: e.classNames.optionLabel,
			style: {
				cursor: "pointer",
				color: a ? i : r,
				fontSize: "1.5rem",
				marginRight: "0.25rem"
			}
		}, [
			s("input", {
				type: "radio",
				class: e.classNames.optionInput,
				name: e.field.handle,
				value: n.value,
				checked: t === n.value,
				disabled: !e.form.isFieldEnabled(e.field.handle),
				onChange: () => e.form.setValue(e.field.handle, n.value),
				style: {
					position: "absolute",
					opacity: 0,
					pointerEvents: "none"
				}
			}, null),
			s("span", { "aria-hidden": "true" }, [o("★")]),
			s("span", { class: "ff-sr-only" }, [n.label])
		]);
	})]);
}
function Pe(e) {
	let t = (e.field.frontend?.config?.cards ?? []) || [], n = Number(e.field.frontend?.config?.maxSelectedValues ?? 0), r = Array.isArray(e.value) ? e.value.map(String) : e.value ? [String(e.value)] : [], i = n === 1;
	return s("div", {
		class: e.classNames.input,
		style: {
			display: "grid",
			gap: "0.75rem",
			gridTemplateColumns: `repeat(${Math.min(Number(e.field.frontend?.config?.cardsPerRow ?? 3) || 3, 4)}, minmax(0, 1fr))`
		}
	}, [t.map((t) => {
		let a = r.includes(t.value);
		return s("label", {
			key: t.value,
			class: e.classNames.optionLabel,
			style: e.classNames.optionLabel ? void 0 : {
				border: a ? "2px solid currentColor" : "1px solid #ccc",
				borderRadius: "0.5rem",
				padding: "0.75rem",
				cursor: "pointer"
			}
		}, [
			s("input", {
				type: i ? "radio" : "checkbox",
				class: e.classNames.optionInput,
				name: `${e.field.handle}${i ? "" : "[]"}`,
				value: t.value,
				checked: a,
				disabled: !e.form.isFieldEnabled(e.field.handle),
				onChange: (a) => {
					if (i) {
						e.form.setValue(e.field.handle, [t.value]);
						return;
					}
					let o = new Set(r);
					if (a.target.checked) {
						if (n > 0 && o.size >= n) return;
						o.add(t.value);
					} else o.delete(t.value);
					e.form.setValue(e.field.handle, [...o]);
				}
			}, null),
			t.imageUrl ? s("img", {
				src: t.imageUrl,
				alt: "",
				style: {
					width: "100%",
					height: "auto",
					display: "block",
					marginBottom: "0.5rem"
				}
			}, null) : null,
			s("strong", null, [t.label]),
			t.description ? s("div", null, [t.description]) : null
		]);
	})]);
}
function J(e) {
	let t = G(e), n = e.field.frontend?.config ?? {};
	return s("input", {
		type: "file",
		class: e.classNames.input,
		id: t.id,
		name: t.name,
		disabled: t.disabled,
		"aria-invalid": t["aria-invalid"],
		accept: n.accept || void 0,
		multiple: !!(n.multiple ?? (n.maxFiles ?? 1) > 1),
		onChange: (t) => {
			let n = t.target.files;
			if (!n || n.length === 0) {
				e.form.setValue(e.field.handle, null);
				return;
			}
			e.form.setValue(e.field.handle, n.length === 1 ? n[0] : Array.from(n));
		},
		onBlur: t.onBlur
	}, null);
}
function Fe(e) {
	return s(W, {
		field: e.field,
		form: e.form,
		class: e.classNames.input,
		dataAttr: "data-freeform-file-dnd"
	}, null);
}
function Ie(e) {
	return s(W, {
		field: e.field,
		form: e.form,
		class: e.classNames.input,
		dataAttr: "data-freeform-stripe"
	}, null);
}
function Le(e) {
	return s(W, {
		field: e.field,
		form: e.form,
		class: e.classNames.input,
		dataAttr: "data-freeform-square"
	}, null);
}
function Re(e) {
	return s(W, {
		field: e.field,
		form: e.form,
		class: e.classNames.input,
		dataAttr: "data-freeform-paypal"
	}, null);
}
function ze(e) {
	return s(W, {
		field: e.field,
		form: e.form,
		class: e.classNames.input,
		dataAttr: "data-freeform-mollie",
		hidden: !0
	}, null);
}
function Y(e) {
	let t = e.classNames.content ?? e.classNames.input ?? "ff-field__content", n = e.field.content?.rendered?.html?.trim();
	return e.allowRawHtml && n ? s("div", {
		class: t,
		innerHTML: n
	}, null) : e.field.instructions ? s("div", {
		class: t,
		role: "note"
	}, [e.field.instructions]) : null;
}
function Be(e) {
	let t = e.classNames.content ?? e.classNames.input ?? "ff-field__content", n = e.field.frontend?.config ?? {}, r = e.field.content?.image, i = r?.src || n.src, a = r?.srcset || n.srcset, o = r?.alt || n.alt || e.field.label || "";
	return i ? s("img", {
		class: t,
		src: i,
		srcset: a || void 0,
		alt: o
	}, null) : null;
}
function Ve(e) {
	let t = G(e), n = e.field.frontend?.config ?? {}, r = n.useNativeTypes ? n.nativeInputType || "datetime-local" : "text";
	return s(W, {
		field: e.field,
		form: e.form,
		dataAttr: "data-freeform-datetime"
	}, { default: () => [s("input", l({
		type: r,
		class: e.classNames.input,
		"data-datepicker": "",
		"data-datepicker-enabled": n.useDatepicker ? "1" : "0"
	}, t), null)] });
}
function He(e) {
	return s("div", {
		class: e.classNames.input,
		role: "alert"
	}, [o("Unsupported field type: "), e.field.type]);
}
//#endregion
//#region src/renderers/builtin/CalculationField.tsx
var Ue = /* @__PURE__ */ c({
	name: "CalculationFieldRenderer",
	props: {
		field: {
			type: Object,
			required: !0
		},
		form: {
			type: Object,
			required: !0
		},
		classNames: {
			type: Object,
			required: !0
		},
		value: { required: !0 }
	},
	setup(e) {
		let t = N(e.field.frontend?.config), n = t.inputType ?? "regularTextInput", r = C(e.form.setValue);
		return r.value = e.form.setValue, E(() => [
			e.field.handle,
			t.calculations,
			t.decimalCount,
			e.form.values
		], () => {
			let n = !1, i = t.calculations ?? "";
			return (async () => {
				let a = await M(i, e.form.values, t.decimalCount);
				if (n) return;
				let o = a == null ? "" : String(a), s = e.form.getValue(e.field.handle);
				String(s ?? "") !== o && r.value(e.field.handle, o);
			})(), () => {
				n = !0;
			};
		}, {
			immediate: !0,
			deep: !0
		}), () => {
			let t = e.value == null || e.value === "" ? "" : String(e.value);
			return n === "hidden" ? s("input", {
				type: "hidden",
				name: e.field.handle,
				value: t,
				readonly: !0
			}, null) : n === "plainText" ? s("div", { class: e.classNames.input }, [s("input", {
				type: "hidden",
				name: e.field.handle,
				value: t,
				readonly: !0
			}, null), s("p", {
				class: "ff-field__calculation-plain",
				"data-freeform-calculation": ""
			}, [t])]) : s("input", {
				class: e.classNames.input,
				type: "text",
				name: e.field.handle,
				id: `freeform-${e.field.handle}`,
				value: t,
				readonly: !0,
				"aria-readonly": "true"
			}, null);
		};
	}
}), We = /* @__PURE__ */ c({
	name: "SignatureFieldRenderer",
	props: {
		field: {
			type: Object,
			required: !0
		},
		form: {
			type: Object,
			required: !0
		},
		value: { required: !0 },
		classNames: {
			type: Object,
			required: !0
		}
	},
	setup(e) {
		let t = C(null), n = C(!1), r = v(!I(e.value)), i = P(e.field), a = i.width ?? 400, c = i.height ?? 100, l = e.form.isFieldEnabled(e.field.handle), u = i.penColor || "#000000", d = i.backgroundColor || "rgba(0,0,0,0)", f = i.borderColor || "#999999", m = i.penDotSize ?? 2.5;
		function g(e) {
			e.fillStyle = d, e.fillRect(0, 0, a, c);
		}
		function _() {
			let n = t.value;
			n && e.form.setValue(e.field.handle, n.toDataURL("image/png"));
		}
		function y() {
			let n = t.value, i = n?.getContext("2d");
			!n || !i || (i.clearRect(0, 0, a, c), g(i), r.value = !1, e.form.setValue(e.field.handle, ""));
		}
		function b() {
			let n = t.value;
			if (!n) return;
			let i = typeof window < "u" && window.devicePixelRatio || 1;
			n.width = Math.floor(a * i), n.height = Math.floor(c * i), n.style.width = `${a}px`, n.style.height = `${c}px`;
			let o = n.getContext("2d");
			if (o) {
				if (o.setTransform(i, 0, 0, i, 0, 0), g(o), o.strokeStyle = u, o.lineWidth = m, o.lineCap = "round", o.lineJoin = "round", typeof e.value == "string" && e.value.startsWith("data:")) {
					let t = new Image();
					t.onload = () => {
						o.drawImage(t, 0, 0, a, c), r.value = !I(e.value);
					}, t.src = e.value;
				} else r.value = !1;
			}
		}
		p(b), E(() => [a, c], b), h(() => {
			n.value = !1;
		});
		function x(e) {
			let n = t.value;
			if (!n) return {
				x: 0,
				y: 0
			};
			let r = n.getBoundingClientRect();
			return {
				x: (e.clientX - r.left) / r.width * a,
				y: (e.clientY - r.top) / r.height * c
			};
		}
		function S() {
			n.value && (n.value = !1, _());
		}
		return () => s("div", {
			class: e.classNames.input,
			"data-freeform-signature": ""
		}, [s("canvas", {
			ref: t,
			width: a,
			height: c,
			style: {
				width: "100%",
				maxWidth: a,
				height: c,
				border: `1px solid ${f}`,
				touchAction: "none",
				cursor: l ? "crosshair" : "not-allowed",
				display: "block",
				backgroundColor: d
			},
			"aria-label": e.field.label,
			onPointerdown: (e) => {
				if (!l) return;
				let r = t.value, i = r?.getContext("2d");
				if (!i || !r) return;
				n.value = !0, r.setPointerCapture(e.pointerId), i.strokeStyle = u, i.lineWidth = m, i.lineCap = "round", i.lineJoin = "round";
				let { x: a, y: o } = x(e);
				i.beginPath(), i.moveTo(a, o);
			},
			onPointermove: (e) => {
				if (!n.value) return;
				let i = t.value?.getContext("2d");
				if (!i) return;
				let { x: a, y: o } = x(e);
				i.lineTo(a, o), i.stroke(), r.value = !0;
			},
			onPointerup: S,
			onPointercancel: S,
			onPointerleave: S
		}, null), i.showClearButton === !1 ? null : s("button", {
			type: "button",
			disabled: !r.value || !l,
			onClick: y
		}, [o("Clear")])]);
	}
}), Ge = /* @__PURE__ */ c({
	name: "TableFieldRenderer",
	props: {
		field: {
			type: Object,
			required: !0
		},
		form: {
			type: Object,
			required: !0
		},
		value: { required: !0 },
		classNames: {
			type: Object,
			required: !0
		}
	},
	setup(e) {
		let n = t(() => F(e.field)), r = t(() => n.value.columns ?? []), i = t(() => e.form.isFieldEnabled(e.field.handle)), a = t(() => L(e.value, r.value, n.value)), o = C(!1);
		E(() => [e.field.handle, e.value], () => {
			o.value || (!Array.isArray(e.value) || e.value.length === 0) && (o.value = !0, e.form.setValue(e.field.handle, a.value));
		}, { immediate: !0 });
		let c = (t) => {
			e.form.setValue(e.field.handle, t);
		}, l = (e, t, n) => {
			let r = a.value.map((e) => [...e]);
			r[e][t] = n, c(r);
		};
		return () => {
			let t = a.value, o = r.value, u = n.value, d = i.value, f = O(t, u);
			return s("div", {
				class: e.classNames.input,
				"data-freeform-table": ""
			}, [s("table", { class: "ff-table" }, [s("thead", null, [s("tr", null, [o.map((e, t) => s("th", {
				key: `${e.label}-${t}`,
				class: e.required ? "is-required" : void 0,
				"data-column-required": e.required ? "true" : void 0
			}, [e.label])), s("th", null, null)])]), s("tbody", null, [t.map((n, r) => s("tr", { key: `row-${r}` }, [o.map((t, i) => {
				let a = n[i], o = R(t), c = `${r}-${i}`;
				if (t.type === "checkbox") return s("td", { key: c }, [s("input", {
					type: "checkbox",
					checked: !!a,
					disabled: !d,
					required: t.required || void 0,
					onChange: (e) => {
						l(r, i, e.target.checked ? "1" : "");
					}
				}, null)]);
				if (t.type === "select" || t.type === "dropdown") return s("td", { key: c }, [s("select", {
					value: String(a ?? ""),
					disabled: !d,
					required: t.required || void 0,
					onChange: (e) => {
						l(r, i, e.target.value);
					}
				}, [s("option", { value: "" }, [t.placeholder || "Select…"]), o.map((e) => s("option", {
					key: e.value,
					value: e.value
				}, [e.label]))])]);
				if (t.type === "radio") return s("td", { key: c }, [s("div", { class: "ff-table__radios" }, [o.map((t) => {
					let n = `${e.field.handle}-${r}-${i}-${t.value}`;
					return s("label", {
						key: t.value,
						for: n
					}, [
						s("input", {
							id: n,
							type: "radio",
							name: `${e.field.handle}[${r}][${i}]`,
							value: t.value,
							checked: String(a ?? "") === t.value,
							disabled: !d,
							onChange: () => {
								l(r, i, t.value);
							}
						}, null),
						" ",
						t.label
					]);
				})])]);
				if (t.type === "textarea") return s("td", { key: c }, [s("textarea", {
					value: String(a ?? ""),
					placeholder: t.placeholder,
					disabled: !d,
					required: t.required || void 0,
					onInput: (e) => {
						l(r, i, e.target.value);
					}
				}, null)]);
				if (t.type === "file") {
					let e = Array.isArray(a) ? a : [], n = Math.max(1, Number(t.metadata?.fileCount ?? 1));
					return s("td", { key: c }, [s("input", {
						type: "file",
						multiple: n > 1,
						disabled: !d,
						onChange: (e) => {
							let t = Array.from(e.target.files ?? []);
							l(r, i, n > 1 ? t : t.slice(0, 1));
						}
					}, null), e.length > 0 ? s("div", { class: "ff-table__file-names" }, [e.map((e) => s("span", { key: `${e.name}-${e.size}` }, [e.name]))]) : null]);
				}
				return s("td", { key: c }, [s("input", {
					type: t.type === "number" ? "number" : "text",
					value: String(a ?? ""),
					placeholder: t.placeholder,
					disabled: !d,
					required: t.required || void 0,
					onInput: (e) => {
						l(r, i, e.target.value);
					}
				}, null)]);
			}), s("td", null, [k(t, r, u) ? s("button", {
				type: "button",
				disabled: !d,
				onClick: () => {
					c(t.filter((e, t) => t !== r));
				}
			}, [u.removeButtonLabel || "Remove"]) : null])]))])]), f ? s("button", {
				type: "button",
				disabled: !d,
				onClick: () => c([...t, j(o)])
			}, [u.addButtonLabel || "Add"]) : null]);
		};
	}
}), Ke = /* @__PURE__ */ c({
	name: "DefaultForm",
	props: {
		form: {
			type: Object,
			required: !0
		},
		class: {
			type: String,
			default: void 0
		},
		onSubmit: {
			type: Function,
			required: !0
		}
	},
	setup(e, { slots: t }) {
		return () => s("form", {
			class: e.class,
			onSubmit: e.onSubmit,
			novalidate: !0
		}, [t.default?.()]);
	}
}), qe = /* @__PURE__ */ c({
	name: "DefaultPage",
	props: {
		form: {
			type: Object,
			required: !0
		},
		pageIndex: {
			type: Number,
			required: !0
		},
		class: {
			type: String,
			default: void 0
		}
	},
	setup(e, { slots: t }) {
		return () => s("div", { class: e.class }, [t.default?.()]);
	}
}), Je = /* @__PURE__ */ c({
	name: "DefaultRow",
	props: { class: {
		type: String,
		default: void 0
	} },
	setup(e, { slots: t }) {
		return () => s("div", { class: e.class }, [t.default?.()]);
	}
}), Ye = /* @__PURE__ */ c({
	name: "DefaultFieldWrapper",
	props: {
		field: {
			type: Object,
			required: !0
		},
		form: {
			type: Object,
			required: !0
		},
		class: {
			type: String,
			default: void 0
		}
	},
	setup(e, { slots: t }) {
		return () => {
			let n = e.field.type === "hidden" || e.field.type === "mollie" || e.field.frontend?.renderer === "payment.mollie" || e.field.frontend?.extension === "payment.mollie";
			return !e.form.isFieldVisible(e.field.handle) && !n ? null : s("div", {
				class: e.class,
				"data-freeform-field": e.field.handle,
				"data-field-container": e.field.handle,
				"data-field-type": e.field.type,
				hidden: !e.form.isFieldVisible(e.field.handle) || n
			}, [t.default?.()]);
		};
	}
}), Xe = /* @__PURE__ */ c({
	name: "DefaultLabel",
	props: {
		field: {
			type: Object,
			required: !0
		},
		class: {
			type: String,
			default: void 0
		},
		requiredIndicator: {
			type: String,
			default: "*"
		}
	},
	setup(e) {
		return () => e.field.label ? s("label", {
			class: e.class,
			for: `freeform-${e.field.handle}`
		}, [e.field.label, e.field.required ? s("span", { "aria-hidden": "true" }, [o(" "), e.requiredIndicator]) : null]) : null;
	}
}), Ze = /* @__PURE__ */ c({
	name: "DefaultInstructions",
	props: {
		field: {
			type: Object,
			required: !0
		},
		class: {
			type: String,
			default: void 0
		}
	},
	setup(e) {
		return () => e.field.instructions ? s("div", { class: e.class }, [e.field.instructions]) : null;
	}
}), Qe = /* @__PURE__ */ c({
	name: "DefaultErrors",
	props: {
		errors: {
			type: Array,
			required: !0
		},
		class: {
			type: String,
			default: void 0
		},
		errorClass: {
			type: String,
			default: void 0
		}
	},
	setup(e) {
		return () => e.errors.length ? s("div", {
			class: e.class,
			role: "alert"
		}, [e.errors.map((t) => s("div", {
			key: t,
			class: e.errorClass
		}, [t]))]) : null;
	}
}), $e = /* @__PURE__ */ c({
	name: "DefaultButtonRow",
	props: { class: {
		type: String,
		default: void 0
	} },
	setup(e, { slots: t }) {
		return () => s("div", { class: e.class }, [t.default?.()]);
	}
});
function X(e, t = "submit") {
	return /* @__PURE__ */ c({
		name: e,
		props: {
			label: {
				type: String,
				required: !0
			},
			class: {
				type: String,
				default: void 0
			},
			disabled: {
				type: Boolean,
				default: !1
			},
			type: {
				type: String,
				default: t
			},
			onClick: {
				type: Function,
				default: void 0
			}
		},
		setup(e) {
			return () => s("button", {
				type: e.type,
				class: e.class,
				disabled: e.disabled,
				onClick: e.onClick
			}, [e.label]);
		}
	});
}
var et = X("DefaultSubmitButton"), tt = X("DefaultNextButton", "button"), nt = X("DefaultBackButton", "button"), rt = X("DefaultSaveButton", "button"), it = /* @__PURE__ */ c({
	name: "DefaultSuccessMessage",
	props: {
		message: {
			type: String,
			required: !0
		},
		class: {
			type: String,
			default: void 0
		}
	},
	setup(e) {
		return () => s("div", {
			class: e.class,
			role: "status"
		}, [e.message]);
	}
}), Z = {
	frontend: {
		text: ye,
		textarea: Oe,
		email: we,
		number: Te,
		phone: Ee,
		website: be,
		regex: xe,
		password: Se,
		confirm: Ce,
		hidden: De,
		dropdown: K,
		select: K,
		"multiple-select": ke,
		checkbox: Ae,
		checkboxes: je,
		radios: q,
		radio: q,
		"opinion-scale": Me,
		rating: Ne,
		cards: Pe,
		datetime: Ve,
		file: J,
		"file-upload": J,
		"file-dnd": Fe,
		html: Y,
		"rich-text": Y,
		image: Be,
		table: Ge,
		signature: We,
		calculation: Ue,
		"payment.stripe": Ie,
		"payment.square": Le,
		"payment.paypal": Re,
		"payment.mollie": ze
	},
	types: {
		text: ye,
		textarea: Oe,
		email: we,
		number: Te,
		phone: Ee,
		website: be,
		regex: xe,
		password: Se,
		confirm: Ce,
		hidden: De,
		select: K,
		dropdown: K,
		"multiple-select": ke,
		checkbox: Ae,
		checkboxes: je,
		radio: q,
		radios: q,
		radiobox: q,
		"opinion-scale": Me,
		rating: Ne,
		cards: Pe,
		datetime: Ve,
		file: J,
		"file-upload": J,
		"file-dnd": Fe,
		html: Y,
		"rich-text": Y,
		image: Be,
		table: Ge,
		signature: We,
		calculation: Ue,
		stripe: Ie,
		square: Le,
		paypal: Re,
		mollie: ze,
		_unsupported: He
	}
}, at = {
	Form: Ke,
	Page: qe,
	Row: Je,
	FieldWrapper: Ye,
	Label: Xe,
	Instructions: Ze,
	Errors: Qe,
	ButtonRow: $e,
	SubmitButton: et,
	NextButton: tt,
	BackButton: nt,
	SaveButton: rt,
	SuccessMessage: it,
	UnsupportedField: He
};
//#endregion
//#region src/theme/mergeClassNames.ts
function Q(...e) {
	return e.filter((e) => typeof e == "string" && e.trim() !== "").join(" ").replace(/\s+/g, " ").trim() || void 0;
}
function ot(e, t, n) {
	return n ? !t || e === "replace" ? n : `${t} ${n}`.trim() : t;
}
//#endregion
//#region src/theme/toBemModifier.ts
function st(e) {
	return e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[_\s]+/g, "-").replace(/-+/g, "-").toLowerCase();
}
//#endregion
//#region src/components/FreeformView.vue
var ct = /* @__PURE__ */ c({
	__name: "FreeformView",
	props: {
		form: {},
		class: {}
	},
	setup(a) {
		let o = a, s = t(() => ({
			...at,
			...o.form.theme.renderers?.components
		})), c = t(() => o.form.theme.classNameStrategy ?? "merge"), l = t(() => o.form.theme.defaults?.colorScheme ?? "system"), d = t(() => Q(o.form.theme.classNames?.form, c.value === "merge" ? `ff-form--${st(o.form.manifest.form.handle)}` : void 0, c.value === "merge" && (l.value === "light" || l.value === "dark") ? `ff-form--${l.value}` : void 0, o.class)), f = t(() => o.form.manifest.layout.pages[o.form.currentPageIndex] ?? o.form.manifest.layout.pages[0] ?? {
			rows: [],
			buttons: {}
		}), p = t(() => o.form.manifest.layout.pages.length === 0 || o.form.currentPageIndex >= o.form.manifest.layout.pages.length - 1), m = t(() => o.form.currentPageIndex === 0);
		function h(e) {
			if (e.type === "image") {
				let t = e.frontend?.config ?? {};
				return !!(e.content?.image?.src || t.src);
			}
			if (e.type === "html" || e.type === "rich-text") {
				let t = e.content?.rendered?.html?.trim();
				return !!(o.form.allowRawHtml && t || e.instructions);
			}
			return !0;
		}
		function _(e) {
			o.form.handleSubmit(e);
		}
		return (t, o) => {
			let l = x("FieldRenderer"), v = x("CaptchaHost");
			return a.form.isComplete && a.form.successMessage ? (g(), n(S(s.value.SuccessMessage), {
				key: 0,
				message: a.form.successMessage,
				class: u(a.form.theme.classNames?.success)
			}, null, 8, ["message", "class"])) : (g(), n(S(s.value.Form), {
				key: 1,
				form: a.form,
				class: u(d.value),
				"on-submit": _
			}, {
				default: D(() => [
					a.form.formErrors.length > 0 ? (g(), n(S(s.value.Errors), {
						key: 0,
						errors: a.form.formErrors,
						class: u(a.form.theme.classNames?.errors),
						"error-class": a.form.theme.classNames?.error
					}, null, 8, [
						"errors",
						"class",
						"error-class"
					])) : r("", !0),
					(g(), n(S(s.value.Page), {
						form: a.form,
						"page-index": a.form.currentPageIndex,
						class: u(T(Q)(a.form.theme.classNames?.page, c.value === "merge" ? `ff-page--${a.form.currentPageIndex}` : void 0))
					}, {
						default: D(() => [(g(!0), i(e, null, y(f.value.rows, (t) => (g(), i(e, { key: t.uid }, [t.fields.filter((e) => {
							let t = a.form.manifest.fields[e];
							return t ? h(t) : !1;
						}).length > 0 ? (g(), n(S(s.value.Row), {
							key: 0,
							class: u(T(Q)(a.form.theme.classNames?.row, c.value === "merge" ? `ff-row--${t.fields.filter((e) => {
								let t = a.form.manifest.fields[e];
								return t ? h(t) : !1;
							}).length}-fields` : void 0))
						}, {
							default: D(() => [(g(!0), i(e, null, y(t.fields.filter((e) => {
								let t = a.form.manifest.fields[e];
								return t ? h(t) : !1;
							}), (e) => (g(), n(l, {
								key: e,
								field: a.form.manifest.fields[e],
								form: a.form,
								theme: a.form.theme,
								renderers: a.form.renderers,
								"allow-raw-html": a.form.allowRawHtml
							}, null, 8, [
								"field",
								"form",
								"theme",
								"renderers",
								"allow-raw-html"
							]))), 128))]),
							_: 2
						}, 1032, ["class"])) : r("", !0)], 64))), 128))]),
						_: 1
					}, 8, [
						"form",
						"page-index",
						"class"
					])),
					(g(!0), i(e, null, y(a.form.manifest.security.captchas ?? [], (e) => (g(), n(v, {
						key: e.name,
						form: a.form,
						captcha: e
					}, null, 8, ["form", "captcha"]))), 128)),
					(g(), n(S(s.value.ButtonRow), { class: u(a.form.theme.classNames?.buttons) }, {
						default: D(() => [
							!m.value && f.value.buttons?.back ? (g(), n(S(s.value.BackButton), {
								key: 0,
								label: f.value.buttons.back.label,
								class: u(a.form.theme.classNames?.backButton),
								disabled: a.form.isSubmitting,
								"on-click": () => void a.form.goBack()
							}, null, 40, [
								"label",
								"class",
								"disabled",
								"on-click"
							])) : r("", !0),
							a.form.manifest.settings.multiPage && !p.value && f.value.buttons?.submit ? (g(), n(S(s.value.NextButton), {
								key: 1,
								label: f.value.buttons.submit.label,
								class: u(a.form.theme.classNames?.nextButton),
								disabled: a.form.isSubmitting,
								"on-click": () => void a.form.goNext()
							}, null, 40, [
								"label",
								"class",
								"disabled",
								"on-click"
							])) : r("", !0),
							(!a.form.manifest.settings.multiPage || p.value) && f.value.buttons?.submit ? (g(), n(S(s.value.SubmitButton), {
								key: 2,
								label: f.value.buttons.submit.label,
								class: u(a.form.theme.classNames?.submitButton),
								disabled: a.form.isSubmitting
							}, null, 8, [
								"label",
								"class",
								"disabled"
							])) : r("", !0),
							f.value.buttons?.save ? (g(), n(S(s.value.SaveButton), {
								key: 3,
								label: f.value.buttons.save.label,
								class: u(a.form.theme.classNames?.saveButton),
								disabled: a.form.isSubmitting,
								"on-click": () => void a.form.saveDraft()
							}, null, 40, [
								"label",
								"class",
								"disabled",
								"on-click"
							])) : r("", !0)
						]),
						_: 1
					}, 8, ["class"]))
				]),
				_: 1
			}, 40, ["form", "class"]));
		};
	}
});
//#endregion
//#region src/renderers/resolve.ts
function lt(e, t, n) {
	let r = e.frontend?.renderer ?? "";
	return [
		t?.handles?.[e.handle],
		r ? t?.frontend?.[r] : void 0,
		t?.types?.[e.type],
		n?.renderers?.handles?.[e.handle],
		r ? n?.renderers?.frontend?.[r] : void 0,
		n?.renderers?.types?.[e.type],
		r ? Z.frontend[r] : void 0,
		r ? Z.types[r] : void 0,
		Z.types[e.type]
	].find((e) => !!e) ?? Z.types._unsupported;
}
//#endregion
//#region src/theme/resolveThemeClassNames.ts
var ut = /* @__PURE__ */ new Set([
	"checkbox",
	"checkboxes",
	"radio",
	"radios",
	"radiobox",
	"rating",
	"opinion-scale",
	"cards"
]);
function $(e, t) {
	return t ? {
		...e,
		...t
	} : e;
}
function dt(e, t, n = !1) {
	let r = e.classNamesByType, i = $({}, e.classNames);
	i = $(i, r?.[t.type]);
	let a = t.frontend?.renderer;
	a && (i = $(i, r?.[a]));
	let o = t.frontend?.extension;
	return o && (i = $(i, r?.[o])), n && i.inputError && (i = ut.has(t.type) ? {
		...i,
		optionInput: Q(i.optionInput, i.inputError)
	} : {
		...i,
		input: Q(i.input, i.inputError)
	}), i;
}
//#endregion
export { de as CLIENT_NAME, ce as FormLoader, ge as Freeform, ct as FreeformView, ue as PACKAGE_VERSION, at as builtinComponents, Z as builtinRenderers, le as createTheme, H as defaultTheme, Q as joinClassNames, ot as mergeClassNames, lt as resolveFieldRenderer, dt as resolveThemeClassNames, st as toBemModifier, _e as useFieldExtension, me as useFreeform };

//# sourceMappingURL=index.js.map