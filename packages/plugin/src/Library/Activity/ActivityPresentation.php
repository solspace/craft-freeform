<?php

namespace Solspace\Freeform\Library\Activity;

use Solspace\Freeform\Freeform;

/** One presentation contract for persisted Activity and illustrative settings examples. */
class ActivityPresentation
{
    public static function present(array $row, array $forms = [], array $integrations = [], array $notifications = []): array
    {
        $definition = ActivityPolicy::EVENTS[$row['event']] ?? ActivityPolicy::EVENTS['error'];
        $decoded = \is_array($row['metadata'] ?? null) ? $row['metadata'] : json_decode($row['metadata'] ?? '{}', true);
        $metadata = ActivityPolicy::metadata(\is_array($decoded) ? $decoded : []);
        $reason = $metadata['reasonCode'] ?? ('integration-error' === $row['event'] ? ActivityContext::httpReason($metadata['httpStatus'] ?? 0) : null);
        $diagnostic = ActivityContext::REASONS[$reason] ?? null;
        $row['title'] = Freeform::t($diagnostic[0] ?? $definition[1]);
        $row['description'] = Freeform::t($diagnostic[1] ?? $definition[2]);
        $row['metadata'] = $metadata;
        $row['dateCreated'] = $row['dateCreated'] instanceof \DateTimeInterface ? $row['dateCreated'] : new \DateTimeImmutable($row['dateCreated'], new \DateTimeZone('UTC'));
        $row['recordedAt'] = $row['dateCreated']->format(\DATE_ATOM);
        $row['level'] = $definition[3];
        $row['category'] = $definition[4];
        $row['context'] = [];
        $row['changes'] = [];
        $row['previewFacts'] = [];
        if (!empty($row['formId'])) {
            $id = (int) $row['formId'];
            $row['previewFacts'][] = ($forms[$id] ?? Freeform::t('Form')).' #'.$id;
        }
        if (!empty($row['submissionId'])) {
            $row['previewFacts'][] = Freeform::t('Submission').' #'.$row['submissionId'];
        }
        if ($diagnostic) {
            $row['context'][Freeform::t('Operation')] = Freeform::t($diagnostic[2]);
        }
        if (isset($metadata['integrationId'])) {
            $id = $metadata['integrationId'];
            $name = $integrations[$id] ?? null;
            $row['context'][Freeform::t('Integration')] = ($name ?: Freeform::t('Integration')).' #'.$id;
            if ($name) {
                $row['title'] = $name.' · '.$row['title'];
            }
        }
        if (isset($metadata['notificationId'])) {
            $id = $metadata['notificationId'];
            $row['context'][Freeform::t('Notification')] = ($notifications[$id] ?? Freeform::t('Notification')).' #'.$id;
        }
        if ('spam' === $row['event'] && isset($metadata['spamChecks'])) {
            $labels = array_map([Freeform::class, 't'], SpamChecks::labels($metadata['spamChecks']));
            if ($labels) {
                $row['context'][Freeform::t('Flagged by')] = implode(', ', $labels);
            }
        }
        foreach (['httpStatus' => 'HTTP status', 'attempt' => 'Attempt', 'errorCount' => 'Error count', 'siteId' => 'Site ID'] as $key => $label) {
            if (isset($metadata[$key])) {
                $row['context'][Freeform::t($label)] = $metadata[$key];
            }
        }
        foreach (['durationMs' => 'Processing time', 'elapsedMs' => 'Elapsed to response'] as $key => $label) {
            if (isset($metadata[$key])) {
                $row['context'][Freeform::t($label)] = $metadata[$key].' ms';
            }
        }
        foreach ($row['context'] as $label => $value) {
            $row['previewFacts'][] = $label.': '.$value;
        }
        if ('form-change' === $row['event']) {
            foreach (ActivityPolicy::FORM_CHANGE_LABELS as $key => $label) {
                if (isset($metadata[$key])) {
                    $value = 'formSettingsChanged' === $key ? Freeform::t('Yes') : $metadata[$key];
                    $row['changes'][Freeform::t($label)] = $value;
                    $row['previewFacts'][] = Freeform::t($label).': '.$value;
                }
            }
        }

        return $row;
    }
}
