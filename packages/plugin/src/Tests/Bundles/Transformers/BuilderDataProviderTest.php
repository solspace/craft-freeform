<?php

namespace Solspace\Freeform\Tests\Bundles\Transformers;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationDTOProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Bundles\Rules\RuleProvider;
use Solspace\Freeform\Bundles\Transformers\Builder\Form\BuilderDataProvider;
use Solspace\Freeform\Bundles\Transformers\Builder\Form\FormTransformer;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\DataObjects\Integrations\Integration;
use Solspace\Freeform\Library\Rules\Condition;
use Solspace\Freeform\Library\Rules\ConditionCollection;
use Solspace\Freeform\Library\Rules\Types\FieldRule;
use Solspace\Freeform\Library\Serialization\FreeformSerializer;
use Solspace\Freeform\Library\Serialization\Normalizers\IdentificationNormalizer;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Notifications\Types\Dynamic\Dynamic;

/**
 * @coversNothing
 */
class BuilderDataProviderTest extends TestCase
{
    public function testCombinedDataMatchesExistingApiSerializationIncludingDisabledInstances(): void
    {
        $form = $this->getMockBuilder(Form::class)->disableOriginalConstructor()->getMock();
        $transformer = $this->createMock(FormTransformer::class);
        $rules = $this->createMock(RuleProvider::class);
        $notifications = $this->createMock(NotificationsProvider::class);
        $integrations = $this->createMock(FormIntegrationsProvider::class);
        $dtos = $this->createMock(IntegrationDTOProvider::class);
        $serializer = new FreeformSerializer();

        $field = $this->createMock(TextField::class);
        $field->method('getUid')->willReturn('field-uid');
        $field->method('getNormalizeIdentificator')->willReturn('field-uid');
        $field->method('getHandle')->willReturn('fieldHandle');
        $conditions = new ConditionCollection();
        $conditions->add(new Condition('condition-uid', $field, 'equals', 'yes'));
        $fieldRule = (new FieldRule(1, 'rule-uid', 'and', $conditions))->setField($field)->setDisplay('show');
        $formRules = ['fields' => [$fieldRule], 'pages' => [], 'buttons' => [], 'submitForm' => null];
        $notificationRules = [['uid' => 'notification-rule', 'notification' => 'notification-uid', 'conditions' => []]];
        $notification = new Dynamic();
        foreach ([
            'id' => 7, 'uid' => 'notification-uid', 'name' => 'Disabled notification', 'enabled' => false,
            'field' => $field, 'template' => null, 'recipientMapping' => null,
            'recipients' => new RecipientCollection(),
        ] as $property => $value) {
            (new \ReflectionProperty($notification, $property))->setValue($notification, $value);
        }
        $integrationDtos = [new Integration()];
        $integrationDtos[0]->enabled = false;
        $basicForm = (object) ['id' => 42, 'layout' => (object) ['fields' => []]];

        $transformer->expects(self::once())->method('transform')->with($form)->willReturn($basicForm);
        $rules->expects(self::once())->method('getFormRules')->with($form)->willReturn($formRules);
        $rules->expects(self::once())->method('getFormNotificationRules')->with($form)->willReturn($notificationRules);
        $notifications->expects(self::once())->method('getByForm')->with($form)->willReturn([$notification]);
        $integrations->expects(self::once())->method('getForForm')->with($form, null, null)->willReturn([]);
        $dtos->expects(self::once())->method('convert')->with([])->willReturn($integrationDtos);
        $provider = new BuilderDataProvider($transformer, $rules, $notifications, $integrations, $dtos, $serializer);
        $result = json_decode($serializer->serialize($provider->getData($form), 'json', ['preserve_empty_objects' => true]), true);

        self::assertSame(json_decode($serializer->serialize($basicForm, 'json'), true), $result['form']);
        self::assertSame(json_decode($serializer->serialize($formRules, 'json', ['groups' => 'builder']), true), $result['rules']);
        self::assertSame('field-uid', $result['rules']['fields'][0]['field']);
        self::assertSame('field-uid', $result['rules']['fields'][0]['conditions'][0]['field']);
        self::assertSame($notificationRules, $result['notificationRules']);
        self::assertSame(json_decode($serializer->serialize([$notification], 'json', [IdentificationNormalizer::NORMALIZE_TO_IDENTIFICATORS => true]), true), $result['notifications']);
        self::assertFalse($result['notifications'][0]['enabled']);
        self::assertSame('field-uid', $result['notifications'][0]['field']);
        self::assertSame(json_decode($serializer->serialize($integrationDtos, 'json'), true), $result['integrations']);
        self::assertFalse($result['integrations'][0]['enabled']);
    }
}
