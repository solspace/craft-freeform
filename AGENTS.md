# Repository instructions

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
