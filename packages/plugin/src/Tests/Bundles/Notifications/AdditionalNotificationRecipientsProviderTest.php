<?php

namespace Solspace\Freeform\Tests\Bundles\Notifications;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Notifications\Providers\AdditionalNotificationRecipientsProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Bundles\Rules\RuleValidator;
use Solspace\Freeform\Bundles\Rules\Types\NotificationRuleValidator;
use Solspace\Freeform\Events\Notifications\PrepareNotificationEvent;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\DataObjects\DisabledFunctionality;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientMapping;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientMappingCollection;
use Solspace\Freeform\Notifications\NotificationInterface;
use Solspace\Freeform\Notifications\Types\Admin\Admin;
use Solspace\Freeform\Notifications\Types\Conditional\Conditional;
use Solspace\Freeform\Notifications\Types\Dynamic\Dynamic;
use Solspace\Freeform\Notifications\Types\EmailField\EmailField as EmailNotification;
use yii\base\Event;

#[CoversClass(AdditionalNotificationRecipientsProvider::class)]
class AdditionalNotificationRecipientsProviderTest extends TestCase
{
    public function testDiscoversSubmittedAndConfiguredAddressesAndCombinesDuplicateSources(): void
    {
        $field = $this->emailField('submitter@example.test');
        $admin = $this->admin(['Admin@Example.test', 'submitter@example.test', 'invalid']);
        $choices = $this->provider([$admin])->getChoices($this->form([$field]));

        self::assertSame(['submitter@example.test', 'admin@example.test'], array_keys($choices));
        self::assertSame([
            ['label' => 'Email', 'type' => 'field'],
            ['label' => 'Team', 'type' => 'notification'],
        ], $choices['submitter@example.test']['sources']);
    }

    public function testIdenticalFieldAndNotificationNamesKeepTheirDistinctTypes(): void
    {
        $field = $this->emailField('submitter@example.test', 'Team');
        $admin = $this->admin(['submitter@example.test', 'submitter@example.test']);
        $choices = $this->provider([$admin])->getChoices($this->form([$field, $field]));

        self::assertSame([
            ['label' => 'Team', 'type' => 'field'],
            ['label' => 'Team', 'type' => 'notification'],
        ], $choices['submitter@example.test']['sources']);
    }

    public function testBulkSelectionsCannotSendAnotherSubmissionsContentToAnAddress(): void
    {
        $provider = $this->provider([]);
        $selected = ['alice@example.test', 'bob@example.test', 'unrelated@example.test'];
        $alice = $this->form([$this->emailField('alice@example.test')]);
        $bob = $this->form([$this->emailField('bob@example.test')]);

        self::assertSame(['alice@example.test'], $provider->getSelectedRecipients($alice, $selected, [])->emailsToArray());
        self::assertSame(['bob@example.test'], $provider->getSelectedRecipients($bob, $selected, [])->emailsToArray());
        self::assertSame([], $provider->getSelectedRecipients($bob, ['alice@example.test'], [])->emailsToArray());
    }

    public function testManualAddressesApplyToEverySubmissionAndDuplicatesAreRemoved(): void
    {
        $provider = $this->provider([]);
        $form = $this->form([$this->emailField('Alice@example.test')]);

        self::assertSame(
            ['Alice@example.test', 'team@example.test'],
            $provider->getSelectedRecipients($form, ['alice@example.test'], ['ALICE@example.test', 'team@example.test'])->emailsToArray(),
        );
        self::assertSame(['team@example.test'], $provider->getSelectedRecipients($form, [], ['team@example.test'])->emailsToArray());
    }

    public function testDisabledAndFailingConditionalNotificationsAreExcluded(): void
    {
        $disabled = $this->admin(['disabled@example.test'], false);
        $conditional = $this->createStub(Conditional::class);
        $conditional->method('isEnabled')->willReturn(true);
        $validator = $this->createMock(NotificationRuleValidator::class);
        $validator->expects(self::once())->method('isPassing')->willReturn(false);
        $conditional->method('getRecipients')->willReturn(RecipientCollection::fromArray(['conditional@example.test']));

        self::assertSame([], $this->provider([$disabled, $conditional], $validator)->getChoices($this->form([])));
        self::assertSame([], $this->provider([$this->admin(['admin@example.test'])])->getChoices($this->form([], new DisabledFunctionality(true))));
    }

    public function testPassingConditionalNotificationsAreAvailable(): void
    {
        $conditional = $this->createStub(Conditional::class);
        $conditional->method('isEnabled')->willReturn(true);
        $conditional->method('getName')->willReturn('Conditional');
        $conditional->method('getRecipients')->willReturn(RecipientCollection::fromArray(['conditional@example.test']));
        $validator = $this->createStub(NotificationRuleValidator::class);
        $validator->method('isPassing')->willReturn(true);

        self::assertArrayHasKey('conditional@example.test', $this->provider([$conditional], $validator)->getChoices($this->form([])));
    }

    public function testOnlyConfiguredTwigRecipientsAreRenderedAndInvalidTemplatesAreSkipped(): void
    {
        $admin = $this->createStub(Admin::class);
        $admin->method('isEnabled')->willReturn(true);
        $admin->method('getName')->willReturn('Team');
        $admin->method('getRecipients')->willReturn(RecipientCollection::fromArray(['{{ "team@example.test" }}', '{{ broken'], true));
        $field = $this->emailField('{{ "unexpected@example.test" }}');
        $choices = $this->provider([$admin])->getChoices($this->form([$field]));

        self::assertSame(['team@example.test'], array_keys($choices));
    }

    public function testUserSelectResolvesOnlySelectedMappingsAndFallsBackToDefaults(): void
    {
        $field = $this->createStub(DropdownField::class);
        $field->method('getHandle')->willReturn('department');
        $field->method('getValue')->willReturn(['sales', 'other']);
        $mapping = $this->createStub(RecipientMapping::class);
        $mapping->method('getRecipients')->willReturn(RecipientCollection::fromArray(['sales@example.test']));
        $mappings = $this->createStub(RecipientMappingCollection::class);
        $mappings->method('getMappingByValue')->willReturnMap([['sales', $mapping], ['other', null]]);
        $notification = $this->createStub(Dynamic::class);
        $notification->method('isEnabled')->willReturn(true);
        $notification->method('getName')->willReturn('Department');
        $notification->method('getField')->willReturn($field);
        $notification->method('getRecipients')->willReturn(RecipientCollection::fromArray(['default@example.test']));
        $notification->method('getRecipientMapping')->willReturn($mappings);
        $form = $this->form([$field]);
        $form->method('get')->willReturn($field);

        self::assertSame(['sales@example.test', 'default@example.test'], array_keys($this->provider([$notification])->getChoices($form)));
    }

    public function testUserSelectCanUseAnEmailOptionWhenNoRecipientsAreConfigured(): void
    {
        $field = $this->createStub(DropdownField::class);
        $field->method('getHandle')->willReturn('department');
        $field->method('getValue')->willReturn('option@example.test');
        $notification = $this->createStub(Dynamic::class);
        $notification->method('isEnabled')->willReturn(true);
        $notification->method('getName')->willReturn('Department');
        $notification->method('getField')->willReturn($field);
        $notification->method('getRecipients')->willReturn(new RecipientCollection());
        $notification->method('getRecipientMapping')->willReturn(null);
        $form = $this->form([$field]);
        $form->method('get')->willReturn($field);

        self::assertArrayHasKey('option@example.test', $this->provider([$notification])->getChoices($form));
    }

    public function testConfiguredModeUsesEveryApplicableTemplateAndCountsEmails(): void
    {
        $one = $this->template(11, 'Team alert');
        $two = $this->template(12, 'Follow-up');
        $provider = $this->provider([
            $this->admin(['team@example.test'], template: $one),
            $this->admin(['team@example.test'], template: $two),
        ]);
        $form = $this->form([]);
        $choice = $provider->getChoices($form)['team@example.test'];
        self::assertSame(2, $choice['configuredCount']);
        self::assertSame(['Team alert', 'Follow-up'], $choice['configuredTemplates']);
        $notifications = $provider->getSelectedConfiguredNotifications($form, ['TEAM@example.test']);
        self::assertSame([$one, $two], array_column($notifications, 'template'));
        self::assertSame(['team@example.test'], $notifications[0]['recipients']->emailsToArray());
        self::assertSame([], $provider->getSelectedConfiguredNotifications($form, ['unrelated@example.test']));
    }

    #[TestWith(['Contact', 'Contact - Team notification', 'Team notification'])]
    #[TestWith(['Application - Test', 'Application - Test - Visitor confirmation - Follow-up', 'Visitor confirmation - Follow-up'])]
    #[TestWith(['Contact', 'Team notification', 'Team notification'])]
    #[TestWith(['Contact', 'Other form - Team notification', 'Other form - Team notification'])]
    public function testTemplatePillsOmitOnlyTheCurrentFormsNamePrefix(string $formName, string $templateName, string $expected): void
    {
        $template = $this->template(21, $templateName);
        $form = $this->form([]);
        $form->method('getName')->willReturn($formName);
        $provider = $this->provider([$this->admin(['team@example.test'], template: $template)]);

        self::assertSame([$expected], $provider->getChoices($form)['team@example.test']['configuredTemplates']);
        self::assertSame($templateName, $template->getName());
        self::assertSame($template, $provider->getSelectedConfiguredNotifications($form, ['team@example.test'])[0]['template']);
    }

    public function testConfiguredModeUsesTheEmailFieldTemplateAndNeverFallsBackForUnconfiguredFields(): void
    {
        $field = $this->emailField('alice@example.test');
        $template = $this->template(21, 'Submitter confirmation');
        $notification = $this->createStub(EmailNotification::class);
        $notification->method('isEnabled')->willReturn(true);
        $notification->method('getName')->willReturn('Submitter');
        $notification->method('getField')->willReturn($field);
        $notification->method('getTemplate')->willReturn($template);
        $form = $this->form([$field]);
        $form->method('get')->willReturn($field);
        $provider = $this->provider([$notification]);
        self::assertSame($template, $provider->getSelectedConfiguredNotifications($form, ['alice@example.test'])[0]['template']);
        self::assertSame(1, $provider->getChoices($form)['alice@example.test']['configuredCount']);

        $unconfigured = $this->provider([]);
        self::assertSame(0, $unconfigured->getChoices($form)['alice@example.test']['configuredCount']);
        self::assertSame([], $unconfigured->getSelectedConfiguredNotifications($form, ['alice@example.test']));
    }

    public function testConfiguredModeUsesUserSelectTemplateOverrides(): void
    {
        $field = $this->createStub(DropdownField::class);
        $field->method('getHandle')->willReturn('department');
        $field->method('getValue')->willReturn(['sales', 'other']);
        $default = $this->template(31, 'Default');
        $override = $this->template(32, 'Sales');
        $mappings = $this->createStub(RecipientMappingCollection::class);
        $mappings->method('getMappingByValue')->willReturnMap([
            ['sales', new RecipientMapping('sales', $override, RecipientCollection::fromArray(['sales@example.test']))],
            ['other', null],
        ]);
        $notification = $this->createStub(Dynamic::class);
        $notification->method('isEnabled')->willReturn(true);
        $notification->method('getName')->willReturn('Department');
        $notification->method('getField')->willReturn($field);
        $notification->method('getTemplate')->willReturn($default);
        $notification->method('getRecipients')->willReturn(RecipientCollection::fromArray(['default@example.test']));
        $notification->method('getRecipientMapping')->willReturn($mappings);
        $form = $this->form([$field]);
        $form->method('get')->willReturn($field);
        $notifications = $this->provider([$notification])->getSelectedConfiguredNotifications($form, ['sales@example.test', 'default@example.test']);
        self::assertSame([$override, $default], array_column($notifications, 'template'));
        self::assertSame(['sales@example.test'], $notifications[0]['recipients']->emailsToArray());
        self::assertSame(['default@example.test'], $notifications[1]['recipients']->emailsToArray());
    }

    public function testConfiguredModeDoesNotSendEmailFieldNotificationsHiddenByRules(): void
    {
        $field = $this->emailField('hidden@example.test');
        $notification = $this->createStub(EmailNotification::class);
        $notification->method('isEnabled')->willReturn(true);
        $notification->method('getField')->willReturn($field);
        $notification->method('getTemplate')->willReturn($this->template(51, 'Confirmation'));
        $form = $this->form([$field]);
        $form->method('get')->willReturn($field);
        $notifications = $this->createStub(NotificationsProvider::class);
        $notifications->method('getByForm')->willReturn([$notification]);
        $rules = $this->createMock(RuleValidator::class);
        $rules->expects(self::once())->method('isFieldHidden')->with($form, $field)->willReturn(true);
        $provider = new AdditionalNotificationRecipientsProvider($notifications, $this->createStub(NotificationRuleValidator::class), new IsolatedTwig(), $rules);

        self::assertSame([], $provider->getSelectedConfiguredNotifications($form, ['hidden@example.test']));
    }

    public function testConfiguredModeHonorsPrepareHooksWithoutAddingUnselectedRecipients(): void
    {
        $original = $this->template(41, 'Original');
        $replacement = $this->template(42, 'Replacement');
        $handler = static function (PrepareNotificationEvent $event) use ($replacement): void {
            $event->setTemplate($replacement);
            $event->setRecipients(RecipientCollection::fromArray(['team@example.test', 'unselected@example.test']));
        };
        Event::on(Admin::class, NotificationInterface::PREPARE_NOTIFICATION, $handler);

        try {
            $provider = $this->provider([$this->admin(['team@example.test'], template: $original)]);
            $notifications = $provider->getSelectedConfiguredNotifications($this->form([]), ['team@example.test']);
            self::assertSame($replacement, $notifications[0]['template']);
            self::assertSame(['team@example.test'], $notifications[0]['recipients']->emailsToArray());
        } finally {
            Event::off(Admin::class, NotificationInterface::PREPARE_NOTIFICATION, $handler);
        }
    }

    private function template(int $id, string $name): NotificationTemplate
    {
        $template = new NotificationTemplate();
        $template->id = $id;
        $template->name = $name;

        return $template;
    }

    private function provider(array $notifications, ?NotificationRuleValidator $validator = null): AdditionalNotificationRecipientsProvider
    {
        $provider = $this->createStub(NotificationsProvider::class);
        $provider->method('getByForm')->willReturn($notifications);

        return new AdditionalNotificationRecipientsProvider($provider, $validator ?? $this->createStub(NotificationRuleValidator::class), new IsolatedTwig(), $this->createStub(RuleValidator::class));
    }

    private function form(array $fields, ?DisabledFunctionality $disabled = null): Form
    {
        $form = $this->createStub(Form::class);
        $layout = $this->createStub(FormLayout::class);
        $layout->method('getFields')->willReturn(new FieldCollection($fields));
        $form->method('getLayout')->willReturn($layout);
        $form->method('isDisabled')->willReturn($disabled ?? new DisabledFunctionality());

        return $form;
    }

    private function emailField(string $value, string $label = 'Email'): EmailField
    {
        $field = $this->createStub(EmailField::class);
        $field->method('getHandle')->willReturn('email');
        $field->method('getLabel')->willReturn($label);
        $field->method('getValue')->willReturn($value);
        $field->method('getRecipients')->willReturn(RecipientCollection::fromArray([$value]));

        return $field;
    }

    private function admin(array $emails, bool $enabled = true, ?NotificationTemplate $template = null): Admin
    {
        $admin = $this->createStub(Admin::class);
        $admin->method('isEnabled')->willReturn($enabled);
        $admin->method('getName')->willReturn('Team');
        $admin->method('getRecipients')->willReturn(RecipientCollection::fromArray($emails));
        $admin->method('getTemplate')->willReturn($template);

        return $admin;
    }
}
