<?php

namespace Solspace\Freeform\Tests\Library\Helpers;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\Profiler;
use yii\log\Logger;

#[CoversClass(Profiler::class)]
class ProfilerTest extends TestCase
{
    private Logger $previousLogger;
    private Logger $logger;

    protected function setUp(): void
    {
        $this->previousLogger = \Yii::getLogger();
        $this->logger = new Logger();
        \Yii::setLogger($this->logger);
    }

    protected function tearDown(): void
    {
        \Yii::setLogger($this->previousLogger);
    }

    public function testReturnsCallbackResultAndRecordsBalancedSpan(): void
    {
        $result = new \stdClass();
        $this->assertSame($result, Profiler::profile('Test operation', static fn () => $result));
        $this->assertBalancedSpan();
    }

    public function testClosesSpanAndPreservesException(): void
    {
        $exception = new \RuntimeException('Original failure');
        $this->expectExceptionObject($exception);

        try {
            Profiler::profile('Test operation', static fn () => throw $exception);
        } finally {
            $this->assertBalancedSpan();
        }
    }

    private function assertBalancedSpan(): void
    {
        $this->assertCount(2, $this->logger->messages);
        $this->assertSame(Logger::LEVEL_PROFILE_BEGIN, $this->logger->messages[0][1]);
        $this->assertSame(Logger::LEVEL_PROFILE_END, $this->logger->messages[1][1]);

        foreach ($this->logger->messages as $message) {
            $this->assertSame('Freeform: Test operation', $message[0]);
            $this->assertSame('freeform.performance', $message[2]);
        }
    }
}
