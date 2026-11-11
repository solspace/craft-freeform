# Container field compatibility checks

Checked on November 11, 2026 using Craft 5.12.0.1, Neo 5.5.13, and Freeform's v5
checkout after commit `32fcc2d8d`. These checks use the existing Freeform Form
field, with no container-specific adapter or Freeform migration.

## Isolated QA setup

A separate **QA Freeform Containers** channel contains one test entry. It has a
Matrix field in block view, a Neo field, and a native Content Block field in pane
view. Each container's layout includes an independent QA Freeform Form field
configured to offer Contact sales and Newsletter signup. The same field is reused
in each layout.

Existing editor entries, drafts, and shared field restrictions were left intact.
The test fixtures were created through Craft's normal field, entry type, and
section services, so their schema is represented in the local site's Project
Config. This is QA fixture setup, not a plugin migration.

## Results

| Check | Matrix | Neo | Content Block |
| --- | --- | --- | --- |
| Field is available in the nested layout | Passed | Passed | Passed |
| Picker offers only the configured forms | Passed | Passed | Passed |
| Initial selection resolves after a fresh server read | Passed | Passed | Passed |
| Change selection, save parent, and reopen | Passed | Passed | Passed |
| Clear selection, save parent, and reopen | Passed | Passed | Passed |
| Restore original selection, save, and reopen | Passed | Passed | Passed |
| Render selected form from a frontend template | Passed | Passed | Passed |

The initial selection was Newsletter signup (form ID 5). Browser checks changed
all three selections to Contact sales (ID 3), saved and reopened the parent,
cleared and saved all three, and restored Newsletter signup. Fresh server reads
confirmed the restored IDs.

An admin-only frontend page rendered Newsletter signup once from each container
using separate render instances and field ID prefixes. All three forms rendered,
and the page had no duplicate IDs. No forms were submitted and no notifications
or external integrations were triggered.

The existing formatting template emits a group-level `for` attribute for the
checkbox group heading without a corresponding control ID. Individual checkbox
labels resolve to their controls. This observation was not changed as part of the
container compatibility work.

## Scope

The browser checks cover the default authoring flow for the three modes above.
They do not establish coverage for every Matrix view mode, multisite propagation,
GraphQL, every Neo hierarchy, archived forms, or end-to-end form submission. Craft
4 was not re-tested during this Craft 5 QA pass.

No new Content Integrations settings rows are required. These are standard field
containers, and their existing field-layout configuration controls availability.
