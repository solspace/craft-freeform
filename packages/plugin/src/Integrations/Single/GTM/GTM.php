<?php

namespace Solspace\Freeform\Integrations\Single\GTM;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input\EventParameters;
use Solspace\Freeform\Attributes\Property\Input\Text;
use Solspace\Freeform\Attributes\Property\Middleware;
use Solspace\Freeform\Attributes\Property\Validators\EventParameters as EventParametersValidator;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\SingletonIntegrationInterface;

#[Type(
    name: 'Google Tag Manager',
    type: Type::TYPE_SINGLE,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class GTM extends BaseIntegration implements SingletonIntegrationInterface
{
    use EnabledByDefaultTrait;

    public const PARAMETER_FIELD_TYPES = [
        FieldInterface::TYPE_SELECT, FieldInterface::TYPE_MULTIPLE_SELECT,
        FieldInterface::TYPE_RADIO_GROUP, FieldInterface::TYPE_CHECKBOX,
        FieldInterface::TYPE_CHECKBOX_GROUP, FieldInterface::TYPE_CARDS,
        FieldInterface::TYPE_OPINION_SCALE, FieldInterface::TYPE_RATING,
        FieldInterface::TYPE_RANGE, FieldInterface::TYPE_NUMBER, FieldInterface::TYPE_HIDDEN,
    ];

    #[Flag(IntegrationInterface::FLAG_ENCRYPTED)]
    #[Flag(IntegrationInterface::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Text(
        label: 'Container ID',
        instructions: 'Add this if you want Google Tag Manager scripts added to your page by Freeform. Leave blank if you are adding your own GTM scripts.',
        placeholder: 'GTM-XXXXXXX',
    )]
    protected string $containerId = '';

    #[VisibilityFilter('enabled')]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Middleware('handle')]
    #[Text(
        label: 'Event Name',
        instructions: 'Event pushed to the data layer once after a completed, successful AJAX submission. Configure a matching tag and trigger in Google Tag Manager.',
        placeholder: 'form-submitted',
    )]
    protected string $eventName = '';

    #[VisibilityFilter('enabled')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[EventParametersValidator]
    #[EventParameters(
        label: 'Event Parameters',
        instructions: 'Map non-personal choice, numeric, or hidden field values to event parameters. form_name is included automatically. Never map names, contact details, addresses, or other personal data, including values stored in hidden fields.',
        availableFieldTypes: self::PARAMETER_FIELD_TYPES,
    )]
    protected array $eventParameters = [];

    public function getEventParameters(Form $form, array $submittedValues): array
    {
        $parameters = ['form_name' => mb_substr($form->getName(), 0, 100)];
        $fields = $form->getLayout()->getFields();
        foreach (\array_slice($this->eventParameters, 0, EventParametersValidator::MAX_MAPPINGS) as $row) {
            if (!\is_array($row) || !\is_string($row[0] ?? null) || !\is_string($row[1] ?? null)) {
                continue;
            }
            [$name, $uid] = array_map('trim', [$row[0], $row[1]]);
            if (!EventParametersValidator::isValidName($name) || \array_key_exists($name, $parameters)) {
                continue;
            }
            $field = $fields->get($uid);
            if (!$field || !\in_array($field->getType(), self::PARAMETER_FIELD_TYPES, true)
                || !\array_key_exists($field->getHandle(), $submittedValues)) {
                continue;
            }
            $value = $submittedValues[$field->getHandle()];
            if (\is_array($value)) {
                if (array_filter($value, static fn ($item) => !\is_scalar($item))) {
                    continue;
                }
                $value = implode(', ', $value);
            }
            if (\is_scalar($value)) {
                $parameters[$name] = \is_string($value) ? mb_substr($value, 0, 100) : $value;
            }
        }

        return $parameters;
    }

    public function getContainerId(): string
    {
        return $this->getProcessedValue($this->containerId);
    }

    public function getEventName(): string
    {
        return $this->getProcessedValue($this->eventName);
    }
}
