<?php

namespace Solspace\Freeform\Tests\Library\Activity;

use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Psr7\Request;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Activity\ActivityContext;
use Symfony\Component\Mailer\Exception\TransportException;
use Twig\Error\LoaderError;
use Twig\Error\SyntaxError;
use yii\db\IntegrityException;

/**
 * @coversNothing
 */
class ActivityContextTest extends TestCase
{
    #[TestWith([28, ActivityContext::INTEGRATION_TIMEOUT])]
    #[TestWith([6, ActivityContext::INTEGRATION_DNS])]
    #[TestWith([60, ActivityContext::INTEGRATION_TLS])]
    #[TestWith([7, ActivityContext::INTEGRATION_CONNECTION])]
    public function testConnectionDiagnosticsUseNumericTransportFactsOnly(int $errno, int $reason): void
    {
        $exception = new ConnectException('SECRET response', new Request('POST', 'https://secret.example/private'), null, ['errno' => $errno, 'url' => 'SECRET', 'primary_ip' => 'SECRET']);
        self::assertSame(['reasonCode' => $reason], ActivityContext::integrationFailure($exception));
    }

    public function testExceptionClassificationNeverUsesRawMessages(): void
    {
        self::assertSame(ActivityContext::MAIL_TEMPLATE_SYNTAX, ActivityContext::exceptionReason(new SyntaxError('SECRET template', 10), ActivityContext::MAIL_RENDER_FAILED));
        self::assertSame(ActivityContext::MAIL_TEMPLATE_UNAVAILABLE, ActivityContext::exceptionReason(new LoaderError('SECRET path'), ActivityContext::MAIL_RENDER_FAILED));
        self::assertSame(ActivityContext::SUBMISSION_CONSTRAINT, ActivityContext::exceptionReason(new IntegrityException('SECRET SQL'), ActivityContext::SUBMISSION_SAVE_EXCEPTION));
        self::assertSame(ActivityContext::MAIL_TRANSPORT_AUTH, ActivityContext::exceptionReason(new TransportException('SECRET SMTP', 535), ActivityContext::MAIL_SEND_EXCEPTION));
        self::assertSame(ActivityContext::MAIL_SEND_EXCEPTION, ActivityContext::exceptionReason(new \RuntimeException('535 SECRET text is not a diagnosis'), ActivityContext::MAIL_SEND_EXCEPTION));
        self::assertNull(ActivityContext::diagnosticEvent('40'));
        self::assertNull(ActivityContext::diagnosticEvent(9999));
    }
}
