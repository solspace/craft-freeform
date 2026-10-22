<?php

namespace Solspace\Freeform\Tests\Integrations\Single\GTM;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Validators\EventParameters;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\PrepareAjaxResponsePayloadEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Integrations\Single\GTM\EventListeners\GTMTrigger;
use Solspace\Freeform\Integrations\Single\GTM\GTM;
use Solspace\Freeform\Library\Collections\FieldCollection;

#[CoversClass(GTM::class)]
#[CoversClass(GTMTrigger::class)]
#[CoversClass(EventParameters::class)]
class GTMTest extends TestCase
{
    public function testOnlyExplicitSupportedMappingsUseSubmittedValuesFromEveryPage(): void
    {
        $integration = $this->integration([
            ['insurance_type', 'insurance-uid'], ['office_location', 'office-uid'],
            ['contact_email', 'email-uid'], ['message_contents', 'message-uid'],
            ['deleted_field', 'deleted-uid'], ['form_name', 'insurance-uid'],
            ['event', 'insurance-uid'], ['__proto__', 'insurance-uid'],
            ['insurance_type', 'office-uid'], ['zero_value', 'number-uid'],
            ['nested_data', 'nested-uid'], ['unsubmitted', 'unsubmitted-uid'],
        ]);
        $form = $this->form([
            $this->field('insurance-uid', 'insurance', 'dropdown'),
            $this->field('office-uid', 'office', 'multiple-select'),
            $this->field('email-uid', 'email', 'email'),
            $this->field('message-uid', 'message', 'textarea'),
            $this->field('number-uid', 'amount', 'number'),
            $this->field('nested-uid', 'nested', 'hidden'),
            $this->field('unsubmitted-uid', 'unsubmitted', 'dropdown'),
        ]);
        self::assertSame([
            'form_name' => 'Get a Quote', 'insurance_type' => 'boat',
            'office_location' => 'victoria, sidney', 'zero_value' => 0,
        ], $integration->getEventParameters($form, [
            'insurance' => 'boat', 'office' => ['victoria', 'sidney'], 'amount' => 0,
            'email' => 'private@example.com', 'message' => 'Private message',
            'nested' => [['email' => 'private@example.com']],
        ]));
    }

    #[DataProvider('completionProvider')]
    public function testTrackingRequiresCompletedAcceptedSubmission(array $payload, bool $spam, bool $eligible): void
    {
        $form = $this->form([]);
        $submission = $this->createMock(Submission::class);
        $submission->isSpam = $spam;
        $form->method('getSubmission')->willReturn($submission);
        $provider = $this->createMock(FormIntegrationsProvider::class);
        $provider->method('getSingleton')->willReturn($this->integration([]));
        $trigger = (new \ReflectionClass(GTMTrigger::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty($trigger, 'integrationsProvider'))->setValue($trigger, $provider);
        $event = new PrepareAjaxResponsePayloadEvent($form, $payload);
        $trigger->attachToAjaxPayload($event);
        $gtm = $event->getPayload()['gtm'];
        self::assertSame($eligible, $gtm['eligible']);
        self::assertSame('generate_lead', $gtm['eventName']);
        self::assertSame($eligible ? ['form_name' => 'Get a Quote'] : [], (array) $gtm['parameters']);
    }

    public static function completionProvider(): array
    {
        return [
            'success' => [['success' => true, 'finished' => true], false, true],
            'validation failure' => [['success' => false, 'finished' => true], false, false],
            'intermediate page' => [['success' => true, 'finished' => false], false, false],
            'duplicate submission' => [['success' => true, 'finished' => true, 'duplicate' => true], false, false],
            'pending action' => [['success' => true, 'finished' => true, 'actions' => ['payment']], false, false],
            'quiet spam rejection' => [['success' => true, 'finished' => true], true, false],
            'missing completion' => [['success' => true], false, false],
        ];
    }

    public function testDisabledIntegrationAddsNoTrackingPayload(): void
    {
        $provider = $this->createMock(FormIntegrationsProvider::class);
        $provider->method('getSingleton')->willReturn(null);
        $trigger = (new \ReflectionClass(GTMTrigger::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty($trigger, 'integrationsProvider'))->setValue($trigger, $provider);
        $event = new PrepareAjaxResponsePayloadEvent($this->form([]), ['success' => true, 'finished' => true]);
        $trigger->attachToAjaxPayload($event);
        self::assertArrayNotHasKey('gtm', $event->getPayload());
    }

    #[DataProvider('invalidMappingsProvider')]
    public function testInvalidMappingConfigurationCannotBeSaved(mixed $value): void
    {
        self::assertNotEmpty((new EventParameters())->validate($value));
    }

    public static function invalidMappingsProvider(): array
    {
        return [
            [null], [[['insurance_type', '']]], [[['insurance_type', 'one'], ['insurance_type', 'two']]],
            [[['event', 'one']]], [[['form_name', 'one']]], [[['__proto__', 'one']]],
            [[['google_user', 'one']]], [[['9invalid', 'one']]], [[['bad-name', 'one']]],
            [[[str_repeat('a', 41), 'one']]], [array_fill(0, 25, ['parameter', 'one'])],
        ];
    }

    public function testEmptyAndValidMappingsCanBeSaved(): void
    {
        $validator = new EventParameters();
        self::assertSame([], $validator->validate([]));
        self::assertSame([], $validator->validate([['', '']]));
        self::assertSame([], $validator->validate([['insurance_type', 'one'], ['office_location', 'two']]));
    }

    private function integration(array $mappings): GTM
    {
        $integration = (new \ReflectionClass(GTM::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty($integration, 'eventParameters'))->setValue($integration, $mappings);
        (new \ReflectionProperty($integration, 'eventName'))->setValue($integration, 'generate_lead');

        return $integration;
    }

    private function form(array $fields): Form
    {
        $layout = $this->createMock(FormLayout::class);
        $layout->method('getFields')->willReturn(new FieldCollection($fields));
        $form = $this->createMock(Form::class);
        $form->method('getName')->willReturn('Get a Quote');
        $form->method('getLayout')->willReturn($layout);

        return $form;
    }

    private function field(string $uid, string $handle, string $type): FieldInterface
    {
        $field = $this->createMock(FieldInterface::class);
        $field->method('getUid')->willReturn($uid);
        $field->method('getHandle')->willReturn($handle);
        $field->method('getType')->willReturn($type);
        $field->expects(self::never())->method('getValue');

        return $field;
    }
}
