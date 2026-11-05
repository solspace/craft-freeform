<?php

namespace Solspace\Freeform\Tests\Library\Activity;

use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Activity\ActivityDiagnostics;
use Solspace\Freeform\Library\Activity\ActivityExport;
use Solspace\Freeform\Library\Activity\ActivityPolicy;
use Solspace\Freeform\Library\Activity\ActivityPresentation;

#[CoversNothing]
class ActivityDiagnosticsTest extends TestCase
{
    public function testSafeMessageAndSelectedContextSurviveWhilePayloadsAreExcluded(): void
    {
        $diagnostics = ActivityDiagnostics::fromLog('Invalid recipient jane@example.com password=private-password', [
            'email' => 'jane@example.com', 'apiKey' => 'sk_live_1234567890abcdef', 'method' => 'POST',
            'response' => ['private' => 'private-body'], 'fieldValues' => ['name' => 'private-name'],
            'password' => 'private-password', 'object' => new \stdClass(),
        ]);
        self::assertSame('POST', $diagnostics['context']['method']);
        $json = json_encode($diagnostics);
        foreach (['jane@example.com', '1234567890abcdef', 'private-body', 'private-name', 'private-password'] as $secret) {
            self::assertStringNotContainsString($secret, $json);
        }
        self::assertStringContainsString('j***@example.com', $json);
        self::assertStringContainsString('sk_live_****cdef', $json);
        self::assertSame($diagnostics, ActivityDiagnostics::clean($diagnostics));
    }

    public function testExceptionKeepsTypeAndLocationsWithoutArgumentsPathsOrResponseBody(): void
    {
        $exception = new RequestException("POST https://api.example.com/v1/contacts?api_key=private-key failed\nPRIVATE RESPONSE BODY", new Request('POST', 'https://api.example.com'), new Response(401, [], 'PRIVATE RESPONSE BODY'));
        $diagnostics = ActivityDiagnostics::fromException($exception);
        self::assertSame(RequestException::class, $diagnostics['exception']);
        self::assertStringNotContainsString('PRIVATE RESPONSE BODY', json_encode($diagnostics));
        self::assertStringNotContainsString('private-key', json_encode($diagnostics));
        self::assertStringNotContainsString('/Users/', json_encode($diagnostics));
        foreach ($diagnostics['trace'] as $frame) {
            self::assertArrayNotHasKey('args', $frame);
        }
        self::assertSame('[database details omitted]', ActivityDiagnostics::fromException(new \PDOException('SQL with private answer'))['message']);
    }

    public function testAdversarialDataIsBoundedWithoutTraversingArbitraryObjects(): void
    {
        $data = ['message' => str_repeat('😀', 100000), 'context' => array_fill(0, 100, new \stdClass()), 'trace' => array_fill(0, 100, ['function' => str_repeat('x', 1000), 'file' => '/private/path/test.php', 'args' => ['private']])];
        $clean = ActivityDiagnostics::clean($data);
        self::assertLessThanOrEqual(ActivityDiagnostics::MAX_BYTES, \strlen(json_encode($clean)));
        self::assertStringNotContainsString('private', json_encode($clean));
        self::assertLessThanOrEqual(8, \count($clean['trace'] ?? []));
    }

    public function testPresentationAndExportKeepOnlySanitizedDiagnostics(): void
    {
        $row = ['id' => 1, 'event' => 'email-error', 'formId' => null, 'submissionId' => null, 'dateCreated' => '2026-11-03 12:00:00', 'metadata' => ['diagnostics' => ['message' => 'Failed jane@example.com', 'context' => ['password' => 'private', 'method' => 'POST'], 'payload' => ['private']]]];
        $presented = ActivityPresentation::present($row);
        self::assertSame('POST', $presented['metadata']['diagnostics']['context']['method']);
        self::assertStringNotContainsString('jane@example.com', json_encode($presented));
        $stream = fopen('php://temp', 'r+');
        ActivityExport::write($stream, [$row], 'json');
        rewind($stream);
        $json = stream_get_contents($stream);
        fclose($stream);
        self::assertStringNotContainsString('jane@example.com', $json);
        self::assertStringNotContainsString('private', $json);
        self::assertSame(ActivityPolicy::metadata($row['metadata']), json_decode($json, true)[0]['metadata']);
    }

    public function testClassicFingerprintsRemainSeparateWhenForwardedToActivity(): void
    {
        $fingerprints = ['email:233c249e1333' => 'd***@example.com'];
        $details = ActivityDiagnostics::fromLog('Rejected d***@example.com.', [], $fingerprints);
        self::assertSame('Rejected d***@example.com.', $details['message']);
        self::assertSame($fingerprints, $details['fingerprints']);
        self::assertSame($details, ActivityDiagnostics::clean($details));
    }

    public function testExceptionFingerprintsSurviveSanitizingAnAlreadyMaskedMessage(): void
    {
        $previousApp = \Craft::$app;
        \Craft::$app = new class {
            public function getConfig(): object
            {
                return new class {
                    public function getGeneral(): object
                    {
                        return (object) ['securityKey' => 'diagnostic-test-site'];
                    }
                };
            }
        };

        try {
            $details = ActivityDiagnostics::fromException(new \RuntimeException('Rejected demo@example.com.'));
            self::assertSame('Rejected d***@example.com.', $details['message']);
            self::assertCount(1, $details['fingerprints']);
            self::assertSame(['d***@example.com'], array_values($details['fingerprints']));
            self::assertSame($details, ActivityDiagnostics::clean($details));
        } finally {
            \Craft::$app = $previousApp;
        }
    }

    public function testFingerprintMetadataStillFitsTheDiagnosticByteLimit(): void
    {
        $fingerprints = [];
        for ($i = 0; $i < 32; ++$i) {
            $fingerprints['email:'.str_pad(dechex($i), 12, '0', \STR_PAD_LEFT)] = 'd***@'.str_repeat('a.', 120).'com';
        }
        $details = ActivityDiagnostics::clean(['message' => 'Failure', 'fingerprints' => $fingerprints]);
        self::assertLessThanOrEqual(ActivityDiagnostics::MAX_BYTES, \strlen(json_encode($details)));
        self::assertLessThan(32, \count($details['fingerprints']));
    }
}
