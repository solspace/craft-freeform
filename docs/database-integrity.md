# Checking and repairing Freeform foreign keys

Freeform uses database foreign keys to remove related records when submissions,
forms, and other parent records are deleted. Previously, uninstalling another
Craft plugin while Freeform was enabled could remove Freeform's foreign keys.
The uninstall handler now removes these keys only when Freeform itself is being
uninstalled.

The repair utility is opt-in. Updating Freeform does not run a repair migration
or remove existing data.

## Inspect the database

The Diagnostics page includes a read-only **Database Foreign Keys** check. It
compares the expected relationships with database metadata, including per-form
submission tables. Missing or conflicting keys and missing tables/columns are
reported with instructions to run the console utility. If inspection fails,
Diagnostics reports that it could not complete the check rather than showing a
passing status.

**Database Structure** also checks required tables, columns, primary keys,
indexes, unique constraints, and the presence of each form's submission table.
Index checks compare columns and uniqueness rather than generated names; a wider
index can cover a required non-unique index when its leading columns match.
These checks inspect metadata and form IDs, not submission rows. They do not
repair tables, columns, or indexes; ask your developer to investigate missing
schema objects and pending migrations. A recreated table cannot recover lost data.

Opening Diagnostics does not scan submission rows or change the database.
A passing foreign-key check confirms the expected schema relationships are
present; it does not confirm that there are no orphaned rows. Row-level checks
remain available through the console utility below.

Click **Scan for orphaned submissions** at the bottom of Diagnostics to run a
read-only scan in batches of up to 1,000 records. Progress shows the number
checked and the number affected. Each submission is counted once when its Craft
element or form is missing. Soft-deleted elements whose rows still exist are not
orphans. The scan includes spam and trashed submission records and excludes
submissions created after it starts. Results reflect data at the time each batch
is checked; run during a quiet period for a stable result.

This scan does not inspect every child table or all possible orphaned data. Use
the console utility for the full foreign-key relationship check. A failed scan
reports partial results and can be restarted. The result links to the planned
documentation page at `/craft/freeform/v5/guides/database-integrity/`, which must
be published before release using this guide's contents.

Click **Scan related data and duplicates** for a broader, opt-in scan. It checks
the relationships declared by Freeform, including physical per-form content,
payment, integration, and other related records. Rows referring to retained
submissions whose Craft element or form is missing are also counted. Orphans are
counted once per table even if multiple parents are missing. Counts across tables
represent records, not distinct submissions or people.

Duplicate checks run only where an expected unique constraint or primary key is
missing. They report all rows in duplicate groups, per constraint; a row can be
counted for more than one missing constraint. Nullable unique values are exempt.
Duplicate checks group the whole table and may take longer on large databases.
Orphan checks run in batches of up to 1,000 records. Missing tables, columns, or
usable primary keys are reported as checks that could not be completed. Progress
is retained in a user-scoped cache for one hour. Neither scan changes Freeform
data or schema, and incomplete scans do not report an all-clear result.

Run this from the Craft project directory:

```sh
php craft freeform/database/repair-foreign-keys --dry-run=1
```

Running the command without options also performs a dry run. It checks the
relationships declared by Freeform's install schema, including rules, and the
foreign keys on physical per-form submission tables. It reports missing keys,
conflicting existing keys, missing tables/columns, and orphaned rows. Nullable
references are excluded from orphan counts. Counts are per relationship, so a
row can appear in more than one count.

The command only checks relationships for which Freeform defines a foreign key.
It is not a general audit of every JSON reference, asset, or external integration.
On large databases the row checks may take some time; run them outside peak traffic.

## Restore missing keys

For a broader read-only CLI report covering schema objects, all declared foreign
key relationships, related retained data, and unprotected duplicates, run:

```sh
php craft freeform/database/check-integrity
```

This command is always read-only, even if `--apply=1` is supplied. It may take
time on large sites. Missing tables, columns, or indexes are reported for developer
review; the separate repair command below restores only unblocked foreign keys.

Review the output and take a database backup. Run the repair while site writes,
queue workers, and scheduled purges are paused:

```sh
php craft freeform/database/repair-foreign-keys --apply=1
```

This adds missing keys whose referenced tables/columns exist and whose data
contains no orphaned rows. It rechecks each relationship before adding the key.
Existing matching keys are preserved regardless of their names. Conflicting keys
are reported for manual review and are never dropped or replaced. Supplying
`--dry-run=1` together with `--apply=1` still performs a dry run.

The six keys on integration, submit-form, and button rule tables were created
with different update actions by fresh installs and upgrade migrations. Both
`ON UPDATE CASCADE` and the historically omitted action (`NO ACTION`/`RESTRICT`)
are recognized for those exact relationships, while `ON DELETE CASCADE` remains
required. These historical variants do not need replacement. Genuine conflicts
show the existing target and delete/update actions for review.

If any keys cannot be restored, the command continues checking the remaining
relationships and reports those that remain unresolved. It can be run again;
already restored keys are recognized and left intact.

## Orphaned rows

An orphaned row has a non-null reference to a parent record that no longer exists.
For example, a hard-deleted Craft element may have left a row in
`freeform_submissions`, together with field values in a per-form content table.
These rows may no longer appear in the control panel or normal submission queries.

The utility reports table names, reference columns, and counts, without printing
submission field values. It does not delete or update any customer data. Ask your
developer or Solspace Support to review blocked relationships and resolve the
orphaned data before running the repair again. Restoring keys alone does not
remove previously retained data. Review dependent rows too; their immediate
Freeform parent may still exist even when its Craft element has already gone.

Missing tables or columns should be investigated and any pending Freeform
migrations completed before retrying. A foreign key with different delete/update
behavior should be reviewed manually rather than replaced blindly.

## Exit codes

- `0`: all inspected relationships were valid or successfully restored.
- `1`: missing keys, blocked/conflicting relationships, or inspection/repair errors remain.

There is no automatic repair migration.
