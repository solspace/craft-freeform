<?php

namespace Solspace\Freeform\Tests\Library\Logging;

use Monolog\Level;
use Monolog\LogRecord;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Logging\DiagnosticSanitizer;
use Solspace\Freeform\Library\Logging\Processors\RedactSensitiveInfoProcessor;

#[CoversNothing]
class DiagnosticSanitizerTest extends TestCase
{
    public function testNestedSecretsAreHiddenAndUsefulMaskedCluesRemain(): void
    {
        $sanitizer = new DiagnosticSanitizer('site-one');
        $clean = $sanitizer->context([
            'API_KEY' => 'sk_live_1234567890abcdef', 'Access-Token' => '1234567890abcdefghijkl',
            'nested' => (object) ['email' => 'jane@example.com', 'Password' => 'short', 'client_secret' => 'long-secret'],
            'Authorization' => 'Bearer sensitive', 'Cookie' => 'session=abc', 'session_id' => 'session-secret',
            'token' => 'tiny', 'response_body' => 'private-response', 'mapping' => ['name' => 'private-name'],
        ]);
        $json = json_encode($clean);
        foreach (['1234567890abcdef', '1234567890abcdefghijkl', 'jane@example.com', 'short', 'long-secret', 'Bearer sensitive', 'session-secret', 'tiny', 'private-response', 'private-name'] as $private) {
            self::assertStringNotContainsString($private, $json);
        }
        self::assertStringContainsString('sk_live_****cdef', $json);
        self::assertStringContainsString('j***@example.com', $json);
        self::assertStringNotContainsString('masked email:', $json);
        self::assertStringNotContainsString('ref:', $json);
        self::assertNotEmpty($sanitizer->fingerprints());
    }

    public function testMaskingIsStableAndFingerprintsDifferBetweenSites(): void
    {
        $one = new DiagnosticSanitizer('one');
        $two = new DiagnosticSanitizer('two');
        $message = 'Rejected jane@example.com with api_key=sk_live_1234567890abcdef';
        $masked = $one->text($message);
        self::assertSame($masked, $one->text($masked));
        self::assertSame($masked, $two->text($message));
        self::assertNotSame($one->fingerprints(), $two->fingerprints());
        self::assertSame($one->context(['email' => 'jane@example.com']), $one->context($one->context(['email' => 'jane@example.com'])));
    }

    public function testShortSecretsAndAuthorizationAreNeverPartiallyExposed(): void
    {
        $clean = (new DiagnosticSanitizer('test'))->text('password="short secret"; authorization: Bearer abc.def; token=tiny; secret=xyz');
        foreach (['short secret', 'abc.def', 'tiny', 'xyz'] as $secret) {
            self::assertStringNotContainsString($secret, $clean);
        }
        $clean = (new DiagnosticSanitizer('test'))->text('password="private \"embedded quote\" secret"');
        self::assertStringNotContainsString('private', $clean);
        self::assertStringNotContainsString('embedded', $clean);
        self::assertStringNotContainsString('secret"', $clean);
    }

    public function testUrlsRetainRoutingInformationWithoutUserInfoQueriesOrFragments(): void
    {
        $sanitizer = new DiagnosticSanitizer('test');
        $clean = $sanitizer->text('POST https://admin:super-password@api.example.com/v1/contacts?api_key=sk_live_1234567890abcdef&email=jane%40example.com&name=PrivateName&page=2#private-fragment');
        foreach (['super-password', 'admin:', '1234567890abcdef', 'jane%40', 'PrivateName', 'private-fragment'] as $secret) {
            self::assertStringNotContainsString($secret, $clean);
        }
        self::assertStringContainsString('api.example.com/v1/contacts', $clean);
        self::assertStringContainsString('page=2', $clean);
        self::assertStringContainsString('cdef', $clean);
        self::assertSame($clean, $sanitizer->text($clean));
    }

    public function testFreeTextTokensEmailsAddressesAndEmbeddedBodiesAreSanitized(): void
    {
        $sanitizer = new DiagnosticSanitizer('test');
        $clean = $sanitizer->text('Failed jane@example.com from 192.168.1.20 or 2001:db8::1 using ghp_1234567890abcdefghijkl at /Users/privateuser/site/vendor/test.php');
        foreach (['jane@example.com', '192.168.1.20', '2001:db8::1', '1234567890abcdefghijkl', 'privateuser'] as $private) {
            self::assertStringNotContainsString($private, $clean);
        }
        self::assertStringContainsString('test.php', $clean);
        self::assertStringNotContainsString('private-name', $sanitizer->text('Request failed: {"name":"private-name"}'));
        self::assertStringNotContainsString('private-name', $sanitizer->text("SQLSTATE[23000]: INSERT INTO users VALUES ('private-name')"));
    }

    public function testRecursiveDataAndObjectsCannotExpandOrRunCode(): void
    {
        $recursive = ['email' => 'jane@example.com'];
        $recursive['loop'] = &$recursive;
        $object = new class implements \JsonSerializable, \Stringable {
            public function jsonSerialize(): mixed
            {
                throw new \RuntimeException('Do not serialize');
            }

            public function __toString(): string
            {
                throw new \RuntimeException('Do not stringify');
            }
        };
        $clean = (new DiagnosticSanitizer('test'))->context(['loop' => $recursive, 'object' => $object]);
        self::assertStringNotContainsString('jane@example.com', json_encode($clean));
        self::assertLessThan(4096, \strlen(json_encode($clean)));
    }

    public function testBothMonologFormatsSanitizeMessageContextAndExtra(): void
    {
        $processor = new RedactSensitiveInfoProcessor();
        $data = ['message' => 'Failure for jane@example.com password=private-password', 'context' => ['password' => 'private-password'], 'extra' => ['email' => 'jane@example.com']];
        $records = [$data];
        if (class_exists(LogRecord::class)) {
            $records[] = new LogRecord(new \DateTimeImmutable(), 'test', Level::Error, $data['message'], $data['context'], $data['extra']);
        }
        foreach ($records as $record) {
            $output = $processor($record);
            $json = json_encode($output instanceof LogRecord ? $output->toArray() : $output);
            self::assertStringNotContainsString('jane@example.com', $json);
            self::assertStringNotContainsString('private-password', $json);
        }
    }

    public function testHeaderLinesInternalAddressesAndNonHttpCredentialsAreSanitized(): void
    {
        $sanitizer = new DiagnosticSanitizer('test');
        $clean = $sanitizer->text("Cookie: sid=private-session; another=private-cookie\nAuthorization: Basic private-auth\nSMTP smtp://admin:private-password@mail.example.test/send?recipient=joe%40localhost\n\"Jane Doe\"@example.com");
        foreach (['private-session', 'private-cookie', 'private-auth', 'private-password', 'joe%40localhost', 'Jane Doe'] as $private) {
            self::assertStringNotContainsString($private, $clean);
        }
        self::assertStringContainsString('mail.example.test/send', $clean);
        self::assertStringContainsString('example.com', $clean);
        self::assertSame($clean, $sanitizer->text($clean));
    }

    public function testLargeContextCannotBreakExtraProcessingAndMessagesRemainBounded(): void
    {
        $processor = new RedactSensitiveInfoProcessor();
        $record = $processor(['message' => str_repeat('x', 50000), 'context' => array_fill(0, 32, array_fill(0, 32, ['email' => 'private@example.com'])), 'extra' => ['email' => 'private@example.com']]);
        self::assertLessThanOrEqual(2049, mb_strlen($record['message']));
        self::assertIsArray($record['extra']);
        self::assertStringNotContainsString('private@example.com', json_encode($record));
    }

    public function testOlderInlineAnnotationsBecomePlainValuesWithSeparateFingerprints(): void
    {
        $processor = new RedactSensitiveInfoProcessor();
        $record = $processor([
            'message' => 'Rejected [masked email: d***@example.com; ref: 233c249e1333].',
            'context' => ['apiKey' => '[masked key: demo_test_****c3d4; ref: 4603ebe710c9]'],
            'extra' => [],
        ]);
        self::assertSame('Rejected d***@example.com.', $record['message']);
        self::assertSame('demo_test_****c3d4', $record['context']['apiKey']);
        self::assertSame([
            'email:233c249e1333' => 'd***@example.com',
            'key:4603ebe710c9' => 'demo_test_****c3d4',
        ], $record['extra']['fingerprints']);
        self::assertSame($record, $processor($record));
    }

    public function testFingerprintMetadataCannotSmuggleRawValuesIntoARecord(): void
    {
        self::assertSame([], DiagnosticSanitizer::cleanFingerprints([
            'email:233c249e1333' => 'demo@example.com',
            'key:4603ebe710c9' => 'demo_test_1234567890abcdef',
            'password' => 'private-password',
            'key:invalid' => '****c3d4',
        ]));
    }
}
