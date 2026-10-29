# Saved-form cleanup events

`SaveForm::EVENT_AFTER_PURGE_SAVED_FORMS` fires after Save & Continue Later
records are removed by TTL or session-limit cleanup. It also covers session-limit
cleanup for headless drafts. This event cannot cancel deletion.

Register the listener during your module/plugin's `init()`, before Craft finishes
initializing. TTL cleanup runs after Craft initialization, subject to Freeform's
existing one-hour cleanup lock. It is request-driven, not an exact expiration timer.
The configured TTL (or Freeform's default when the setting is non-positive) still
uses each record's `dateUpdated` timestamp.

```php
use Solspace\Freeform\Bundles\Form\SaveForm\Events\SavedFormsPurgedEvent;
use Solspace\Freeform\Bundles\Form\SaveForm\SaveForm;
use yii\base\Event;

Event::on(
    SaveForm::class,
    SaveForm::EVENT_AFTER_PURGE_SAVED_FORMS,
    function (SavedFormsPurgedEvent $event): void {
        foreach ($event->records as $record) {
            // Queue your reconciliation job using:
            // $record['id'], $record['token'], $record['formId'], $event->reason
        }
    }
);
```

The `SavedFormsPurgedEvent` payload contains:

| Property | Value |
| --- | --- |
| `records` | Up to 100 deleted records, each with integer `id`, string `token`, and integer `formId`. |
| `reason` | `REASON_TTL_EXPIRED` (`ttl_expired`) or `REASON_SESSION_LIMIT` (`session_limit`). |
| `cutoff` | UTC TTL cutoff in `Y-m-d H:i:s` format; `null` for session-limit cleanup. |
| `ttlDays` | Effective TTL in days; `null` for session-limit cleanup. |

Encrypted form payloads, session IDs, and decryption keys are not included.
Empty cleanup runs and failed deletions emit no event. Large purges emit one event
per successful batch. Completion of a resumed form, form deletion, and unrelated
database maintenance do not emit this cleanup-specific event.

With listeners registered, each batch reads and deletes its records in a short
transaction with row locks on MySQL/PostgreSQL. The event runs after that batch's
transaction finishes. If custom code wraps cleanup in an outer transaction, the
event still runs inside that outer transaction; defer external side effects until
the outer transaction commits.

Listeners should queue work quickly and make reconciliation idempotent. Listener
exceptions are logged through Yii without interrupting the request or remaining
cleanup batches. A throwing listener may prevent later listeners receiving the
same batch. Events are in-process notifications with no automatic retry or
guaranteed external delivery; use your own queue/reconciliation strategy for that.
Without listeners, cleanup retains the bulk-delete path.
