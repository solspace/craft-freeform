import { Fragment as e, computed as t, createBlock as n, createCommentVNode as r, createElementBlock as i, createElementVNode as a, createTextVNode as o, createVNode as s, defineComponent as c, guardReactiveProps as l, mergeProps as u, normalizeClass as d, normalizeProps as f, normalizeStyle as p, onMounted as m, onScopeDispose as h, onUnmounted as g, openBlock as _, reactive as v, ref as y, renderList as b, renderSlot as x, resolveComponent as S, resolveDynamicComponent as C, shallowRef as w, toDisplayString as T, toValue as E, unref as D, useAttrs as O, watch as k, watchEffect as A, withCtx as j } from "vue";
import { canAddTableRow as M, canRemoveTableRow as ee, collectExtensionSubmitMeta as te, createFormState as ne, createFreeformClient as re, emptyTableRow as N, evaluateCalculation as ie, getCalculationConfig as P, getSignatureConfig as F, getTableConfig as I, isSignatureValueEmpty as L, normalizeTableOptions as R, normalizeTableRows as z, prepareSubmitValues as ae, runExtensionAfterSubmit as oe, runExtensionSetups as se } from "@solspace/freeform-core";
//#region src/theme/defaultTheme.ts
var B = {
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
function V(e, t) {
	if (!e && !t) return;
	let n = /* @__PURE__ */ new Set([...Object.keys(e ?? {}), ...Object.keys(t ?? {})]), r = {};
	for (let i of n) r[i] = {
		...e?.[i],
		...t?.[i]
	};
	return r;
}
function ce(e = {}) {
	let t = e.classNameStrategy ?? B.classNameStrategy, n = t !== "replace";
	return {
		...B,
		...e,
		classNameStrategy: t,
		classNames: n ? {
			...B.classNames,
			...e.classNames
		} : { ...e.classNames },
		classNamesByType: V(n ? B.classNamesByType : void 0, e.classNamesByType),
		defaults: {
			...B.defaults,
			...e.defaults
		},
		renderers: {
			...B.renderers,
			...e.renderers,
			handles: {
				...B.renderers?.handles,
				...e.renderers?.handles
			},
			frontend: {
				...B.renderers?.frontend,
				...e.renderers?.frontend
			},
			types: {
				...B.renderers?.types,
				...e.renderers?.types
			}
		}
	};
}
//#endregion
//#region src/version.ts
var le = "0.1.14", ue = "@solspace/freeform-vue";
//#endregion
//#region src/utils/securityMeta.ts
function de(e) {
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
function fe(e, t) {
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
function H(e) {
	let n = t(() => E(e)), r = t(() => n.value.theme ?? B), i = t(() => n.value.renderers ?? {}), a = t(() => n.value.allowRawHtml ?? !1), o = w(null), s = w(null), c = w(/* @__PURE__ */ new Map()), l = w(/* @__PURE__ */ new Map()), u = w([]), d = y(0), f = y(null), p = y(n.value.manifest ?? null), m = y(!n.value.manifest), g = y(null), _ = y(!1), b = y(!1), x = y(null), S = y({
		values: {},
		touched: {},
		fieldErrors: {},
		formErrors: [],
		pageErrors: [],
		currentPageIndex: 0,
		visibilityVersion: 0
	});
	k(() => n.value.extensions, (e) => {
		u.value = e ?? [];
	}, { immediate: !0 });
	function C() {
		let e = s.value;
		e && (d.value += 1, S.value = fe(e, d.value));
	}
	function T() {
		o.value ||= re({
			baseUrl: n.value.baseUrl,
			clientVersion: n.value.clientVersion ?? "0.1.14",
			fetch: n.value.fetch,
			credentials: n.value.credentials
		});
		for (let e of u.value) o.value.extensions.register(e);
		return o.value;
	}
	k(() => n.value.extensions, () => {
		let e = T();
		for (let t of u.value) e.extensions.register(t);
	}), k(p, (e) => {
		e && se(u.value, { manifest: e });
	}), k(() => [
		n.value.handle,
		n.value.profile,
		n.value.properties,
		n.value.manifest,
		n.value.initialValues
	], () => {
		if (n.value.manifest) {
			s.value = ne({
				manifest: n.value.manifest,
				initialValues: n.value.initialValues,
				draftToken: n.value.draftToken,
				draftKey: n.value.draftKey
			}), p.value = n.value.manifest, C(), m.value = !1;
			return;
		}
		if (!n.value.handle && !n.value.profile) {
			g.value = /* @__PURE__ */ Error("Either handle, profile, or manifest is required."), m.value = !1;
			return;
		}
		let e = !1;
		(async () => {
			m.value = !0, g.value = null;
			try {
				let t = await T().loadManifest({
					handle: n.value.handle,
					profile: n.value.profile,
					properties: n.value.properties
				});
				if (e) return;
				s.value = ne({
					manifest: t,
					initialValues: n.value.initialValues,
					draftToken: n.value.draftToken,
					draftKey: n.value.draftKey
				}), p.value = t, C(), n.value.onManifestLoaded?.(t);
			} catch (t) {
				e || (g.value = t instanceof Error ? t : /* @__PURE__ */ Error("Failed to load manifest."));
			} finally {
				e || (m.value = !1);
			}
		})(), h(() => {
			e = !0;
		});
	}, { immediate: !0 }), k(() => [n.value.draftToken, n.value.draftKey], () => {
		let e = s.value;
		e && (n.value.draftToken !== void 0 && (e.draftToken = n.value.draftToken ?? null), n.value.draftKey !== void 0 && (e.draftKey = n.value.draftKey ?? null));
	});
	function D(e, t) {
		s.value?.setValue(e, t), C();
	}
	function O(e) {
		return s.value?.getValue(e);
	}
	function j(e) {
		return s.value?.isFieldVisible(e) ?? !1;
	}
	function M(e) {
		return s.value?.isFieldEnabled(e) ?? !0;
	}
	function ee(e) {
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
				}, C());
			},
			disabled: !M(e),
			required: n?.required ?? !1,
			placeholder: n?.placeholder ?? void 0,
			"aria-invalid": (t?.fieldErrors[e]?.length ?? 0) > 0
		};
	}
	async function N(e = "submit") {
		let t = s.value, r = p.value;
		if (!(!t || !r)) {
			_.value = !0;
			try {
				let i = t.getValuesForSubmit(), { values: a, files: o } = ae(i, r.fields), s = {
					...t.getSubmitContext(),
					sourceUrl: typeof window < "u" ? window.location.href : void 0
				}, c = de(r), l = await te(u.value, {
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
							client: ue,
							clientVersion: n.value.clientVersion ?? "0.1.14",
							...l
						}
					},
					files: Object.keys(o).length > 0 ? o : void 0
				});
				return t.applySubmitResponse(d), C(), await oe(u.value, {
					manifest: r,
					intent: e,
					response: d,
					baseUrl: n.value.baseUrl
				}), d.complete && (b.value = !0, x.value = d.message ?? r.settings.successMessage ?? "Thank you for your submission."), d.success ? n.value.onSuccess?.(d) : n.value.onError?.(d), d;
			} catch (e) {
				if (e instanceof Error && (e.name === "StripePaymentRedirectError" || e.name === "MolliePaymentRedirectError")) return;
				let r = e instanceof Error ? e : /* @__PURE__ */ Error("Something went wrong while submitting the form.");
				t && (t.formErrors = [r.message], t.fieldErrors = {}, t.pageErrors = [], C()), n.value.onError?.({
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
				_.value = !1;
			}
		}
	}
	let ie = () => N("validate"), P = () => N("next"), F = () => N("back"), I = () => N("saveDraft");
	k(() => [
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
	function L() {
		p.value && (s.value = ne({
			manifest: p.value,
			initialValues: n.value.initialValues,
			draftToken: n.value.draftToken,
			draftKey: n.value.draftKey
		}), b.value = !1, x.value = null, C());
	}
	async function R(e) {
		e?.preventDefault();
		let t = p.value;
		if (!t) return;
		let n = t.layout.pages, r = n.length === 0 || S.value.currentPageIndex >= n.length - 1;
		if (t.settings.multiPage && !r) {
			await P();
			return;
		}
		await N("submit");
	}
	function z(e, t) {
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
						s.value?.setValue(e, t), C();
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
	let ce = t(() => {
		let e = p.value;
		return e ? {
			manifest: e,
			values: S.value.values,
			touched: S.value.touched,
			fieldErrors: S.value.fieldErrors,
			formErrors: S.value.formErrors,
			pageErrors: S.value.pageErrors,
			currentPageIndex: S.value.currentPageIndex,
			isSubmitting: _.value,
			isComplete: b.value,
			successMessage: x.value,
			setValue: D,
			getValue: O,
			isFieldVisible: j,
			isFieldEnabled: M,
			getFieldProps: ee,
			submit: N,
			validate: ie,
			goNext: P,
			goBack: F,
			saveDraft: I,
			reset: L,
			handleSubmit: R,
			mountFieldExtension: z,
			mountCaptcha: V
		} : null;
	}), le = {
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
		isFieldVisible: j,
		isFieldEnabled: M,
		getFieldProps: ee,
		submit: N,
		validate: ie,
		goNext: P,
		goBack: F,
		saveDraft: I,
		reset: L,
		handleSubmit: R,
		mountFieldExtension: z,
		mountCaptcha: V
	}, H = v({});
	return A(() => {
		let e = ce.value;
		if (!e) {
			Object.assign(H, {
				loading: m.value,
				error: g.value,
				manifest: null,
				theme: r.value,
				renderers: i.value,
				allowRawHtml: a.value,
				...le
			});
			return;
		}
		Object.assign(H, {
			...e,
			loading: m.value,
			error: g.value,
			manifest: p.value,
			theme: r.value,
			renderers: i.value,
			allowRawHtml: a.value
		});
	}), H;
}
//#endregion
//#region src/components/FormLoader.vue?vue&type=script&setup=true&lang.ts
var pe = ["data-variant"], me = {
	key: 0,
	class: "ff-loader-skeleton",
	"aria-hidden": "true"
}, he = {
	key: 1,
	class: "ff-loader-spinner",
	"aria-hidden": "true"
}, ge = { class: "ff-loader-message" }, _e = /*#__PURE__*/ ((e, t) => {
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
		return (n, r) => (_(), i("div", {
			role: "status",
			"aria-live": "polite",
			"aria-busy": "true",
			"data-variant": t.variant,
			class: d(["ff-loader-root", t.loaderClass])
		}, [t.variant === "skeleton" ? (_(), i("div", me, [
			r[0] ||= a("div", { class: "ff-loader-line ff-loader-line--title" }, null, -1),
			(_(), i(e, null, b(3, (e) => a("div", {
				key: e,
				class: "ff-loader-field"
			}, [a("div", {
				class: "ff-loader-line ff-loader-line--label",
				style: p({ animationDelay: `${e * .12}s` })
			}, null, 4), a("div", {
				class: "ff-loader-line ff-loader-line--input",
				style: p({
					width: e === 2 ? "62%" : "100%",
					animationDelay: `${e * .12}s`
				})
			}, null, 4)])), 64)),
			r[1] ||= a("div", {
				class: "ff-loader-line ff-loader-line--button",
				style: { animationDelay: "0.36s" }
			}, null, -1)
		])) : (_(), i("div", he)), a("p", ge, T(t.message), 1)], 10, pe));
	}
}), [["__scopeId", "data-v-36bcdb81"]]);
//#endregion
//#region src/composables/useFieldExtension.ts
function ve(e, t) {
	let n = y(null), r;
	function i() {
		r?.(), r = void 0;
		let i = n.value;
		!i || !e.frontend?.extension || t.isFieldVisible(e.handle) && (r = t.mountFieldExtension(e.handle, i));
	}
	return m(i), k(() => [
		e.frontend?.extension,
		e.handle,
		t.isFieldVisible(e.handle)
	], i), g(() => {
		r?.();
	}), n;
}
//#endregion
//#region src/components/ExtensionHost.vue?vue&type=script&setup=true&lang.ts
var ye = ["hidden"], U = /* @__PURE__ */ c({
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
		let t = e, n = ve(t.field, t.form);
		function r(e) {
			n.value = e ?? null;
		}
		return (n, a) => (_(), i("div", f({
			ref: r,
			class: t.class,
			[e.dataAttr || ""]: e.dataValue ?? e.field.handle,
			hidden: e.hidden || void 0
		}), [x(n.$slots, "default")], 16, ye));
	}
});
//#endregion
//#region src/renderers/builtin/fields.tsx
function W(e) {
	let t = e.input;
	return {
		...t,
		placeholder: t.placeholder ?? void 0
	};
}
function be(e) {
	let t = W(e);
	return s("input", u({
		type: "text",
		class: e.classNames.input
	}, t), null);
}
function xe(e) {
	let t = W(e);
	return s("input", u({
		type: "url",
		class: e.classNames.input
	}, t), null);
}
function Se(e) {
	let t = W(e), n = e.field.validation?.pattern || (e.field.frontend?.config?.pattern ?? void 0);
	return s("input", u({
		type: "text",
		class: e.classNames.input,
		pattern: n || void 0
	}, t), null);
}
function Ce(e) {
	let t = W(e);
	return s("input", u({
		type: "password",
		class: e.classNames.input
	}, t), null);
}
function we(e) {
	let t = W(e), n = e.field.frontend?.config?.targetType === "password" ? "password" : "text";
	return s("input", u({
		type: n,
		class: e.classNames.input
	}, t), null);
}
function Te(e) {
	let t = W(e);
	return s("input", u({
		type: "email",
		class: e.classNames.input
	}, t), null);
}
function Ee(e) {
	let t = W(e);
	return s("input", u({
		type: "number",
		class: e.classNames.input
	}, t), null);
}
function De(e) {
	let t = W(e);
	return s("input", u({
		type: "tel",
		class: e.classNames.input
	}, t), null);
}
function Oe(e) {
	let t = W(e);
	return s("input", u({ type: "hidden" }, t), null);
}
function ke(e) {
	let t = W(e);
	return s("textarea", u({
		class: e.classNames.input,
		rows: 4
	}, t), null);
}
function G(e) {
	let t = W(e), n = String(t.value ?? "");
	return s("select", u({ class: e.classNames.input }, t, { value: n }), [e.field.placeholder ? s("option", { value: "" }, [e.field.placeholder]) : null, (e.field.options ?? []).map((e) => s("option", {
		key: e.value,
		value: e.value
	}, [e.label]))]);
}
function Ae(e) {
	let t = W(e), n = Array.isArray(e.value) ? e.value.map(String) : e.value ? [String(e.value)] : [];
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
function je(e) {
	let t = W(e), n = t.value === "1" || e.value === !0 || t.value === "true";
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
function Me(e) {
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
function K(e) {
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
function Ne(e) {
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
function Pe(e) {
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
function Fe(e) {
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
function q(e) {
	let t = W(e), n = e.field.frontend?.config ?? {};
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
function Ie(e) {
	return s(U, {
		field: e.field,
		form: e.form,
		class: e.classNames.input,
		dataAttr: "data-freeform-file-dnd"
	}, null);
}
function Le(e) {
	return s(U, {
		field: e.field,
		form: e.form,
		class: e.classNames.input,
		dataAttr: "data-freeform-stripe"
	}, null);
}
function Re(e) {
	return s(U, {
		field: e.field,
		form: e.form,
		class: e.classNames.input,
		dataAttr: "data-freeform-square"
	}, null);
}
function ze(e) {
	return s(U, {
		field: e.field,
		form: e.form,
		class: e.classNames.input,
		dataAttr: "data-freeform-paypal"
	}, null);
}
function Be(e) {
	return s(U, {
		field: e.field,
		form: e.form,
		class: e.classNames.input,
		dataAttr: "data-freeform-mollie",
		hidden: !0
	}, null);
}
function J(e) {
	let t = e.classNames.content ?? e.classNames.input ?? "ff-field__content", n = e.field.content?.rendered?.html?.trim();
	return e.allowRawHtml && n ? s("div", {
		class: t,
		innerHTML: n
	}, null) : e.field.instructions ? s("div", {
		class: t,
		role: "note"
	}, [e.field.instructions]) : null;
}
function Ve(e) {
	let t = e.classNames.content ?? e.classNames.input ?? "ff-field__content", n = e.field.frontend?.config ?? {}, r = e.field.content?.image, i = r?.src || n.src, a = r?.srcset || n.srcset, o = r?.alt || n.alt || e.field.label || "";
	return i ? s("img", {
		class: t,
		src: i,
		srcset: a || void 0,
		alt: o
	}, null) : null;
}
function He(e) {
	let t = W(e), n = e.field.frontend?.config ?? {}, r = n.useNativeTypes ? n.nativeInputType || "datetime-local" : "text";
	return s(U, {
		field: e.field,
		form: e.form,
		dataAttr: "data-freeform-datetime"
	}, { default: () => [s("input", u({
		type: r,
		class: e.classNames.input,
		"data-datepicker": "",
		"data-datepicker-enabled": n.useDatepicker ? "1" : "0"
	}, t), null)] });
}
function Ue(e) {
	return s("div", {
		class: e.classNames.input,
		role: "alert"
	}, [o("Unsupported field type: "), e.field.type]);
}
//#endregion
//#region src/renderers/builtin/CalculationField.tsx
var We = /* @__PURE__ */ c({
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
		let t = P(e.field.frontend?.config), n = t.inputType ?? "regularTextInput", r = w(e.form.setValue);
		return r.value = e.form.setValue, k(() => [
			e.field.handle,
			t.calculations,
			t.decimalCount,
			e.form.values
		], () => {
			let n = !1, i = t.calculations ?? "";
			return (async () => {
				let a = await ie(i, e.form.values, t.decimalCount);
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
}), Ge = /* @__PURE__ */ c({
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
		let t = w(null), n = w(!1), r = y(!L(e.value)), i = F(e.field), a = i.width ?? 400, c = i.height ?? 100, l = e.form.isFieldEnabled(e.field.handle), u = i.penColor || "#000000", d = i.backgroundColor || "rgba(0,0,0,0)", f = i.borderColor || "#999999", p = i.penDotSize ?? 2.5;
		function h(e) {
			e.fillStyle = d, e.fillRect(0, 0, a, c);
		}
		function _() {
			let n = t.value;
			n && e.form.setValue(e.field.handle, n.toDataURL("image/png"));
		}
		function v() {
			let n = t.value, i = n?.getContext("2d");
			!n || !i || (i.clearRect(0, 0, a, c), h(i), r.value = !1, e.form.setValue(e.field.handle, ""));
		}
		function b() {
			let n = t.value;
			if (!n) return;
			let i = typeof window < "u" && window.devicePixelRatio || 1;
			n.width = Math.floor(a * i), n.height = Math.floor(c * i), n.style.width = `${a}px`, n.style.height = `${c}px`;
			let o = n.getContext("2d");
			if (o) {
				if (o.setTransform(i, 0, 0, i, 0, 0), h(o), o.strokeStyle = u, o.lineWidth = p, o.lineCap = "round", o.lineJoin = "round", typeof e.value == "string" && e.value.startsWith("data:")) {
					let t = new Image();
					t.onload = () => {
						o.drawImage(t, 0, 0, a, c), r.value = !L(e.value);
					}, t.src = e.value;
				} else r.value = !1;
			}
		}
		m(b), k(() => [a, c], b), g(() => {
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
				n.value = !0, r.setPointerCapture(e.pointerId), i.strokeStyle = u, i.lineWidth = p, i.lineCap = "round", i.lineJoin = "round";
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
			onClick: v
		}, [o("Clear")])]);
	}
}), Ke = /* @__PURE__ */ c({
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
		let t = I(e.field), n = t.columns ?? [], r = e.form.isFieldEnabled(e.field.handle), i = w(!1), a = z(e.value, n, t);
		k(() => [
			e.field.handle,
			e.value,
			a
		], () => {
			i.value || (!Array.isArray(e.value) || e.value.length === 0) && (i.value = !0, e.form.setValue(e.field.handle, a));
		}, { immediate: !0 });
		let o = (t) => {
			e.form.setValue(e.field.handle, t);
		}, c = (e, t, n) => {
			let r = a.map((e) => [...e]);
			r[e][t] = n, o(r);
		}, l = M(a, t);
		return () => s("div", {
			class: e.classNames.input,
			"data-freeform-table": ""
		}, [s("table", { class: "ff-table" }, [s("thead", null, [s("tr", null, [n.map((e) => s("th", {
			key: e.label,
			class: e.required ? "is-required" : void 0,
			"data-column-required": e.required ? "true" : void 0
		}, [e.label])), s("th", null, null)])]), s("tbody", null, [a.map((i, l) => s("tr", { key: `row-${l}` }, [n.map((t, n) => {
			let a = i[n], o = R(t.options);
			if (t.type === "checkbox") return s("td", { key: t.label }, [s("input", {
				type: "checkbox",
				checked: !!a,
				disabled: !r,
				required: t.required || void 0,
				onChange: (e) => {
					c(l, n, e.target.checked ? "1" : "");
				}
			}, null)]);
			if (t.type === "select" || t.type === "dropdown") return s("td", { key: t.label }, [s("select", {
				value: String(a ?? ""),
				disabled: !r,
				required: t.required || void 0,
				onChange: (e) => {
					c(l, n, e.target.value);
				}
			}, [s("option", { value: "" }, [t.placeholder || "Select…"]), o.map((e) => s("option", {
				key: e.value,
				value: e.value
			}, [e.label]))])]);
			if (t.type === "radio") return s("td", { key: t.label }, [s("div", { class: "ff-table__radios" }, [o.map((t) => {
				let i = `${e.field.handle}-${l}-${n}-${t.value}`;
				return s("label", {
					key: t.value,
					for: i
				}, [
					s("input", {
						id: i,
						type: "radio",
						name: `${e.field.handle}[${l}][${n}]`,
						value: t.value,
						checked: String(a ?? "") === t.value,
						disabled: !r,
						onChange: () => {
							c(l, n, t.value);
						}
					}, null),
					" ",
					t.label
				]);
			})])]);
			if (t.type === "textarea") return s("td", { key: t.label }, [s("textarea", {
				value: String(a ?? ""),
				placeholder: t.placeholder,
				disabled: !r,
				required: t.required || void 0,
				onChange: (e) => {
					c(l, n, e.target.value);
				}
			}, null)]);
			if (t.type === "file") {
				let e = Array.isArray(a) ? a : [], i = Math.max(1, Number(t.metadata?.fileCount ?? 1));
				return s("td", { key: t.label }, [s("input", {
					type: "file",
					multiple: i > 1,
					disabled: !r,
					onChange: (e) => {
						let t = Array.from(e.target.files ?? []);
						c(l, n, i > 1 ? t : t.slice(0, 1));
					}
				}, null), e.length > 0 ? s("div", { class: "ff-table__file-names" }, [e.map((e) => s("span", { key: `${e.name}-${e.size}` }, [e.name]))]) : null]);
			}
			return s("td", { key: t.label }, [s("input", {
				type: "text",
				value: String(a ?? ""),
				placeholder: t.placeholder,
				disabled: !r,
				required: t.required || void 0,
				onChange: (e) => {
					c(l, n, e.target.value);
				}
			}, null)]);
		}), s("td", null, [ee(a, l, t) ? s("button", {
			type: "button",
			disabled: !r,
			onClick: () => {
				o(a.filter((e, t) => t !== l));
			}
		}, [t.removeButtonLabel || "Remove"]) : null])]))])]), l ? s("button", {
			type: "button",
			disabled: !r,
			onClick: () => o([...a, N(n)])
		}, [t.addButtonLabel || "Add"]) : null]);
	}
}), qe = /* @__PURE__ */ c({
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
}), Je = /* @__PURE__ */ c({
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
}), Ye = /* @__PURE__ */ c({
	name: "DefaultRow",
	props: { class: {
		type: String,
		default: void 0
	} },
	setup(e, { slots: t }) {
		return () => s("div", { class: e.class }, [t.default?.()]);
	}
}), Xe = /* @__PURE__ */ c({
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
}), Ze = /* @__PURE__ */ c({
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
}), Qe = /* @__PURE__ */ c({
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
}), $e = /* @__PURE__ */ c({
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
}), et = /* @__PURE__ */ c({
	name: "DefaultButtonRow",
	props: { class: {
		type: String,
		default: void 0
	} },
	setup(e, { slots: t }) {
		return () => s("div", { class: e.class }, [t.default?.()]);
	}
});
function Y(e, t = "submit") {
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
var tt = Y("DefaultSubmitButton"), nt = Y("DefaultNextButton", "button"), rt = Y("DefaultBackButton", "button"), it = Y("DefaultSaveButton", "button"), at = /* @__PURE__ */ c({
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
}), X = {
	frontend: {
		text: be,
		textarea: ke,
		email: Te,
		number: Ee,
		phone: De,
		website: xe,
		regex: Se,
		password: Ce,
		confirm: we,
		hidden: Oe,
		dropdown: G,
		select: G,
		"multiple-select": Ae,
		checkbox: je,
		checkboxes: Me,
		radios: K,
		radio: K,
		"opinion-scale": Ne,
		rating: Pe,
		cards: Fe,
		datetime: He,
		file: q,
		"file-upload": q,
		"file-dnd": Ie,
		html: J,
		"rich-text": J,
		image: Ve,
		table: Ke,
		signature: Ge,
		calculation: We,
		"payment.stripe": Le,
		"payment.square": Re,
		"payment.paypal": ze,
		"payment.mollie": Be
	},
	types: {
		text: be,
		textarea: ke,
		email: Te,
		number: Ee,
		phone: De,
		website: xe,
		regex: Se,
		password: Ce,
		confirm: we,
		hidden: Oe,
		select: G,
		dropdown: G,
		"multiple-select": Ae,
		checkbox: je,
		checkboxes: Me,
		radio: K,
		radios: K,
		radiobox: K,
		"opinion-scale": Ne,
		rating: Pe,
		cards: Fe,
		datetime: He,
		file: q,
		"file-upload": q,
		"file-dnd": Ie,
		html: J,
		"rich-text": J,
		image: Ve,
		table: Ke,
		signature: Ge,
		calculation: We,
		stripe: Le,
		square: Re,
		paypal: ze,
		mollie: Be,
		_unsupported: Ue
	}
}, ot = {
	Form: qe,
	Page: Je,
	Row: Ye,
	FieldWrapper: Xe,
	Label: Ze,
	Instructions: Qe,
	Errors: $e,
	ButtonRow: et,
	SubmitButton: tt,
	NextButton: nt,
	BackButton: rt,
	SaveButton: it,
	SuccessMessage: at,
	UnsupportedField: Ue
};
//#endregion
//#region src/theme/mergeClassNames.ts
function Z(...e) {
	return e.filter((e) => typeof e == "string" && e.trim() !== "").join(" ").replace(/\s+/g, " ").trim() || void 0;
}
function st(e, t, n) {
	return n ? !t || e === "replace" ? n : `${t} ${n}`.trim() : t;
}
//#endregion
//#region src/theme/toBemModifier.ts
function Q(e) {
	return e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[_\s]+/g, "-").replace(/-+/g, "-").toLowerCase();
}
//#endregion
//#region src/components/CaptchaHost.vue?vue&type=script&setup=true&lang.ts
var ct = ["data-freeform-captcha", "data-freeform-captcha-provider"], lt = /* @__PURE__ */ c({
	__name: "CaptchaHost",
	props: {
		form: {},
		captcha: {}
	},
	setup(e) {
		let t = e, n = y(null), r;
		function a(e) {
			return [
				e.name,
				e.provider ?? "",
				e.siteKey ?? "",
				e.startMode ?? "",
				e.theme ?? "",
				e.locale ?? "",
				e.apiEndpoint ?? "",
				e.version ?? "",
				e.size ?? ""
			].join("|");
		}
		function o() {
			r?.(), r = void 0, n.value && (r = t.form.mountCaptcha(t.captcha, n.value));
		}
		m(o), k(() => a(t.captcha), o), g(() => {
			r?.();
		});
		function s(e) {
			n.value = e ?? null;
		}
		return (t, n) => (_(), i("div", {
			ref: s,
			class: "ff-captcha",
			"data-freeform-captcha": e.captcha.name,
			"data-freeform-captcha-provider": e.captcha.provider ?? e.captcha.name
		}, null, 8, ct));
	}
});
//#endregion
//#region src/renderers/resolve.ts
function ut(e, t, n) {
	let r = e.frontend?.renderer ?? "";
	return [
		t?.handles?.[e.handle],
		r ? t?.frontend?.[r] : void 0,
		t?.types?.[e.type],
		n?.renderers?.handles?.[e.handle],
		r ? n?.renderers?.frontend?.[r] : void 0,
		n?.renderers?.types?.[e.type],
		r ? X.frontend[r] : void 0,
		r ? X.types[r] : void 0,
		X.types[e.type]
	].find((e) => !!e) ?? X.types._unsupported;
}
//#endregion
//#region src/theme/resolveThemeClassNames.ts
var dt = /* @__PURE__ */ new Set([
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
function ft(e, t, n = !1) {
	let r = e.classNamesByType, i = $({}, e.classNames);
	i = $(i, r?.[t.type]);
	let a = t.frontend?.renderer;
	a && (i = $(i, r?.[a]));
	let o = t.frontend?.extension;
	return o && (i = $(i, r?.[o])), n && i.inputError && (i = dt.has(t.type) ? {
		...i,
		optionInput: Z(i.optionInput, i.inputError)
	} : {
		...i,
		input: Z(i.input, i.inputError)
	}), i;
}
//#endregion
//#region src/components/FieldRenderer.vue?vue&type=script&setup=true&lang.ts
var pt = ["data-freeform-group"], mt = /* @__PURE__ */ c({
	name: "FieldRenderer",
	__name: "FieldRenderer",
	props: {
		field: {},
		form: {},
		theme: {},
		renderers: {},
		allowRawHtml: { type: Boolean }
	},
	setup(o) {
		let s = o, c = t(() => s.theme.classNameStrategy ?? "merge"), u = t(() => s.form.fieldErrors[s.field.handle] ?? []), p = t(() => ft(s.theme, s.field, u.value.length > 0)), m = t(() => ({
			...ot,
			...s.theme.renderers?.components
		})), h = t(() => ut(s.field, s.renderers, s.theme)), g = t(() => s.form.values[s.field.handle]), v = t(() => s.field.type === "checkbox"), y = t(() => s.field.type === "html" || s.field.type === "rich-text" || s.field.type === "image"), x = t(() => s.field.type === "hidden" || s.field.type === "mollie" || s.field.frontend?.renderer === "payment.mollie" || s.field.frontend?.extension === "payment.mollie"), w = t(() => !v.value && !y.value && !x.value && s.theme.defaults?.renderLabels !== !1), T = t(() => !y.value && !x.value && s.theme.defaults?.renderInstructions !== !1), E = t(() => s.theme.defaults?.renderErrors !== !1), O = t(() => {
			if (!y.value) return !0;
			if (s.field.type === "image") {
				let e = s.field.frontend?.config ?? {};
				return !!(s.field.content?.image?.src || e.src);
			}
			let e = s.field.content?.rendered?.html?.trim();
			return !!(s.allowRawHtml && e || s.field.instructions);
		}), k = t(() => Z(p.value.field, s.field.required ? p.value.fieldRequired : void 0, u.value.length ? p.value.fieldHasErrors : void 0, !s.form.isFieldVisible(s.field.handle) || x.value ? p.value.fieldHidden : void 0, c.value === "merge" ? `ff-field--${Q(s.field.type)}` : void 0, c.value === "merge" ? `ff-field--${Q(s.field.handle)}` : void 0)), A = t(() => ({
			field: s.field,
			form: s.form,
			value: g.value,
			errors: u.value,
			input: s.form.getFieldProps(s.field.handle),
			classNames: p.value,
			allowRawHtml: s.allowRawHtml,
			renderLabel: () => null,
			renderInstructions: () => null,
			renderErrors: () => null
		}));
		return (t, s) => {
			let g = S("FieldRenderer", !0);
			return O.value ? (_(), i(e, { key: 0 }, [x.value ? (_(), n(C(m.value.FieldWrapper), {
				key: 0,
				field: o.field,
				form: o.form,
				class: d(k.value)
			}, {
				default: j(() => [(_(), n(C(h.value), f(l(A.value)), null, 16))]),
				_: 1
			}, 8, [
				"field",
				"form",
				"class"
			])) : o.field.type === "group" ? (_(), n(C(m.value.FieldWrapper), {
				key: 1,
				field: o.field,
				form: o.form,
				class: d(k.value)
			}, {
				default: j(() => [
					w.value ? (_(), n(C(m.value.Label), {
						key: 0,
						field: o.field,
						class: d(p.value.label),
						"required-indicator": o.theme.defaults?.requiredIndicator
					}, null, 8, [
						"field",
						"class",
						"required-indicator"
					])) : r("", !0),
					T.value ? (_(), n(C(m.value.Instructions), {
						key: 1,
						field: o.field,
						class: d(p.value.instructions)
					}, null, 8, ["field", "class"])) : r("", !0),
					a("div", {
						class: d(p.value.input),
						"data-freeform-group": o.field.handle
					}, [(_(!0), i(e, null, b(o.field.layout?.rows ?? [], (t) => (_(), n(C(m.value.Row), {
						key: t.uid,
						class: d(D(Z)(p.value.row, c.value === "merge" ? `ff-row--${t.fields.length}-fields` : void 0))
					}, {
						default: j(() => [(_(!0), i(e, null, b(t.fields, (e) => (_(), n(g, {
							key: e,
							field: o.form.manifest.fields[e],
							form: o.form,
							theme: o.theme,
							renderers: o.renderers,
							"allow-raw-html": o.allowRawHtml
						}, null, 8, [
							"field",
							"form",
							"theme",
							"renderers",
							"allow-raw-html"
						]))), 128))]),
						_: 2
					}, 1032, ["class"]))), 128))], 10, pt),
					E.value ? (_(), n(C(m.value.Errors), {
						key: 2,
						errors: u.value,
						class: d(p.value.errors),
						"error-class": p.value.error
					}, null, 8, [
						"errors",
						"class",
						"error-class"
					])) : r("", !0)
				]),
				_: 1
			}, 8, [
				"field",
				"form",
				"class"
			])) : (_(), n(C(m.value.FieldWrapper), {
				key: 2,
				field: o.field,
				form: o.form,
				class: d(k.value)
			}, {
				default: j(() => [
					w.value ? (_(), n(C(m.value.Label), {
						key: 0,
						field: o.field,
						class: d(p.value.label),
						"required-indicator": o.theme.defaults?.requiredIndicator
					}, null, 8, [
						"field",
						"class",
						"required-indicator"
					])) : r("", !0),
					T.value ? (_(), n(C(m.value.Instructions), {
						key: 1,
						field: o.field,
						class: d(p.value.instructions)
					}, null, 8, ["field", "class"])) : r("", !0),
					(_(), n(C(h.value), f(l(A.value)), null, 16)),
					E.value ? (_(), n(C(m.value.Errors), {
						key: 2,
						errors: u.value,
						class: d(p.value.errors),
						"error-class": p.value.error
					}, null, 8, [
						"errors",
						"class",
						"error-class"
					])) : r("", !0)
				]),
				_: 1
			}, 8, [
				"field",
				"form",
				"class"
			]))], 64)) : r("", !0);
		};
	}
}), ht = /* @__PURE__ */ c({
	__name: "FreeformView",
	props: {
		form: {},
		class: {}
	},
	setup(a) {
		let o = a, s = t(() => ({
			...ot,
			...o.form.theme.renderers?.components
		})), c = t(() => o.form.theme.classNameStrategy ?? "merge"), l = t(() => o.form.theme.defaults?.colorScheme ?? "system"), u = t(() => Z(o.form.theme.classNames?.form, c.value === "merge" ? `ff-form--${Q(o.form.manifest.form.handle)}` : void 0, c.value === "merge" && (l.value === "light" || l.value === "dark") ? `ff-form--${l.value}` : void 0, o.class)), f = t(() => o.form.manifest.layout.pages[o.form.currentPageIndex] ?? o.form.manifest.layout.pages[0] ?? {
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
		function g(e) {
			o.form.handleSubmit(e);
		}
		return (t, o) => a.form.isComplete && a.form.successMessage ? (_(), n(C(s.value.SuccessMessage), {
			key: 0,
			message: a.form.successMessage,
			class: d(a.form.theme.classNames?.success)
		}, null, 8, ["message", "class"])) : (_(), n(C(s.value.Form), {
			key: 1,
			form: a.form,
			class: d(u.value),
			"on-submit": g
		}, {
			default: j(() => [
				a.form.formErrors.length > 0 ? (_(), n(C(s.value.Errors), {
					key: 0,
					errors: a.form.formErrors,
					class: d(a.form.theme.classNames?.errors),
					"error-class": a.form.theme.classNames?.error
				}, null, 8, [
					"errors",
					"class",
					"error-class"
				])) : r("", !0),
				(_(), n(C(s.value.Page), {
					form: a.form,
					"page-index": a.form.currentPageIndex,
					class: d(D(Z)(a.form.theme.classNames?.page, c.value === "merge" ? `ff-page--${a.form.currentPageIndex}` : void 0))
				}, {
					default: j(() => [(_(!0), i(e, null, b(f.value.rows, (t) => (_(), i(e, { key: t.uid }, [t.fields.filter((e) => {
						let t = a.form.manifest.fields[e];
						return t ? h(t) : !1;
					}).length > 0 ? (_(), n(C(s.value.Row), {
						key: 0,
						class: d(D(Z)(a.form.theme.classNames?.row, c.value === "merge" ? `ff-row--${t.fields.filter((e) => {
							let t = a.form.manifest.fields[e];
							return t ? h(t) : !1;
						}).length}-fields` : void 0))
					}, {
						default: j(() => [(_(!0), i(e, null, b(t.fields.filter((e) => {
							let t = a.form.manifest.fields[e];
							return t ? h(t) : !1;
						}), (e) => (_(), n(mt, {
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
				(_(!0), i(e, null, b(a.form.manifest.security.captchas ?? [], (e) => (_(), n(lt, {
					key: e.name,
					form: a.form,
					captcha: e
				}, null, 8, ["form", "captcha"]))), 128)),
				(_(), n(C(s.value.ButtonRow), { class: d(a.form.theme.classNames?.buttons) }, {
					default: j(() => [
						!m.value && f.value.buttons?.back ? (_(), n(C(s.value.BackButton), {
							key: 0,
							label: f.value.buttons.back.label,
							class: d(a.form.theme.classNames?.backButton),
							disabled: a.form.isSubmitting,
							"on-click": () => void a.form.goBack()
						}, null, 40, [
							"label",
							"class",
							"disabled",
							"on-click"
						])) : r("", !0),
						a.form.manifest.settings.multiPage && !p.value && f.value.buttons?.submit ? (_(), n(C(s.value.NextButton), {
							key: 1,
							label: f.value.buttons.submit.label,
							class: d(a.form.theme.classNames?.nextButton),
							disabled: a.form.isSubmitting,
							"on-click": () => void a.form.goNext()
						}, null, 40, [
							"label",
							"class",
							"disabled",
							"on-click"
						])) : r("", !0),
						(!a.form.manifest.settings.multiPage || p.value) && f.value.buttons?.submit ? (_(), n(C(s.value.SubmitButton), {
							key: 2,
							label: f.value.buttons.submit.label,
							class: d(a.form.theme.classNames?.submitButton),
							disabled: a.form.isSubmitting
						}, null, 8, [
							"label",
							"class",
							"disabled"
						])) : r("", !0),
						f.value.buttons?.save ? (_(), n(C(s.value.SaveButton), {
							key: 3,
							label: f.value.buttons.save.label,
							class: d(a.form.theme.classNames?.saveButton),
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
	}
}), gt = { role: "alert" }, _t = /* @__PURE__ */ c({
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
		let i = e, o = O(), c = H(() => i);
		t(() => !!(o.default || i));
		let l = t(() => c.manifest ? c : null);
		return (t, o) => t.$slots.default ? x(t.$slots, "default", { form: D(c) }, void 0, void 0, 0) : D(c).loading ? x(t.$slots, "loading", {}, () => [s(_e, { message: e.loadingMessage ?? "Loading form…" }, null, 8, ["message"])], void 0, 1) : D(c).error ? x(t.$slots, "error", { error: D(c).error }, () => [a("div", gt, T(D(c).error.message), 1)], void 0, 2) : l.value ? (_(), n(ht, {
			key: 3,
			form: l.value,
			class: d(i.class)
		}, null, 8, ["form", "class"])) : r("", !0);
	}
});
//#endregion
export { ue as CLIENT_NAME, _e as FormLoader, _t as Freeform, ht as FreeformView, le as PACKAGE_VERSION, ot as builtinComponents, X as builtinRenderers, ce as createTheme, B as defaultTheme, Z as joinClassNames, st as mergeClassNames, ut as resolveFieldRenderer, ft as resolveThemeClassNames, Q as toBemModifier, ve as useFieldExtension, H as useFreeform };

//# sourceMappingURL=index.js.map