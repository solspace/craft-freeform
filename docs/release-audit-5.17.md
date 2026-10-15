# Freeform 5.17 release audit

Audit date: October 15, 2026. Release branch: `feature/v5.17`, starting at `8c04a5aea`. Upgrade baseline: tag `v5.16.6` (`21dd3871a`). Findings below include the fixes on `audit/v5.17-release`.

## Release assessment

The automated checks listed below pass after fixing PHP compatibility problems, a Craft 4 diagnostics discrepancy, and unnecessary React work. This is a code audit and targeted executable validation, not an exhaustive end-to-end certification. The full regression matrix, native PHP 8.5 execution, and live Craft control-panel/submission testing remain outstanding.

## Upgrade migrations

**One new migration** is required when upgrading an up-to-date 5.16.6 installation to 5.17. The same single new migration is present relative to tag 5.16.0. Sites upgrading from older releases may also have earlier pending migrations.

| Migration | Database changes | Data conversion |
| --- | --- | --- |
| `m261014_180000_AddDuplicateCheckIdentityToSubmissions` | Adds nullable `duplicateCheckIdentity VARCHAR(64)` to `freeform_submissions` and a non-unique index on `(formId, duplicateCheckIdentity)` | No backfill; existing submissions retain `NULL` |

The column stores a hashed visitor identifier for scoped duplicate checks. `schemaVersion` is bumped from `5.16.0` to `5.17.0`. Craft runs the migration through its normal update process. Both upgrade and rollback guard against missing/existing columns and indexes. Index names differ between the install and upgrade paths; the indexed columns and uniqueness are equivalent and Craft discovers them by definition.

Creating an index still requires database work proportional to the submissions table; no large-site upgrade duration was measured.

## Fresh-install schema and PostgreSQL

`Install.php` includes the new nullable column and the same composite index. The other 5.17 settings use existing metadata/configuration storage; they do not require additional global schema migrations. Per-form content columns continue to be created by the existing content-table machinery.

Using both Craft 4.18.9 and Craft 5.11.5.1 database classes, executable PostgreSQL checks passed for:

- Fresh installation of all **50 Freeform tables**, including **67 foreign-key creation operations**, with no reported FK failures.
- Presence of every table, column, and index declared by the install schema.
- Running the new migration against an already-current schema.
- Rolling back the new column/index, reapplying the migration, and running it again without duplicate schema errors.
- All **29 scoped duplicate-check tests**, with **79 assertions**, against PostgreSQL for each Craft dependency set. These exercise actual SQL for cookies, users, email, numeric scopes, encrypted values, spam, and deleted submissions.

The PostgreSQL engine was **PostgreSQL 18.6 through PGlite 0.5.10**, accessed by PHP PDO_PGSQL through a local test transport. This executes PostgreSQL SQL, schema introspection, and constraints; it is not a native managed/server PostgreSQL deployment and does not prove production locking, permissions, pooling, or performance. Craft core FK targets were minimal fixture tables rather than a complete installed Craft site. MySQL was reviewed through the existing query-builder code and tests, without a new live MySQL server run.

New and changed database calls were reviewed for quoting, table prefixes, bound values, booleans, dates, and MySQL-only syntax. The upgrade uses Craft's database abstraction, and the scoped queries execute successfully against PostgreSQL. Quota boundaries are calculated in PHP and passed as UTC date parameters rather than database-specific date functions. Diagnostics discovery and form ordering use Yii query builders and transactions. This is not an execution test of every database path.

## PHP 8.0–8.5

Full regression tests used **PHP 8.3.6 and PHP 8.4.26**. All **1,898 production PHP files** pass native syntax checks on **PHP 8.0.30, 8.1.34, 8.2.34, and 8.4.26**, as well as the PHP 8.0-targeted parser check. Native feature smoke tests pass on those same four runtimes using the PHP 8.0-compatible Craft 4 dependencies: immutable profile access, translated scales/custom options, diagnostics constructor callbacks, phone-number validation, and FPDI autoloading. The repository's PHPCompatibility checks pass; an additional AST scan found no calls to the checked PHP 8.1–8.5-only functions and no implicit-nullable parameter declarations. The existing PHPCompatibility 9.x rules do not fully cover recent PHP versions, so their success alone is insufficient.

Concrete fixes:

1. Removed PHP 8.1-only `readonly` syntax from `HeadlessProfile`, retaining read access and rejecting property writes/unsets through PHP 8.0-compatible accessors. Two regression tests cover read access and immutability.
2. Replaced PHP 8.4-only `array_find()` calls in translated Opinion Scale and custom option processing with compatible loops. These calls were not reliably polyfilled by Craft 4's PHP 8.0-compatible dependency set.
3. Replaced PHP 8.1-only first-class callable syntax in three Diagnostics classes with PHP 8.0-compatible callables. Native PHP 8.0 lint caught these usages.
4. Guarded reflection `setAccessible()` calls so they only run on PHP 8.0, where they are needed. PHP documents the method as a no-op from 8.1 and deprecated in 8.5: <https://www.php.net/manual/en/reflectionproperty.setaccessible.php>.
5. Avoided reading a reflection property's default value when none exists, which PHP 8.5 deprecates.
6. Added the correct `mixed` iterator key return type and prevented passing a null Textarea value to `htmlentities()`.

Dependency resolution was checked with Composer platform PHP 8.0.2/Craft 4 and PHP 8.5.0/Craft 5. New FPDI and phone-number dependencies have compatible resolutions at both ends. **Native PHP 8.5 was not executed.** The PHP 8.0–8.2 runs were syntax and targeted feature checks rather than the complete PHPUnit suite. Craft 5 retains its own PHP 8.2+ requirement; PHP 8.0 coverage concerns Craft 4.

### Craft 4 Composer caveat

Default Composer resolution for the isolated PHP 8.0.2/Craft 4 fixture was blocked by existing upstream dependency security advisories, initially `enshrined/svg-sanitize ~0.22.0`. To inspect compatibility, the audit fixture alone was installed with Composer's security blocking disabled. That isolated resolution reported 34 advisories across eight packages. No project security policy was changed or workaround applied to the release repository. This is not a clean default Composer install result for Craft 4 and should be assessed separately before release; do not interpret the runtime test pass as resolving those upstream advisories.

## Craft 4 and Craft 5 regression results

| Dependency set | PHP tests | Assertions | Failures/errors | Skipped |
| --- | ---: | ---: | ---: | ---: |
| Craft 4.18.9, PHP 8.0.2-compatible production dependencies, running on PHP 8.3.6 | 1,178 | 8,132 | 0 | 5 |
| Craft 5.11.5.1, running on PHP 8.3.6 | 1,178 | 8,132 | 0 | 5 |
| Craft 4.18.9, same PHP 8.0-compatible dependency set, running on PHP 8.4.26 | 1,178 | 8,132 | 0 | 5 |
| Craft 5.11.5.1, running on PHP 8.4.26 | 1,178 | 8,132 | 0 | 5 |

The five skipped tests require `FREEFORM_HEADLESS_BASE_URL` and a running Craft site. PHPUnit also reports ten existing test-framework deprecations; no PHP runtime deprecations were reported in the PHP 8.3 suites. On PHP 8.4, the installed vendor sets emit 10 runtime deprecation notices with Craft 5 and 106 with the Craft 4/PHP 8.0-compatible set; the reported notice sources are vendor files rather than Freeform production files. These older dependency sets are therefore not deprecation-free on PHP 8.4. No dependencies were edited. Test counts include skipped tests.

The audit fixed a functional difference in Integration Readiness: Craft 4 preserves a missing `$ENVIRONMENT_VARIABLE` as literal text while Craft 5 resolves it to null. Exact variable references now resolve consistently before checking required credentials and OAuth tokens.

Controller tests now assert Craft's POST-request guard without assuming Craft 5's HTTP exception class on Craft 4. Logging tests exercise Monolog 2 arrays or Monolog 3 records according to the installed dependency version. Production POST protections and logging behavior are preserved.

Covered unit/regression areas include AI reference creation and queue recovery, preview sanitization, scheduling, quotas, duplicate scopes, new fields and options, diagnostics, ordering, and headless serialization. Full native slideout interaction, real AI provider calls, email delivery, queue workers, payment providers, and every template on installed Craft 4/5 sites were not exercised end to end.

## JavaScript and browser results

| Suite | Test files | Tests | Result |
| --- | ---: | ---: | --- |
| Forms/client app | 39 | 213 | Pass |
| Frontend/control-panel scripts | 14 | 75 | Pass |
| Headless core | 14 | 89 | Pass |
| Headless React | 12 | 37 | Pass |
| Headless Vue | 10 | 28 | Pass |
| Headless extensions | 1 | 2 | Pass |

Headless core was built before the React and Vue suites, since those adapters import its published `dist` entry point. Production client and core builds pass.

Targeted real-browser smoke checks passed in **Chromium 140**, **Firefox 153**, and **WebKit 26.5**. The harness used actual source components/handlers and checked responsive builder tabs/overflow navigation, rerender/resize behavior, searchable select keyboard selection, range output, password visibility, character counts, textarea growth, and reset behavior, with no page errors. These were standalone smoke tests, not the complete signed-in Craft control panel. Chromium covers the common engine used by Chrome and Edge; WebKit testing is useful Safari evidence but is not a physical macOS/iOS Safari run. Mobile devices, every modern browser version, and all formatting-template combinations remain unverified.

The client targets ES2020. Runtime APIs such as ResizeObserver, MutationObserver, queueMicrotask, and modern CSS still depend on the browser; a build target does not polyfill browser APIs.

## Forms app and builder performance

Three narrow improvements are included:

- Forms dashboard field-type/property-section prefetches now run in an effect and use the same infinite cache freshness as the corresponding query hooks. Unrelated renders no longer repeatedly request already-loaded configuration.
- Responsive navigation retains its ResizeObserver across unrelated renders. It remeasures for an active-tab/count change, actual element resizing, browser resizing, or font loading. A regression test reproduces **11 observer creations across the initial render plus ten unrelated rerenders before the fix, versus one after**, while preserving resize behavior.
- Undo/Redo counts retain their Redux state reference when the counts do not change, avoiding a redundant history-state update while edits coalesce. History snapshots retain immutable slice references; they do not deep-clone the form on each keystroke.

Using the same installed toolchain/dependencies for both builds:

| Production entry chunk | 5.16.6 | 5.17 after fixes | Change |
| --- | ---: | ---: | ---: |
| Minified JS | 3,572.80 kB | 3,664.63 kB | +2.57% |
| Gzipped JS | 1,085.16 kB | 1,116.07 kB | +2.85% |

These are comparable local rebuilds, not production network-transfer timings. The application still has a large entry bundle. Deferring heavy code/Rich Text editors and nonessential routes is a reasonable follow-up, but needs focused loading/error-state checks and was not introduced as a broad late-release refactor. Vite still reports its large-chunk warning.

No before/after timings from the user's site, endpoint profiles, representative large-form typing/dragging traces, or low-end-device measurements were collected. The fixes remove measured/reproducible redundant work, but no site-wide speedup percentage is claimed.

## Remaining release validation

1. Complete the full native regression matrix beyond the PHP 8.3/8.4 runs, especially native PHP 8.5, and check vendor deprecations with deployment-specific dependency resolutions. PHP 8.0–8.2 native syntax/feature checks already pass; they do not replace a full suite.
2. Resolve/assess the upstream Composer advisory block for supported Craft 4 installations.
3. Run an actual staging upgrade and fresh install on native MySQL/PostgreSQL, then exercise installed Craft 4/5 control panels and frontend submissions, including the five skipped HTTP tests.
4. Smoke-test real Safari/iOS and representative formatting templates, native slideouts, AI queue generation, and a large form on the user's site.

Existing CI workflows only target PRs to `v5` and configure PHP 8.2; PHPUnit 11.5 requires PHP 8.3. The current CI configuration therefore does not establish this release's requested PHP/Craft matrix. Updating that coverage is a follow-up rather than evidence already obtained here.
