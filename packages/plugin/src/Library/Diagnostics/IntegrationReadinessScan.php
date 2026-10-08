<?php

namespace Solspace\Freeform\Library\Diagnostics;

use craft\db\Connection;
use craft\db\Query;
use craft\helpers\App;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input\Boolean;
use Solspace\Freeform\Attributes\Property\Input\BooleanEnv;
use Solspace\Freeform\Attributes\Property\Input\Field;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMapping;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Library\Helpers\StringHelper;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;

/** Reads saved settings; never instantiates integrations, builds clients, or renders Twig. */
class IntegrationReadinessScan
{
    private \Closure $decrypt;

    public function __construct(private Connection $db, ?\Closure $decrypt = null)
    {
        $this->decrypt = $decrypt ?? static function (string $value): false|string {
            $decoded = base64_decode($value, true);

            return false === $decoded ? false : \Craft::$app->getSecurity()->decryptByKey($decoded, \Craft::$app->getConfig()->getGeneral()->securityKey);
        };
    }

    public function getTasks(): array
    {
        // Keep credentials out of cached scan tasks/results.
        $tasks = (new Query())->select(['id'])->from('{{%freeform_integrations}}')->where(['enabled' => true])->orderBy(['id' => \SORT_ASC])->all($this->db);
        foreach ($tasks as &$task) {
            $task['scope'] = 'global';
        }
        unset($task);
        $instances = (new Query())->select(['instance.id'])->from('{{%freeform_forms_integrations}} instance')
            ->innerJoin('{{%freeform_forms}} form', '[[form.id]] = [[instance.formId]]')
            ->leftJoin('{{%freeform_integrations}} integration', '[[integration.id]] = [[instance.integrationId]]')
            ->where(['instance.enabled' => true, 'form.dateArchived' => null])
            ->andWhere(['or', ['integration.enabled' => true], ['integration.id' => null]])
            ->orderBy(['instance.id' => \SORT_ASC])->all($this->db)
        ;
        foreach ($instances as $instance) {
            $tasks[] = $instance + ['scope' => 'form'];
        }

        return $tasks;
    }

    public function scanTask(array $task, int $cursor = 0, ?int $maxId = null, int $offset = 0): array
    {
        $result = ['cursor' => 0, 'maxId' => null, 'offset' => 0, 'scanned' => 0, 'complete' => true, 'results' => []];
        $instance = null;
        $context = ['integration' => (int) $task['id']];

        try {
            if ('form' === $task['scope']) {
                $instance = (new Query())->select(['instance.*', 'form.name AS formName'])->from('{{%freeform_forms_integrations}} instance')
                    ->innerJoin('{{%freeform_forms}} form', '[[form.id]] = [[instance.formId]]')
                    ->where(['instance.id' => $task['id'], 'instance.enabled' => true, 'form.dateArchived' => null])->one($this->db)
                ;
                if (!$instance) {
                    return $result;
                }
                $context = ['formId' => (int) $instance['formId'], 'form' => $instance['formName'], 'integration' => (int) $instance['integrationId']];
            }
            $integration = (new Query())->from('{{%freeform_integrations}}')->where(['id' => $context['integration']])->one($this->db);
            if (!$integration) {
                $result['scanned'] = 1;
                $result['results'][] = $this->issue($context, 'The configured integration no longer exists.');

                return $result;
            }
            if (!$integration['enabled']) {
                return $result;
            }
            $result['scanned'] = 1;
            $context += ['integrationName' => $integration['name'], 'integrationHandle' => $integration['handle'], 'integrationType' => $integration['type']];
            if (!is_a($integration['class'], IntegrationInterface::class, true)) {
                $result['results'][] = $this->issue($context, 'The integration type is unavailable. Check that its plugin or integration is installed.');

                return $result;
            }
            $context['integrationClass'] = (new \ReflectionClass($integration['class']))->getShortName();
            $metadata = $this->metadata($integration['metadata']);
            if ($instance) {
                $metadata = array_merge($metadata, $this->metadata($instance['metadata']));
            }
            $fields = $instance ? (new Query())->select(['field.uid', 'field.type'])->from('{{%freeform_forms_fields}} field')
                ->innerJoin('{{%freeform_forms_rows}} row', '[[row.id]] = [[field.rowId]]')
                ->where(['field.formId' => $instance['formId']])->indexBy('uid')->all($this->db) : [];
            $result['results'] = $this->check($integration['class'], $metadata, $fields, $context, (bool) $instance);
        } catch (\Throwable) {
            $result['results'][] = $this->issue($context, 'The saved integration settings could not be checked. Review its configuration.', skipped: true);
        }

        return $result;
    }

    public function check(string $class, array $metadata, array $fields, array $context, bool $instance): array
    {
        $results = [];
        $reflection = new \ReflectionClass($class);
        $values = array_merge($reflection->getDefaultProperties(), $metadata);
        foreach ($reflection->getProperties() as $property) {
            $inputs = $property->getAttributes(Property::class, \ReflectionAttribute::IS_INSTANCEOF);
            if (!$inputs) {
                continue;
            }
            $flags = array_map(static fn ($attribute) => $attribute->newInstance()->name, $property->getAttributes(Flag::class));
            if (\array_intersect($flags, [IntegrationInterface::FLAG_READONLY, IntegrationInterface::FLAG_INTERNAL])) {
                continue;
            }
            if ($instance ? \in_array(IntegrationInterface::FLAG_GLOBAL_PROPERTY, $flags, true) : \in_array(IntegrationInterface::FLAG_INSTANCE_ONLY, $flags, true)) {
                continue;
            }
            $input = $inputs[0]->newInstance();
            $required = (bool) $property->getAttributes(Required::class);
            if (!$required && !$input instanceof Field && !$input instanceof FieldMapping) {
                continue;
            }
            $label = $input->label ?: ucwords(StringHelper::humanize($property->getName()));
            $params = ['setting' => $label];
            $visible = true;
            foreach ($property->getAttributes(VisibilityFilter::class) as $filter) {
                $condition = $this->condition($filter->newInstance()->expression, $values, $instance);
                if (false === $condition) {
                    $visible = false;

                    break;
                }
                if (null === $condition) {
                    $visible = null;
                }
            }
            if (false === $visible) {
                continue;
            }
            if (null === $visible) {
                $results[] = $this->issue($context, 'The conditional setting “{setting}” could not be checked automatically.', $params, true);

                continue;
            }
            $value = $values[$property->getName()] ?? null;

            try {
                if (\is_string($value) && StringHelper::isEnvVariable($value)) {
                    $value = App::parseEnv($value);
                } elseif (\in_array(IntegrationInterface::FLAG_ENCRYPTED, $flags, true) && \is_string($value) && '' !== $value) {
                    $value = ($this->decrypt)($value);
                    if (false === $value) {
                        throw new \UnexpectedValueException('Unable to decrypt.');
                    }
                }
                if (\is_string($value) && \in_array(IntegrationInterface::FLAG_ENV_SUGGEST, $flags, true)) {
                    $value = App::parseEnv($value);
                }
            } catch (\Throwable) {
                $results[] = $this->issue($context, 'The saved value for “{setting}” could not be read with the current site key.', $params, true);

                continue;
            }
            $disabledBoolean = false === $value && ($input instanceof Boolean || $input instanceof BooleanEnv);
            if ($required && (null === $value || (false === $value && !$disabledBoolean) || [] === $value || (\is_string($value) && '' === trim($value)))) {
                $results[] = $this->issue($context, 'The required setting “{setting}” is missing or its environment variable is empty.', $params);

                continue;
            }
            if ($instance && $input instanceof Field && $value) {
                $field = \is_string($value) ? ($fields[$value] ?? null) : null;
                if (!$field || ($input->implements && !array_filter($input->implements, static fn ($interface) => is_a($field['type'], $interface, true)))) {
                    $results[] = $this->issue($context, 'The field selected for “{setting}” is missing or has an incompatible type.', $params);
                }
            }
            if ($instance && $input instanceof FieldMapping && null !== $value) {
                if (!\is_array($value)) {
                    $results[] = $this->issue($context, 'The mapping for “{setting}” could not be read.', $params, true);

                    continue;
                }
                foreach ($value as $target => $mapping) {
                    // Unmapped relations can omit the value or save null instead of an empty string.
                    if (\is_array($mapping) && 'relation' === ($mapping['type'] ?? null) && (!isset($mapping['value']) || '' === $mapping['value'])) {
                        continue;
                    }
                    if (!\is_array($mapping) || !isset($mapping['type'], $mapping['value']) || !\is_string($mapping['value']) || !\in_array($mapping['type'], ['relation', 'custom', 'preset'], true)) {
                        // Describe the saved structure without exposing Twig or literal mapping values.
                        $results[] = $this->issue($context, 'The “{target}” mapping in “{setting}” contains an incomplete entry (entry type: {entryType}; mode: {mode}; value type: {valueType}).', $params + [
                            'target' => (string) $target,
                            'entryType' => get_debug_type($mapping),
                            'mode' => \is_array($mapping) && \array_key_exists('type', $mapping) ? (\is_string($mapping['type']) ? $mapping['type'] : get_debug_type($mapping['type'])) : 'missing',
                            'valueType' => \is_array($mapping) && \array_key_exists('value', $mapping) ? get_debug_type($mapping['value']) : 'missing',
                        ]);

                        continue;
                    }
                    if ('relation' === $mapping['type'] && !isset($fields[$mapping['value']])) {
                        $results[] = $this->issue($context, 'The “{target}” mapping in “{setting}” references a Freeform field that no longer exists (saved field reference: “{field}”).', $params + [
                            'target' => (string) $target,
                            'field' => $mapping['value'],
                        ]);
                    }
                }
            }
        }
        if (!$instance && is_a($class, OAuth2ConnectorInterface::class, true)) {
            try {
                $token = $metadata['accessToken'] ?? '';
                $token = StringHelper::isEnvVariable($token) ? App::parseEnv($token) : ($token ? ($this->decrypt)($token) : '');
                if (\is_string($token)) {
                    $token = App::parseEnv($token);
                }
                if (!\is_string($token) || '' === trim($token)) {
                    $results[] = $this->issue($context, 'The integration has no readable OAuth access token. Authorize it again.');
                }
            } catch (\Throwable) {
                $results[] = $this->issue($context, 'The OAuth access token could not be checked with the current site key.', skipped: true);
            }
        }

        return $results;
    }

    /** Evaluates only the simple saved-setting predicates used by integration editors. */
    private function condition(string $expression, array $values, bool $enabled): ?bool
    {
        $unknown = false;
        foreach (explode('&&', $expression) as $part) {
            $part = trim($part);
            if ('false' === $part) {
                return false;
            }
            if (preg_match('/^(?:Boolean\()?(!{0,2})(enabled|(?:values|properties)\.([a-zA-Z0-9_]+))\)?(?:\s*(===|!==)\s*(["\'])(.*?)\5)?$/D', $part, $match)) {
                $value = 'enabled' === $match[2] ? $enabled : ($values[$match[3]] ?? null);
                $truth = isset($match[4]) && '' !== $match[4] ? ('===' === $match[4] ? $value === $match[6] : $value !== $match[6]) : (bool) $value;
                if ('!' === $match[1]) {
                    $truth = !$truth;
                }
                if (!$truth) {
                    return false;
                }
            } else {
                $unknown = true;
            }
        }

        return $unknown ? null : true;
    }

    private function metadata(string $json): array
    {
        $value = json_decode($json, true, flags: \JSON_THROW_ON_ERROR);
        if (!\is_array($value)) {
            throw new \UnexpectedValueException('Invalid settings.');
        }

        return $value;
    }

    private function issue(array $context, string $message, array $params = [], bool $skipped = false): array
    {
        return ['context' => $context, 'message' => $message, 'params' => $params, 'skipped' => $skipped, 'informational' => false];
    }
}
