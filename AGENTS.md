# Repository instructions

## Freeform release branches and QA sites

- Use `feat/v5.18` for feature planning and implementation requests explicitly targeting Freeform 5.18. Work on that branch, or base a dedicated feature branch on it and target it for pull requests, unless the user specifies otherwise.
- Use `feat/v5.19` for the page builder: Page forms, Content/Layout/Components pickers, Component Design, Builder Templates, and inserting Form Starters. These features are intentionally excluded from `feat/v5.18`.
- When starting Freeform 5.19 work, remind Kelsey to confirm whether to end Craft 4 support. This is a proposed 5.19 decision; preserve Craft 4 support for 5.18 and do not drop it without confirmation.
- Use `craft5.test` for Freeform 5.18 database changes and workflow checks, and `craft5install.test` for 5.19/page-builder checks.
- Reserve `craft5upgrade.test` for released 5.17 fixes. It uses the released Composer package, not a development checkout.
- Maintain only two temporary development checkouts during the 5.18 release split. After 5.18 ships, prefer the released package on `craft5.test` and keep the 5.19 checkout for ongoing work.

## Freeform 6 control panel design

- While Craft 6 is in prerelease development, prefer incremental compatibility and shared-control improvements. Defer broad screen redesigns or adapter removal until the upcoming native UI changes settle.

- For Freeform 6, match Craft 6's native UI and styles wherever possible. Prefer native Craft components and established control panel patterns for controls, navigation, dialogs, panels, tables, and actions.
- Use Craft 6 semantic CSS tokens for colors, surfaces, borders, shadows, spacing, typography, and control sizing. Let Craft own the active color scheme so the UI can follow native dark mode.
- Keep custom CSS focused on Freeform-specific behavior and layouts. Avoid duplicating native component styling, hardcoded light palettes, and selectors tied to the Craft 5 Dark Mode plugin.
- During UI QA, compare affected screens with equivalent native Craft 6 screens. Check icon/text centering, adjacent control heights, spacing, focus and disabled states, and responsive layouts. Verify native dark mode when it is available; report when it cannot yet be checked.

## Commit messages

- Always use Conventional Commit prefixes, such as `fix:`, `feat:`, `chore:`, `docs:`, `refactor:`, or `test:`. Choose the prefix that describes the change.

## Generated client assets

- After changing client source, run `pnpm --filter @ff/client build` before committing or pushing. This repository tracks the built JavaScript and manifest in `packages/plugin/src/Resources/js/client`; include the regenerated assets in the commit so normal Craft installs receive the change.
- Verify that the build succeeds and the generated manifest references existing assets. Use an available supported Node.js/pnpm runtime if the default runtime does not meet the repository requirements.

## Visual quality

- For every style change or feature involving UI styling, visually double-check the vertical alignment of icons and text before marking the work complete. Check icon centering within controls and ensure adjacent controls have matching heights where appropriate.

## Form builder regression checks

- Run `pnpm test:builder-state` before completing any form builder change, including styling changes, shared controls, queries, Redux state, persistence, rules, notifications, integrations, or builder API responses. Also run tests specific to the affected behavior.
- Run `pnpm test:builder-state` and the full client suite (`pnpm --filter @ff/client test --run`) whenever the user asks for a pre-release review or final runthrough, even when the latest changes are outside the builder.
- For pre-release reviews, and changes affecting builder values, loading, saving, or navigation, also test the affected workflow in a running local Craft site:
  1. Record the original values on a QA form. Change and save at least one field setting and one form setting; include a cleared value or disabled toggle when relevant.
  2. Leave via the Forms overview and reopen through its controls without reloading the browser. Verify the saved values.
  3. Visit another form, then return using browser Back/Forward. Verify the correct form and its saved values; settings must not leak between forms.
  4. Make an unsaved edit, switch builder tabs, and switch browser focus. Verify the edit is preserved. Exercise Undo/Redo and slideout Cancel when those features are affected.
  5. Reload to verify saved values from the server. Restore the QA form's original values, save, and verify the restoration after reloading.
- Keep automated coverage for failed saves, failed or delayed reloads, interrupted requests, and focus/reconnect events. Extend the existing regression tests when changing these behaviors; do not replace them with assertions of implementation details.
- Distinguish automated checks from browser checks in the result. If a local site, login, runtime, or test prerequisite is unavailable, report the specific gap instead of claiming that workflow passed. Use an available supported runtime or direct test executable when the local package-manager version prevents the normal command from running.

The focused command covers builder startup/cache hydration, Undo/Redo, and editor Cancel/rollback. These tests are also included in the existing full client CI suite.
