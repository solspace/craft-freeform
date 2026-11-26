<?php

namespace Solspace\Freeform\Bundles\Mcp;

use craft\db\Query;
use craft\helpers\Db;
use craft\mcp\attributes\RequiresPermission;
use Mcp\Capability\Attribute\McpTool;
use Mcp\Capability\Attribute\Schema;
use Mcp\Exception\ToolCallException;
use Mcp\Schema\ToolAnnotations;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapItem;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMapping;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Activity\ActivityPolicy;
use Solspace\Freeform\Library\Activity\ActivityTable;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Integrations\DeliveryIntegrations;
use Solspace\Freeform\Records\Form\FormIntegrationRecord;
use Solspace\Freeform\Records\IntegrationRecord;

final class DeliveryTools
{
    #[McpTool(name: 'freeform.integrations.mappings', description: 'Inspect a form’s delivery integrations, effective enabled state, and field mappings. Returns no credentials, webhook URLs, custom mapping values, or submission answers.', annotations: new ToolAnnotations(readOnlyHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    #[RequiresPermission(Freeform::PERMISSION_INTEGRATIONS_ACCESS)]
    public function mappings(string $form, string $site): array
    {
        return Access::run(Freeform::PERMISSION_FORMS_ACCESS, static function () use ($form, $site): array {
            if (!PermissionHelper::checkPermission(Freeform::PERMISSION_INTEGRATIONS_ACCESS)) {
                throw new ToolCallException(Freeform::t('You do not have permission to view Freeform integrations.'));
            }
            Access::requireEditorOption('integrations.tab');
            $site = Access::site($site);
            $target = Access::form($form, $site);
            $instances = FormIntegrationRecord::find()->where(['formId' => $target->getId()])->indexBy('integrationId')->all();
            $integrations = [];
            foreach (IntegrationRecord::find()->orderBy(['id' => \SORT_ASC])->all() as $integration) {
                if (!DeliveryIntegrations::includes($integration->class)) {
                    continue;
                }
                $instance = $instances[$integration->id] ?? null;
                $defaults = (array) JsonHelper::decode($integration->metadata, true);
                $overrides = (array) JsonHelper::decode($instance?->metadata, true);
                $enabled = $instance ? (bool) $instance->enabled : (bool) ($defaults['enabledByDefault'] ?? false);
                $integrations[] = [
                    'handle' => $integration->handle,
                    'name' => $integration->name,
                    'type' => $integration->type,
                    'enabled' => (bool) $integration->enabled && $enabled,
                    'source' => $instance ? 'form' : 'siteDefault',
                    'mappings' => self::describeMappings($target, $integration->class, array_replace($defaults, $overrides)),
                ];
            }

            return ['form' => $form, 'site' => $site->handle, 'integrations' => $integrations];
        });
    }

    #[McpTool(name: 'freeform.delivery.diagnostics', description: 'Read recent email and integration activity for a manageable form across its sites. Returns sanitized event summaries and numeric status codes only. A transport handoff does not confirm delivery.', annotations: new ToolAnnotations(readOnlyHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    #[RequiresPermission(Freeform::PERMISSION_ACTIVITY_ACCESS)]
    public function diagnostics(
        string $form,
        string $site,
        #[Schema(minimum: 1, maximum: 90)]
        int $days = 14,
        #[Schema(minimum: 1, maximum: 50)]
        int $limit = 20,
    ): array {
        return Access::run(Freeform::PERMISSION_FORMS_ACCESS, static function () use ($form, $site, $days, $limit): array {
            if (!PermissionHelper::checkPermission(Freeform::PERMISSION_ACTIVITY_ACCESS)) {
                throw new ToolCallException(Freeform::t('You do not have permission to view the Freeform Activity Log.'));
            }
            if ($days < 1 || $days > 90 || $limit < 1 || $limit > 50) {
                throw new ToolCallException(Freeform::t('Choose 1–90 days and a limit of 1–50.'));
            }
            $target = Access::form($form, Access::site($site));
            Access::requireAllFormSites($target);
            $db = \Craft::$app->getDb();
            $settings = Freeform::getInstance()->getSettings();
            if (!$db->getTableSchema(ActivityTable::TABLE)) {
                throw new ToolCallException(Freeform::t('The Freeform Activity Log is unavailable.'));
            }

            $categories = ['email', 'integrations'];
            $eventTypes = array_filter(ActivityPolicy::EVENTS, static fn ($definition) => \in_array($definition[4], $categories, true));
            $cutoff = Db::prepareDateForDb(new \DateTimeImmutable("-{$days} days"));
            $records = (new Query())
                ->select(['event', 'category', 'level', 'dateCreated', 'resolvedAt', 'metadata'])
                ->from(ActivityTable::TABLE)
                ->where(['formId' => $target->getId(), 'event' => array_keys($eventTypes)])
                ->andWhere(['>=', 'dateCreated', $cutoff])
                ->orderBy(['id' => \SORT_DESC])
                ->limit($limit + 1)
                ->all()
            ;
            $events = [];
            foreach (\array_slice($records, 0, $limit) as $record) {
                $metadata = (array) JsonHelper::decode($record['metadata'], true);
                $details = [];
                foreach (['status', 'attempt', 'reason', 'integrationId'] as $key) {
                    if (\is_int($metadata[$key] ?? null)) {
                        $details[$key] = $metadata[$key];
                    }
                }
                $events[] = [
                    'event' => $record['event'],
                    'level' => $record['level'],
                    'recordedAtUtc' => $record['dateCreated'],
                    'resolved' => null !== $record['resolvedAt'],
                    'description' => Freeform::t($eventTypes[$record['event']][2]),
                    'details' => (object) $details,
                ];
            }

            return ['form' => $form, 'scope' => 'allFormSites', 'days' => $days, 'activityLoggingEnabled' => $settings->isActivityLoggingEnabled(), 'events' => $events, 'hasMore' => \count($records) > $limit];
        });
    }

    private static function describeMappings(Form $form, string $class, array $metadata): array
    {
        $result = [];
        foreach ((new \ReflectionClass($class))->getProperties() as $property) {
            $handle = $property->getName();
            $mapping = $metadata[$handle] ?? null;
            if (!$property->getAttributes(FieldMapping::class, \ReflectionAttribute::IS_INSTANCEOF) || !\is_array($mapping)) {
                continue;
            }
            foreach ($mapping as $destination => $item) {
                if (!\is_array($item) || !preg_match('/^[a-zA-Z0-9_.:-]{1,120}$/D', (string) $destination)) {
                    continue;
                }
                $type = $item['type'] ?? null;
                if (!\in_array($type, [FieldMapItem::TYPE_RELATION, FieldMapItem::TYPE_PRESET, FieldMapItem::TYPE_CUSTOM], true)) {
                    continue;
                }
                $reference = FieldMapItem::TYPE_RELATION === $type && \is_string($item['value'] ?? null)
                    ? new FieldMapItem($type, '', $item['value'])
                    : null;
                $field = $reference?->getField($form);
                $result[] = [
                    'mapping' => $handle,
                    'destination' => (string) $destination,
                    'type' => $type,
                    'formField' => $field?->getHandle(),
                    'component' => $field ? $reference->getComponent() : null,
                ];
            }
        }

        return $result;
    }
}
