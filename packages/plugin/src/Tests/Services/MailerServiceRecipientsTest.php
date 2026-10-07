<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Notifications\Components\Recipients\Recipient;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Services\MailerService;

#[CoversClass(MailerService::class)]
class MailerServiceRecipientsTest extends TestCase
{
    private mixed $originalApp;
    private MailerService $mailer;

    protected function setUp(): void
    {
        $this->originalApp = \Craft::$app;
        $this->setTestToEmailAddress([]);

        $this->mailer = (new \ReflectionClass(MailerService::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty(MailerService::class, 'isolatedTwig'))->setValue(
            $this->mailer,
            new IsolatedTwig(sys_get_temp_dir()),
        );
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->originalApp;
    }

    public function testSubmittedRecipientsNeverEvaluateTwig(): void
    {
        $addresses = [
            '{{7*7}}@attacker.example',
            '{{form.handle}}@attacker.example',
            '{{form.createdBy.username}}@attacker.example',
            '{{form.createdBy.email|url_encode}}@attacker.example',
        ];

        $this->assertSame($addresses, $this->mailer->processRecipients(
            RecipientCollection::fromArray($addresses),
            $this->createForm(),
        ));
    }

    public function testConfiguredRecipientsRenderAlongsideLiteralValues(): void
    {
        $recipients = new RecipientCollection([
            new Recipient('{{form.handle}}@example.com', isTemplate: true),
            new Recipient('{{form.handle}}@attacker.example'),
        ]);

        $this->assertSame(
            ['contact@example.com', '{{form.handle}}@attacker.example'],
            $this->mailer->processRecipients($recipients, $this->createForm()),
        );
    }

    public function testRecipientTrustSurvivesQueueSerialization(): void
    {
        $recipients = new RecipientCollection([
            new Recipient('{{form.handle}}@example.com', isTemplate: true),
            new Recipient('{{form.createdBy.username}}@attacker.example'),
        ]);

        $this->assertSame(
            ['contact@example.com', '{{form.createdBy.username}}@attacker.example'],
            $this->mailer->processRecipients(unserialize(serialize($recipients)), $this->createForm()),
        );
    }

    public function testRecipientsWithoutAFormAreNotRendered(): void
    {
        $recipients = RecipientCollection::fromArray(['{{7*7}}@example.com'], isTemplate: true);

        $this->assertSame(['{{7*7}}@example.com'], $this->mailer->processRecipients($recipients));
    }

    public function testCraftTestAddressOverrideStillApplies(): void
    {
        $this->setTestToEmailAddress(['test@example.com']);

        $this->assertSame(['test@example.com'], $this->mailer->processRecipients(
            RecipientCollection::fromArray(['{{form.handle}}@attacker.example']),
        ));
    }

    private function createForm(): Form
    {
        $fields = new FieldCollection();
        $layout = $this->createMock(FormLayout::class);
        $layout->method('getFields')->willReturn($fields);

        $form = $this->createMock(Form::class);
        $form->method('getLayout')->willReturn($layout);
        $form->method('getFields')->willReturn($fields);
        $form->method('getHandle')->willReturn('contact');
        $form->expects($this->never())->method('getCreatedBy');

        return $form;
    }

    private function setTestToEmailAddress(array $addresses): void
    {
        \Craft::$app = new class($addresses) {
            public function __construct(private array $addresses) {}

            public function getConfig(): self
            {
                return $this;
            }

            public function getGeneral(): self
            {
                return $this;
            }

            public function getTestToEmailAddress(): array
            {
                return $this->addresses;
            }
        };
    }
}
