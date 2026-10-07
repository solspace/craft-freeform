# Supabase Integration

Send Freeform submissions to an existing Supabase database table. This Pro integration appears under **Other** and creates one row per submission using the Supabase Data API. It supports per-form table selection, column mappings, conditional integration rules, and Freeform's existing integration queue settings.

## 1. Prepare Supabase

1. Create a table in your Supabase project with columns for the values you want to collect.
2. Enable the **Data API** and expose the table's schema (usually `public`). OpenAPI support must also be enabled for table and column discovery.
3. The `service_role` database role must have access to the schema and permission to insert into the table. Database-generated values may also require sequence privileges. Duplicate prevention needs access to the unique column used for conflict detection.
4. Keep **Row Level Security** enabled to protect access from browsers and other public clients. This integration uses a server-side secret key, which bypasses RLS; it does not require public insert policies.
5. Copy your project's HTTPS URL and a **secret API key** (`sb_secret_...`) from the Supabase dashboard. A legacy `service_role` key is also supported. Publishable keys and legacy `anon` keys are not supported.

Use schema, table, and column names containing only letters, numbers, and underscores, beginning with a letter or underscore. HTTPS custom domains and self-hosted project URLs are supported. URLs must not contain credentials, an API path, query parameters, or fragments.

For example, create a table in the Supabase SQL editor:

```sql
create table public.freeform_submissions (
    id bigint generated always as identity primary key,
    freeform_submission_uid uuid unique,
    name text not null,
    email text,
    message text,
    interests text[],
    answers jsonb,
    created_at timestamptz not null default now()
);

alter table public.freeform_submissions enable row level security;
grant usage on schema public to service_role;
grant select, insert on public.freeform_submissions to service_role;
grant usage, select on sequence public.freeform_submissions_id_seq to service_role;
```

## 2. Configure Freeform

1. Visit **Freeform → Integrations** and add **Supabase** under **Other**.
2. Set **Project URL**, **Secret API Key**, and **Database Schema**.
3. Save the integration, click **Authorize** if shown, and verify its connection status. Authorization uses the saved API key; no Supabase sign-in popup is required.

All three connection settings support environment variables. Store the secret in your site's `.env`, then reference it as `$SUPABASE_SECRET_KEY` in Freeform. The API key is encrypted when stored in Freeform's integration metadata, but an environment variable is recommended to keep the literal value out of project config. Credentials are not included in the form's frontend integration settings.

```dotenv
SUPABASE_PROJECT_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your-key
```

## 3. Configure Each Form

1. Open the form builder's **Integrations** tab and enable the Supabase integration.
2. Select the **Supabase Table**. The list includes API resources that support inserts in the configured schema.
3. Map Freeform fields to the columns you want to populate. You can also use the mapping's custom values for constants or Twig expressions such as `{{ submission.id }}`, `{{ submission.uid }}`, or `{{ form.handle }}`.
4. Leave generated IDs, generated columns, and columns with database defaults unmapped. OpenAPI metadata cannot reliably identify every generated column or expression default. Primary keys therefore appear optional; map them if your table requires a manually supplied key.
5. Optionally enter a **Submission UID Column** as described below.
6. Configure integration rules if needed, save the form, and submit it to verify the resulting row.

The mapping refresh button reloads the table's column definitions after schema changes. Table selection and cached fields are separate for each schema/table combination.

## Supported Values

- Text, UUIDs, and enums: scalar text values. Multiple selected values mapped to a text column become comma-separated text. Enum values must match the database choices.
- Integers: signed whole numbers, including zero. Large integer strings are preserved for PostgreSQL to validate.
- Numeric and decimal columns: numeric strings preserve their decimal precision. Use a dot as the decimal separator.
- Booleans: preserve `false` and `0`; Checkbox fields use their checked state.
- Date and timestamp columns: Date & Time fields are converted automatically. Custom values should use `YYYY-MM-DD` for dates and ISO 8601 for timestamps. Include a timezone offset when mapping to a timezone-aware column.
- PostgreSQL arrays: selected options remain a JSON array. A custom JSON array such as `["news", "events"]` is also supported. PostgreSQL validates the array's element types.
- JSON and JSONB: structured field values (including Table fields) stay structured. Custom text must contain valid JSON. Empty objects remain objects.

Empty text and null values are omitted so database defaults can apply. Explicit zero, false, and empty arrays are retained. PostgreSQL still enforces column types, required values, foreign keys, and constraints. File Upload fields do not copy files into Supabase Storage; store a suitable reference through a custom mapping if needed.

## Optional Duplicate Prevention

To make repeated deliveries of a saved submission safe:

1. Add a `text` or `uuid` column with a **UNIQUE** constraint, such as `freeform_submission_uid` in the example table.
2. Enter that column name in **Submission UID Column**.
3. Keep Freeform submission storage enabled.

Freeform fills this column with the saved submission UID. Supabase ignores a repeated insert for the same UID without updating the existing row. This setting overrides any regular mapping for that column. Without it, each delivery inserts a new row. Separate submissions from the same visitor still create separate rows.

This does not add automatic retries or a historical backfill. Delivery uses Freeform's existing integration processing, logging, spam/consent checks, and optional queue behavior. When an HTTP request fails, Freeform logs the status without retaining the authenticated request or secret key. An HTTP timeout may happen after an insert has committed; the unique UID column allows a deliberate repeat delivery without creating a duplicate.

## Troubleshooting

- **No tables:** check the exposed schema, Data API/OpenAPI settings, and `service_role` table grants. Read-only views are omitted.
- **HTTP 401/403:** check the project URL, server key, schema grants, table grants, and sequence privileges.
- **HTTP 400/409:** check mapped column types, required values, foreign keys, and unique constraints. Duplicate prevention requires a matching UNIQUE constraint on its column.
- **Fields changed:** reload the form for table-list changes and use the mapping refresh button for column changes. Supabase may also need its PostgREST schema cache refreshed.
- **No row yet:** check integration rules, consent/spam handling, Freeform's integration logs, and the Craft queue if integration queuing is enabled.

This integration sends new submissions to Supabase. Editing or deleting a Freeform submission does not synchronize changes back to Supabase. Supabase Auth, Storage uploads, Edge Function invocation, and two-way synchronization are separate workflows.

[Supabase Data API](https://supabase.com/docs/guides/api) · [API keys](https://supabase.com/docs/guides/getting-started/api-keys) · [Custom schemas](https://supabase.com/docs/guides/api/using-custom-schemas)
