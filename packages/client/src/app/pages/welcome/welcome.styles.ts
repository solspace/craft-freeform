import styled from "styled-components";

export const WelcomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - 120px);
  position: relative;
  isolation: isolate;
  perspective: 1800px;
  color: var(--gray-700, #3f4d5a);
  padding: 36px;
  width: 100%;
  margin: 0 0 24px;
  overflow: hidden;
  transition: height .8s cubic-bezier(.22,.75,.2,1);
  background: var(--ui-control-bg-color);
  &::before, &::after { content: ""; position: absolute; z-index: -1; inset: -18%; pointer-events: none; }
  &::before { background: radial-gradient(ellipse 36% 46% at 36% 24%, rgba(100,177,255,.26), transparent 100%), radial-gradient(ellipse 34% 42% at 65% 31%, rgba(255,166,105,.22), transparent 100%); animation: welcome-color-drift 28s ease-in-out infinite alternate; }
  &::after { background: radial-gradient(ellipse 32% 35% at 52% 64%, rgba(255,200,179,.12), transparent 100%); animation: welcome-warm-drift 34s ease-in-out infinite alternate; }
  @keyframes welcome-color-drift { 0% { transform: translate(-2%,-1%) rotate(-3deg) scale(1); } 50% { transform: translate(3%,2%) rotate(2deg) scale(1.04); } 100% { transform: translate(-1%,4%) rotate(5deg) scale(1.02); } }
  @keyframes welcome-warm-drift { 0% { transform: translate(3%,2%) rotate(4deg); } 50% { transform: translate(-4%,-2%) rotate(-3deg) scale(1.08); } 100% { transform: translate(2%,-4%) rotate(1deg) scale(1.03); } }


  .welcome-home, .welcome-comparison-view { backface-visibility: hidden; transform-style: preserve-3d; }
  .welcome-home { display: flex; flex-direction: column; flex: 1; min-width: 0; opacity: 1; visibility: visible; transform: rotateY(0); transform-origin: left center; transition: opacity .35s .22s, transform .8s cubic-bezier(.22,.75,.2,1), visibility 0s; }
  .welcome-comparison-view { position: absolute; inset: 36px; visibility: hidden; opacity: 0; pointer-events: none; transform: rotateY(88deg); transform-origin: right center; transition: opacity .4s, transform .75s cubic-bezier(.4,0,.3,1), visibility 0s .75s; }
  .welcome-home::after, .welcome-comparison-view::after { content: ""; position: absolute; inset: -12px; pointer-events: none; border-radius: 8px; opacity: 0; background: linear-gradient(90deg, rgba(56,81,119,.12), transparent 55%); transition: opacity .5s; }
  .welcome-comparison-view::after { opacity: 1; background: linear-gradient(270deg, rgba(56,81,119,.12), transparent 55%); }
  &[data-comparing="true"] .welcome-home { position: absolute; inset: 36px; opacity: 0; visibility: hidden; transform: rotateY(-88deg); pointer-events: none; transition: opacity .4s, transform .75s cubic-bezier(.4,0,.3,1), visibility 0s .75s; }
  &[data-comparing="true"] .welcome-home::after { opacity: 1; }
  &[data-comparing="true"] .welcome-comparison-view { position: relative; inset: auto; visibility: visible; opacity: 1; transform: rotateY(0); pointer-events: auto; transition: opacity .35s .22s, transform .8s cubic-bezier(.22,.75,.2,1), visibility 0s; }
  &[data-comparing="true"] .welcome-comparison-view::after { opacity: 0; }
  button.welcome-resource { border: 0; background: none; font: inherit; text-align: start; cursor: pointer; }
  .welcome-hero { position: relative; isolation: isolate; display: flex; align-items: center; justify-content: center; flex: 1; min-height: 320px; margin: -36px -36px 0; padding: 40px 36px; text-align: center; background: transparent; }
  .welcome-copy { position: relative; z-index: 1; }
  .welcome-brand { display: flex; align-items: center; justify-content: center; margin: 0 0 24px; }
  .welcome-brand svg { display: block; width: 104px; height: auto; overflow: visible; }
  h1 { color: var(--gray-800, #29323d); margin: 0; font-size: clamp(30px, 3vw, 38px); font-weight: 600; line-height: 1.12; letter-spacing: -1px; }
  .welcome-actions { display: flex; justify-content: center; margin-top: 24px; }
  .welcome-actions .btn, .setup-primary { --primary-button-bg: linear-gradient(180deg, #168af0, #0875d8); --primary-button-border: 1px solid var(--hairline-color); --primary-button-text-color: white; --primary-button-bg--hover: linear-gradient(180deg, #087ce5, #0868c2); --primary-button-bg--active: #075ba9; --primary-button-border--active: 1px solid #075ba9; --primary-button-border--hover: 1px solid #066bc7; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; gap: 12px; min-height: 38px; padding-inline: 18px; }
  .welcome-actions svg, .welcome-resource-action svg { display: block; width: 16px; height: 16px; flex: 0 0 16px; }
  .welcome-wordmark-icon path { transform-box: fill-box; transform-origin: center; }
  .welcome-wordmark-icon path:nth-child(1) { animation: welcome-border-in .75s .08s cubic-bezier(.2,.8,.3,1.18) both; }
  .welcome-wordmark-icon path:nth-child(n+3):nth-child(-n+7) { animation: welcome-line-in .55s var(--welcome-delay) cubic-bezier(.2,.8,.3,1.12) both; }
  .welcome-wordmark-icon path:nth-child(4) { --welcome-delay: .42s; }
  .welcome-wordmark-icon path:nth-child(5) { --welcome-delay: .51s; }
  .welcome-wordmark-icon path:nth-child(6) { --welcome-delay: .6s; }
  .welcome-wordmark-icon path:nth-child(7) { --welcome-delay: .69s; }
  .welcome-wordmark-icon path:nth-child(3) { --welcome-delay: .78s; }
  .welcome-wordmark-icon path:nth-child(8) { animation: welcome-check-in .6s .65s cubic-bezier(.2,.8,.3,1.2) both; }
  .welcome-wordmark-icon path:nth-child(2) { animation: welcome-pencil-in .85s .95s cubic-bezier(.2,.8,.3,1.18) both; }
  @keyframes welcome-border-in { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
  @keyframes welcome-line-in { from { opacity: 0; transform: translate(-18px,6px); } to { opacity: 1; transform: translate(0,0); } }
  @keyframes welcome-check-in { from { opacity: 0; transform: translate(-12px,4px) scale(0); } to { opacity: 1; transform: translate(0,0) scale(1); } }
  @keyframes welcome-pencil-in { from { opacity: 0; transform: translate(26px,-32px) scale(.6); } to { opacity: 1; transform: translate(0,0) scale(1); } }
  .welcome-next { position: relative; padding-top: 24px; }
  .welcome-resources { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px 24px; }
  .welcome-resource { display: grid; grid-template-columns: 22px 1fr; align-content: start; align-items: center; gap: 5px 10px; padding: 10px 0; color: var(--link-color, #2563eb); text-decoration: none; }
  .welcome-resource:hover { text-decoration: none; }
  .welcome-resource:hover .welcome-resource-action { text-decoration: underline; }
  .welcome-resource:focus-visible { outline: 2px solid var(--link-color, #2563eb); outline-offset: 3px; border-radius: 3px; }
  .welcome-resource-icon { display: flex; align-items: center; justify-content: center; flex: 0 0 22px; width: 22px; height: 22px; color: var(--gray-500, #667789); }
  .welcome-resource-icon svg { display: block; width: 21px; height: 21px; }
  .welcome-resource-action { display: flex; align-items: center; gap: 8px; font-size: 14px; }
  .welcome-resource-description { grid-column: 2; color: var(--gray-500, #667789); font-size: 12px; line-height: 1.6; }
  .welcome-comparison { max-width: 1120px; margin-inline: auto; }
  .edition-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 22px; font-size: 13px; }
  .edition-back { display: inline-flex; align-items: center; gap: 6px; min-height: 32px; border: 0; background: none; padding: 0; color: var(--link-color, #2563eb); cursor: pointer; }
  .edition-back svg { width: 18px; height: 18px; display: block; }
  .edition-back:hover { text-decoration: underline; }
  .edition-back:focus-visible { outline: 2px solid var(--link-color, #2563eb); outline-offset: 3px; border-radius: 3px; }
  .edition-heading { text-align: center; margin-bottom: 24px; }
  .edition-heading h2 { font-size: clamp(24px, 3vw, 32px); font-weight: 600; letter-spacing: -.7px; line-height: 1.2; margin: 0 0 8px; color: var(--gray-800, #29323d); }
  .edition-heading h2:focus { outline: none; }
  .edition-heading p { margin: 0; color: var(--gray-500, #667789); font-size: 14px; }
  .edition-table-scroll { overflow: auto; border: 1px solid var(--hairline-color); border-radius: 8px; background: var(--pane-bg, #fff); }
  .edition-table { width: 100%; min-width: 660px; table-layout: fixed; border-collapse: separate; border-spacing: 0; font-size: 13px; }
  .edition-table thead td { width: 37%; }
  .edition-table thead th { padding: 18px 10px 22px; text-align: center; font-weight: 400; }
  .edition-table .edition-current-column { background: var(--ui-control-bg-color); }
  .edition-current { display: block; min-height: 22px; font-size: 11px; font-weight: 600; color: var(--text-color); margin-bottom: 10px; }
  .edition-name { display: block; font-size: 19px; font-weight: 600; margin-bottom: 12px; color: var(--gray-700, #3f4d5a); }
  .edition-price { display: block; font-size: 30px; font-weight: 600; line-height: 1.2; letter-spacing: -1px; color: var(--gray-800, #29323d); }
  .edition-price-unit { display: block; margin-top: 3px; font-size: 12px; color: var(--gray-500, #667789); }
  .edition-renewal { display: block; min-height: 32px; margin-top: 9px; font-size: 11px; line-height: 1.5; color: var(--gray-500, #667789); }
  .edition-table tbody th, .edition-table tbody td { border-top: 1px solid var(--hairline-color); padding: 10px 16px; vertical-align: middle; line-height: 1.5; }
  .edition-table tbody th { text-align: start; font-weight: 400; color: var(--gray-600, #526171); }
  .edition-table tbody td { text-align: center; color: var(--gray-600, #526171); }
  .edition-table svg { width: 20px; height: 20px; display: block; margin: auto; }
  .edition-check { color: var(--text-color); }
  .edition-unavailable { color: var(--text-color); }
  .edition-footer { display: flex; justify-content: space-between; align-items: center; gap: 18px; margin-top: 20px; font-size: 12px; color: var(--gray-500, #667789); }
  .edition-footer p { margin: 0; line-height: 1.65; }
  .edition-footer .btn { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; min-height: 36px; }
  .setup-guide { max-width: 960px; width: 100%; margin-inline: auto; }
  .setup-heading { margin-bottom: 24px; }
  .setup-heading h2 { margin: 0 0 8px; color: var(--gray-800, #29323d); font-size: 30px; font-weight: 600; letter-spacing: -.7px; line-height: 1.2; }
  .setup-heading h2:focus, .setup-step-title:focus { outline: none !important; box-shadow: none !important; }
  .setup-heading p { margin: 0; max-width: 680px; color: var(--gray-500, #667789); font-size: 14px; line-height: 1.6; }
  .setup-steps { display: flex; flex-wrap: wrap; gap: 8px 20px; list-style: none; padding: 0; margin: 0 0 32px; }
  .setup-steps button { display: inline-flex; align-items: center; gap: 7px; min-height: 36px; padding: 0; border: 0; background: none; cursor: pointer; color: var(--gray-500, #667789); font-size: 13px; }
  .setup-steps button > span { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: var(--ui-control-bg-color); border: 1px solid var(--hairline-color); border-radius: 50%; font-size: 11px; }
  .setup-steps button[data-complete="true"] > span { color: var(--text-color); background: var(--pane-bg, #fff); border-color: var(--hairline-color); }
  .setup-steps button > span svg { width: 14px; height: 14px; }
  .setup-steps button[aria-current="step"] { color: var(--text-color); font-weight: 600; }
  .setup-steps button[aria-current="step"] > span { background: var(--blue-600, #087fe5); border-color: var(--blue-600, #087fe5); color: white; }
  .setup-steps button:focus-visible { outline: 2px solid #3476b8; outline-offset: 3px; border-radius: 3px; }
  .setup-steps button:disabled, .edition-back:disabled { cursor: default; opacity: .5; }
  .setup-step { min-height: 290px; animation: setup-step-in .25s ease-out both; }
  @keyframes setup-step-in { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
  .setup-step-title { margin: 0 0 12px; font-size: 20px; line-height: 1.3; color: var(--gray-700, #3f4d5a); }
  .setup-intro { margin: 0 0 18px; max-width: 780px; font-size: 14px; line-height: 1.7; color: var(--gray-600, #526171); }
  .setup-note { margin: 10px 0 20px; max-width: 780px; font-size: 12px; line-height: 1.7; color: var(--gray-500, #667789); }
  .setup-field { margin-top: 24px; }
  .setup-field > h3, .setup-field > h4, .setup-field > label { display: block; margin: 0 0 16px; font-size: 14px; font-weight: 600; line-height: 1.5; }
  .setup-field > h4:has(+ .setup-note), .setup-needs > legend { margin-bottom: 4px; }
  .setup-field > h4 + .setup-note, .setup-needs > legend + .setup-note { margin: 0 0 16px; }
  .setup-field .ff-choice-cards { margin-bottom: 18px; }
  .setup-inputs { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 20px; }
  .setup-inputs .setup-field { margin: 0; }
  .setup-inputs .setup-field > label { margin-bottom: 7px; }
  .setup-inputs input { min-height: 36px; }
  .setup-readonly, .setup-error { padding: 12px 16px; border: 1px solid var(--hairline-color); border-radius: 6px; background: var(--bg-notice, #eaf3ff); color: var(--fg-notice, #24578f); font-size: 13px; line-height: 1.6; margin: 0 0 20px; }
  .setup-error { color: var(--text-color); border-color: var(--hairline-color); background: var(--ui-control-bg-color); }
  .setup-error:focus { outline: none !important; box-shadow: none !important; }
  .setup-error p { margin: 0; }
  .setup-error .btn { margin-top: 10px; }
  .setup-navigation { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-top: 24px; margin-top: 18px; }
  .setup-primary:disabled { opacity: .4 !important; cursor: not-allowed !important; filter: grayscale(.4); }
  .setup-navigation .btn { display: inline-flex; align-items: center; justify-content: center; min-height: 38px; }
  .setup-navigation > .btn:not(.setup-primary) { --button-bg: var(--secondary-button-bg, #dfe5ec); --button-bg--hover: var(--secondary-button-bg--hover, #cdd4de); --button-border: 1px solid var(--input-border-color, #b9c6d7); background: var(--button-bg, #dfe5ec); color: var(--text-color); box-shadow: inset 0 0 0 1px var(--input-border-color, #b9c6d7); }
  .setup-navigation > .btn:not(.setup-primary):hover:not(:disabled) { background: var(--button-bg--hover, #cdd4de); }
  .setup-navigation .setup-primary { margin-inline-start: auto; }
  .setup-review-notice { display: flex; align-items: center; gap: 10px; padding: 12px 14px; margin: 0 0 20px; border: 1px solid var(--border-notice, #b6d4fe); border-radius: 6px; background: var(--bg-notice, #eaf3ff); color: var(--fg-notice, #24578f); font-size: 13px; line-height: 1.65; }
  .setup-review-notice svg { width: 18px; height: 18px; flex: 0 0 18px; color: inherit; }
  .setup-review-notice p { margin: 0; }
  .setup-review { margin: 20px 0 28px; }
  .setup-review > div { display: grid; grid-template-columns: minmax(140px, 1fr) 2fr; gap: 20px; padding: 13px 0; border-bottom: 1px solid var(--hairline-color); font-size: 13px; }
  .setup-review dt { font-weight: 500; }
  .setup-review dd { margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; overflow-wrap: anywhere; }
  .setup-review dd > span { color: var(--gray-500, #667789); }
  .setup-review dd > strong { font-weight: 500; }
  .setup-review svg { width: 16px; height: 16px; flex: 0 0 16px; color: var(--gray-500, #667789); }
  .setup-field { margin-top: 32px; }
  .setup-field h4, .setup-needs legend, .setup-suggestion-group > h4, .setup-next-steps h4 { font-size: 14px; font-weight: 600; line-height: 1.5; margin: 0 0 14px; }
  .setup-needs { border: 0; padding: 0; margin-top: 32px; min-width: 0; }
  .setup-needs > div { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 24px; }
  .setup-needs label { display: flex; align-items: center; gap: 9px; min-height: 34px; font-size: 14px; cursor: pointer; }
  .setup-needs input, .setup-selection > input { appearance: auto; accent-color: #2878bd; width: 16px; height: 16px; flex: 0 0 16px; margin: 0; }
  .setup-suggestion-group { margin-top: 32px; }
  .setup-suggestion-group > h4 { padding: 0 0 10px; border-bottom: 1px solid var(--hairline-color); color: var(--gray-700, #3f4d5a); font-size: 16px; font-weight: 600; }
  .setup-suggestion { display: grid; grid-template-columns: minmax(0, 1fr) minmax(220px, .7fr); gap: 24px; padding: 18px 0; border-bottom: 1px solid var(--hairline-color); align-items: start; }
  .setup-selection { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; font-size: 14px; line-height: 1.5; }
  .setup-selection > input { margin-top: 3px; }
  .setup-selection > .lightswitch { flex: 0 0 auto; margin-top: 2px; }
  .setup-value { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 13px; line-height: 24px; color: var(--text-color); }
  .setup-value strong { font-weight: 600; color: var(--text-color); }
  .setup-value svg { width: 16px; height: 16px; flex: 0 0 16px; }
  .setup-reset { display: block; padding: 0; margin-top: 5px; border: 0; background: none; color: var(--link-color); cursor: pointer; font-size: 12px; }
  .setup-suggestion-control [role="combobox"] { min-width: 0; width: 100%; font-size: 13px; }
  .setup-suggestion-control [role="combobox"] > div { min-height: 36px; box-sizing: border-box; align-items: center; background: var(--pane-bg, #fff); border: 1px solid var(--hairline-color); }
  .setup-guide [aria-disabled="true"] { opacity: .5; cursor: not-allowed; pointer-events: none; }
  .setup-digest, .setup-digest fieldset { min-width: 0; margin: 0; padding: 0; border: 0; }
  .setup-digest-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  .setup-digest .btngroup { display: inline-flex; flex: 0 0 auto; }
  .setup-digest .btn { min-height: 32px; min-width: 0; padding-inline: 7px; font-size: 12px; }
  .setup-suggestion:has(.setup-digest) { grid-template-columns: minmax(0,1fr) minmax(380px,.7fr); }
  .setup-needs .lightswitch { flex: 0 0 auto; }
  .setup-digest .btn[aria-pressed="true"] { background: var(--gray-600, #606d7b); color: white; box-shadow: none; }
  .setup-digest .setup-note { margin: 8px 0 0; }
  .setup-required-hint { margin-bottom: 0; color: var(--fg-warning, var(--warning-color, #946200)); font-weight: 500; }
  .setup-resource-fields [role="combobox"] { margin-top: 7px; font-weight: 400; }
  .setup-resource-fields [role="combobox"] > div { min-height: 36px; box-sizing: border-box; background: var(--pane-bg, #fff); }

  .setup-selection strong { display: block; font-weight: 600; }
  .setup-selection small, .setup-suggestion-control > small { display: block; margin-top: 5px; color: var(--text-color); font-size: 12px; line-height: 1.6; overflow-wrap: anywhere; }
  .setup-suggestion-control .text, .setup-suggestion-control select { min-height: 36px; font-size: 13px; }
  .setup-suggestion-control select { width: 100%; }
  .setup-suggestion[data-disabled="true"] { opacity: .7; }
  .setup-resource { padding: 16px 0; }
  .setup-resource-fields { margin: 16px 0 0 28px; }
  .setup-resource-fields > label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 14px; }
  .setup-resource-fields .text, .setup-resource-fields .select { display: block; margin-top: 7px; min-height: 36px; }
  .setup-review dt small { display: block; margin-top: 5px; color: var(--text-color); font-size: 11px; }
  .setup-review-resource, .setup-next-steps { padding: 18px 20px; background: var(--pane-bg, #fff); border: 1px solid var(--hairline-color); border-radius: 6px; margin-top: 24px; font-size: 13px; line-height: 1.7; }
  .setup-review-resource { background: var(--pane-bg, #fff); }
  .setup-guide .setup-recipient-needed { color: var(--fg-warning, var(--warning-color, #946200)); font-weight: 500; }
  .setup-suggestion-control .setup-recommended-value { color: var(--text-color); }
  .setup-review-resource h4 { margin: 0 0 8px; font-size: 14px; }
  .setup-resource-names { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 12px; }
  .setup-resource-names > span { display: inline-flex; align-items: center; max-width: 100%; box-sizing: border-box; padding: 2px 9px; border: 1px solid var(--hairline-color); border-radius: 4px; background: var(--ui-control-bg-color); color: var(--text-color); font-size: 13px; font-weight: 500; line-height: 1.6; overflow-wrap: anywhere; }
  .setup-next-steps ul { margin: 10px 0 0; padding-inline-start: 20px; list-style: disc; }
  .setup-next-steps li { margin: 7px 0; padding-inline-start: 2px; }
  .setup-next-steps p, .setup-review-resource p { margin: 8px 0 0; }
  .setup-needs > legend { margin-bottom: 4px; }
  .setup-next-steps a { color: var(--link-color, #1769b1); }
  @media (max-width: 650px) { .setup-suggestion, .setup-suggestion:has(.setup-digest) { grid-template-columns: 1fr; gap: 12px; } .setup-suggestion-control { margin-left: 28px; } .setup-needs > div { grid-template-columns: 1fr; } }
  @media (max-width: 850px) { padding: 28px; .welcome-comparison-view { inset: 28px; } .welcome-hero { margin: -28px -28px 0; padding: 32px 28px; } }
  @media (max-width: 1000px) { .welcome-resources { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 600px) { .welcome-resources { grid-template-columns: 1fr; gap: 4px; } }
  @media (max-width: 480px) { padding: 22px; .welcome-comparison-view { inset: 22px; } .edition-footer { flex-direction: column; align-items: flex-start; } .setup-inputs, .setup-review > div { grid-template-columns: 1fr; gap: 8px; } .welcome-hero { margin: -22px -22px 0; padding: 28px 22px; }  }
  @media (prefers-reduced-motion: reduce) { transition: none; &::before, &::after { animation: none; } .welcome-wordmark-icon path, .setup-step { animation: none !important; } .welcome-home::after, .welcome-comparison-view::after { display: none; } .welcome-resource, .welcome-home, .welcome-comparison-view { transition: none !important; transform: none !important; filter: none !important; } }
`;
