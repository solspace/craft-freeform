<?php

namespace Solspace\Freeform\Tests\Notifications;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Implementations\Notifications\Recipients\RecipientTransformer;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Notifications\Components\Recipients\Recipient;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;

#[CoversClass(Recipient::class)]
#[CoversClass(RecipientCollection::class)]
class RecipientCollectionTest extends TestCase
{
    public function testSubmittedAddressesAreNeverRendered(): void
    {
        $addresses = [
            '{{7*7}}@attacker.example',
            '{{form.handle}}@attacker.example',
            '{{form.createdBy.username}}@attacker.example',
            '{{form.createdBy.email|url_encode}}@attacker.example',
            'customer@example.com',
        ];

        $recipients = RecipientCollection::fromArray($addresses);

        $this->assertSame($addresses, $recipients->emailsToArray(static function (): string {
            self::fail('Submitted values must not reach the template renderer.');
        }));
    }

    public function testConfiguredAndSubmittedRecipientsCanShareACollection(): void
    {
        $twig = new IsolatedTwig(sys_get_temp_dir());
        $recipients = new RecipientCollection([
            new Recipient('{{form.handle}}@example.com', isTemplate: true),
            new Recipient('{{form.handle}}@attacker.example'),
        ]);

        $this->assertSame(
            ['contact@example.com', '{{form.handle}}@attacker.example'],
            $recipients->emailsToArray(static fn (string $email): string => $twig->render($email, [
                'form' => ['handle' => 'contact'],
            ])),
        );
    }

    public function testConfiguredFieldSubstitutionIsNotRenderedAgain(): void
    {
        $twig = new IsolatedTwig(sys_get_temp_dir());
        $payload = '{{form.createdBy.email|url_encode}}@attacker.example';
        $recipients = RecipientCollection::fromArray(['{{ email }}'], isTemplate: true);

        $this->assertSame([$payload], $recipients->emailsToArray(
            static fn (string $email): string => $twig->render($email, [
                'email' => $payload,
                'form' => ['createdBy' => ['email' => 'private@example.com']],
            ]),
        ));
    }

    public function testTrustedConfigurationStillRendersTwig(): void
    {
        $twig = new IsolatedTwig(sys_get_temp_dir());
        $recipients = (new RecipientTransformer())->transform([
            ['email' => '{{form.handle}}@example.com', 'name' => 'Site owner'],
        ]);

        $this->assertSame(['contact@example.com'], $recipients->emailsToArray(
            static fn (string $email): string => $twig->render($email, [
                'form' => ['handle' => 'contact'],
            ]),
        ));
    }

    public function testRecipientsWithoutARendererKeepTheirLiteralAddresses(): void
    {
        $recipients = RecipientCollection::fromArray(['  {{ email }}  ', '  ', 'customer@example.com'], isTemplate: true);

        $this->assertSame([0 => '{{ email }}', 2 => 'customer@example.com'], $recipients->emailsToArray());
    }

    public function testQueueSerializationPreservesRecipientTrust(): void
    {
        $recipients = new RecipientCollection([
            new Recipient('{{7*7}}@example.com', isTemplate: true),
            new Recipient('{{7*7}}@attacker.example'),
        ]);

        $restored = unserialize(serialize($recipients));
        $twig = new IsolatedTwig(sys_get_temp_dir());

        $this->assertSame(['49@example.com', '{{7*7}}@attacker.example'], $restored->emailsToArray(
            static fn (string $email): string => $twig->render($email),
        ));
    }

    public function testLegacyQueuedRecipientsDefaultToLiteralValues(): void
    {
        $class = Recipient::class;
        $emailProperty = "\0{$class}\0email";
        $nameProperty = "\0{$class}\0name";
        $email = '{{form.createdBy.email|url_encode}}@attacker.example';

        // This is the serialized shape produced before the template flag existed.
        $serialized = \sprintf(
            'O:%d:"%s":2:{s:%d:"%s";s:%d:"%s";s:%d:"%s";s:0:"";}',
            \strlen($class),
            $class,
            \strlen($emailProperty),
            $emailProperty,
            \strlen($email),
            $email,
            \strlen($nameProperty),
            $nameProperty,
        );

        $recipient = unserialize($serialized);

        $this->assertFalse($recipient->isTemplate());
        $this->assertSame([$email], (new RecipientCollection([$recipient]))->emailsToArray(static function (): string {
            self::fail('Legacy queue recipients must not reach the template renderer.');
        }));
    }
}
