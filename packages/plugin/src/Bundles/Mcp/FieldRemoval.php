<?php

namespace Solspace\Freeform\Bundles\Mcp;

use craft\db\Query;
use craft\helpers\UrlHelper;
use Mcp\Exception\ToolCallException;
use Solspace\Freeform\Bundles\Form\Limiting\DuplicateCheckScope;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\FormWizard\PresetCatalog;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormRowRecord;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Records\Rules\FieldRuleRecord;
use Solspace\Freeform\Records\Rules\RuleConditionRecord;

final class FieldRemoval
{
    private const TTL = 600;
    private const CACHE_PREFIX = 'freeform.mcp.field-removal.';

    public static function request(string $form, string $site, string $field): array
    {
        return self::withTarget($form, $site, static function (Form $target) use ($form, $site, $field): array {
            [$impact, $revision] = self::inspect($target, $field);
            $token = bin2hex(random_bytes(32));
            $userId = \Craft::$app->getUser()->getId();
            $confirmationRequired = SecurityPolicy::requiresDestructiveConfirmation();
            $review = compact('form', 'site', 'field', 'revision', 'userId', 'confirmationRequired');
            if (!\Craft::$app->getCache()->set(self::CACHE_PREFIX.$token, $review, self::TTL)) {
                throw new ToolCallException('Could not create the private Craft review link.');
            }

            $preview = $impact + [
                'status' => $confirmationRequired ? 'confirmation_required' : 'ready_for_removal',
                'confirmationRequired' => $confirmationRequired,
                'reviewUrl' => UrlHelper::cpUrl('freeform/forms/mcp-field-removal', ['review' => $token]),
                'reviewLabel' => $confirmationRequired ? '⚠️ Approval required in Craft' : 'Review in Craft',
                'expiresInSeconds' => self::TTL,
                'instructions' => $confirmationRequired
                    ? 'Explain the consequences, then show the reviewUrl as a clickable link labeled “⚠️ Approval required in Craft”. The field is still present.'
                    : 'Report the consequences. If the user requested removal, use freeform.fields.remove with the reviewId. The field is still present.',
            ];
            if (!$confirmationRequired) {
                $preview['reviewId'] = $token;
            }

            return $preview;
        });
    }

    public static function review(string $token, bool $confirm = false): array
    {
        return self::processReview($token, $confirm);
    }

    public static function removeViaMcp(string $token): array
    {
        return ['status' => 'removed'] + self::processReview($token, confirm: true, viaMcp: true);
    }

    private static function processReview(string $token, bool $confirm, bool $viaMcp = false): array
    {
        $cache = \Craft::$app->getCache();
        $key = self::CACHE_PREFIX.$token;
        $review = preg_match('/^[a-f0-9]{64}$/D', $token) ? $cache->get($key) : false;
        if (!$review || $review['userId'] !== \Craft::$app->getUser()->getId()) {
            throw new ToolCallException('This review link is unavailable. Request a new link from the same Craft account.');
        }

        return self::withTarget($review['form'], $review['site'], static function (Form $form) use ($cache, $key, $review, $confirm, $viaMcp): array {
            [$impact, $revision, $record, $formRecord] = self::inspect($form, $review['field']);
            if ($cache->get($key) !== $review || $review['revision'] !== $revision) {
                throw new ToolCallException('The review expired or the form changed. Request a new review before removing this field.');
            }

            if ($confirm) {
                if ($viaMcp && (($review['confirmationRequired'] ?? true) || SecurityPolicy::requiresDestructiveConfirmation())) {
                    throw new ToolCallException('This installation requires confirmation in Craft. Open the reviewUrl from freeform.fields.request-removal.');
                }
                if (!$cache->delete($key)) {
                    throw new ToolCallException('The review expired. Request a new review before removing this field.');
                }
                self::remove($form, $record, $formRecord, $impact['hasStorage']);
            }

            return $impact + ['formId' => $form->getId()];
        });
    }

    private static function withTarget(string $form, string $site, callable $operation): array
    {
        return Access::run(Freeform::PERMISSION_FORMS_ACCESS, static function () use ($form, $site, $operation): array {
            $site = Access::site($site);
            $id = Access::form($form, $site)->getId();

            return Access::withLayoutLock($id, static function () use ($id, $form, $site, $operation): array {
                $target = Access::form($form, $site);
                if ($id !== $target->getId()) {
                    throw new ToolCallException('The form changed. Request a new review.');
                }
                Access::requireAllFormSites($target);
                Access::requireEditorOption('layout.fields');

                return $operation($target);
            });
        });
    }

    private static function inspect(Form $form, string $handle): array
    {
        $field = $form->getLayout()->getFields()->get($handle);
        if (!$field || $field->getParentField() || !\in_array($field::class, PresetCatalog::TYPES, true)) {
            throw new ToolCallException('Choose a standard field on this form. Use the builder for other field types and nested fields.');
        }
        Access::requireEditorOption('layout.fieldTypes', $field::class);

        $record = FormFieldRecord::findOne(['formId' => $form->getId(), 'uid' => $field->getUid()]);
        $formRecord = FormRecord::findOne($form->getId());
        if (!$record || !$formRecord) {
            throw new ToolCallException('The field or form is no longer available.');
        }

        if (FieldRuleRecord::find()->where(['fieldId' => $record->id])->exists()
            || RuleConditionRecord::find()->where(['fieldId' => $record->id])->exists()) {
            throw new ToolCallException('This field is used by conditional rules. Review those rules in the builder before requesting removal.');
        }
        if (DuplicateCheckScope::isEnabled($form) && DuplicateCheckScope::getField($form)?->getId() === $field->getId()) {
            throw new ToolCallException('This field is used to check for duplicate submissions. Update that setting before requesting removal.');
        }

        $hasStorage = !$field instanceof NoStorageInterface;
        $values = null;
        if ($hasStorage) {
            $db = \Craft::$app->getDb();
            $table = Submission::getContentTableName($form);
            $column = Submission::getFieldColumnName($field);
            if (!$db->getTableSchema($table, true)?->getColumn($column)) {
                throw new ToolCallException('The field’s submission storage could not be verified. Review it in the builder.');
            }
            if (PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS)
                && \in_array($form->getId(), array_map('intval', Freeform::getInstance()->forms->getAllowedReadFormIds()), true)) {
                $values = (int) (new Query())
                    ->from($table)
                    ->where(['<>', $column, ''])
                    ->count('*', $db)
                ;
            }
        }

        $impact = [
            'form' => $form->getName(),
            'field' => $field->getHandle(),
            'label' => $field->getLabel(),
            'hasStorage' => $hasStorage,
            'submissionRowsWithStoredContent' => $values,
            'consequences' => [
                'The field will be removed from every site using this form.',
                'Existing values will disappear from submission views and exports. Freeform retains the underlying database column.',
                'Review templates, notifications and integrations that refer to this field before approving.',
            ],
        ];
        $revision = hash('sha256', serialize([$formRecord->getAttributes(), $record->getAttributes(), $impact]));

        return [$impact, $revision, $record, $formRecord];
    }

    private static function remove(Form $form, FormFieldRecord $field, FormRecord $record, bool $hasStorage): void
    {
        \Craft::$app->getDb()->transaction(static function () use ($form, $field, $record, $hasStorage): void {
            if ($hasStorage) {
                $metadata = (array) JsonHelper::decode($record->metadata);
                $metadata[FormRecord::RETAINED_FIELD_IDS][] = (int) $field->id;
                $record->metadata = $metadata;
                if (!$record->save(false, ['metadata'])) {
                    throw new ToolCallException('Could not retain the field’s submission storage.');
                }
            }
            if (1 !== $field->delete()) {
                throw new ToolCallException('The field could not be removed.');
            }
            if (!FormFieldRecord::find()->where(['rowId' => $field->rowId])->exists()) {
                FormRowRecord::deleteAll(['id' => $field->rowId, 'formId' => $form->getId()]);
            }
            Access::recordChange($form);
        });
        Access::afterSave($form);
    }
}
