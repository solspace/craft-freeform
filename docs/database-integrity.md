# Checking and repairing Freeform foreign keys

Freeform uses database foreign keys to remove related records when submissions,
forms, and other parent records are deleted. Previously, uninstalling another
Craft plugin while Freeform was enabled could remove Freeform's foreign keys.
The uninstall handler now removes these keys only when Freeform itself is being
uninstalled.

The repair utility is opt-in. Updating Freeform does not run a repair migration
or remove existing data.

## Inspect the database

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

There is no automatic repair migration and no Diagnostics page change in this patch.
