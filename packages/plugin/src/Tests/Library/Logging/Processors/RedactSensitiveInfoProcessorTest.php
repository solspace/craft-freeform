<?php

namespace Solspace\Freeform\Tests\Library\Logging\Processors;

use Monolog\Level;
use Monolog\LogRecord;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Logging\Processors\RedactSensitiveInfoProcessor;

/**
 * @coversNothing
 */
class RedactSensitiveInfoProcessorTest extends TestCase
{
    public function testRedact(): void
    {
        $logRecord = $this->record(
            new \DateTimeImmutable(),
            'channel',
            'This is a message',
            [
                'pass' => 'password',
                'api_key' => 'api key',
                'clientId' => 'client',
                'secret' => 'secret',
                'clientSecret' => 'secret',
                'password' => 'password',
                'somePassword' => 'password',
                'other' => 'value',
                'nested' => [
                    'pass' => 'nested pass',
                    'api_key' => 'nested api key',
                ],
            ],
        );

        $processor = new RedactSensitiveInfoProcessor();
        $output = $processor($logRecord);

        self::assertEquals(
            [
                'pass' => 'pass**********',
                'api_key' => 'api **********',
                'clientId' => 'clie**********',
                'secret' => 'secr**********',
                'clientSecret' => 'secr**********',
                'password' => 'pass**********',
                'somePassword' => 'pass**********',
                'other' => 'value',
                'nested' => [
                    'pass' => 'nest**********',
                    'api_key' => 'nest**********',
                ],
            ],
            \is_array($output) ? $output['context'] : $output->context,
        );
    }

    public function testRedactMixed(): void
    {
        $logRecord = $this->record(
            new \DateTimeImmutable(),
            'channel',
            'This is a message',
            [
                'pass' => 'password',
                'api_key' => 'api key',
                'clientId' => 'client',
                'secret' => 'secret',
                'clientSecret' => 'secret',
                'password' => 'password',
                'somePassword' => 'password',
                'other' => 'value',
                'nested' => (object) [
                    'pass' => 'nested password',
                    'api_key' => 'nested api key',
                ],
            ],
        );

        $processor = new RedactSensitiveInfoProcessor();
        $output = $processor($logRecord);

        self::assertEquals(
            [
                'pass' => 'pass**********',
                'api_key' => 'api **********',
                'clientId' => 'clie**********',
                'secret' => 'secr**********',
                'clientSecret' => 'secr**********',
                'password' => 'pass**********',
                'somePassword' => 'pass**********',
                'other' => 'value',
                'nested' => (object) [
                    'pass' => 'nest**********',
                    'api_key' => 'nest**********',
                ],
            ],
            \is_array($output) ? $output['context'] : $output->context,
        );
    }

    private function record(\DateTimeImmutable $datetime, string $channel, string $message, array $context): array|LogRecord
    {
        return class_exists(LogRecord::class)
            ? new LogRecord($datetime, $channel, Level::Info, $message, $context)
            : ['datetime' => $datetime, 'channel' => $channel, 'level' => 200, 'level_name' => 'INFO', 'message' => $message, 'context' => $context, 'extra' => []];
    }
}
