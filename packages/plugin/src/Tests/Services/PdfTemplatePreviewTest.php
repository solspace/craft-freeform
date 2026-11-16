<?php

namespace Solspace\Freeform\Tests\Services;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\pdf\PdfTemplatesController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\MailerService;
use Twig\Environment;
use Twig\Error\SyntaxError;
use Twig\Lexer;
use Twig\Loader\ArrayLoader;
use Twig\Source;
use Twig\TokenStream;
use yii\web\ForbiddenHttpException;

#[CoversClass(MailerService::class)]
#[CoversClass(PdfTemplatesController::class)]
class PdfTemplatePreviewTest extends TestCase
{
    private mixed $previousApp;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
    }

    #[TestWith(['receipt-{{ submission.id }}', 'receipt-42.pdf'])]
    #[TestWith(['receipt-{{ submission.id }}.PDF', 'receipt-42.PDF'])]
    public function testCurrentTwigContentsRenderToAPdfWithoutCompilingOrSendingAnEmail(string $fileName, string $expectedName): void
    {
        $this->useTwig();
        $mailer = $this->getMockBuilder(MailerService::class)->disableOriginalConstructor()->onlyMethods(['compileMessage', 'sendEmail'])->getMock();
        $mailer->expects(self::never())->method('compileMessage');
        $mailer->expects(self::never())->method('sendEmail');
        $pdf = $mailer->renderPdf('<h1>Unsaved receipt {{ submission.id }}</h1>', $fileName, ['submission' => ['id' => 42]]);

        self::assertSame($expectedName, $pdf['fileName']);
        self::assertStringStartsWith('%PDF-', $pdf['content']);
        self::assertStringContainsString('Unsaved receipt 42', $this->pdfStreams($pdf['content']));
    }

    public function testTwigErrorsRemainAvailableToThePreviewErrorResponse(): void
    {
        $this->useTwig();
        $mailer = (new \ReflectionClass(MailerService::class))->newInstanceWithoutConstructor();

        $this->expectException(SyntaxError::class);
        $mailer->renderPdf("<h1>Draft</h1>\n{% if %}", 'draft.pdf', []);
    }

    public function testFilenameHighlightingScriptDoesNotBreakTheSurroundingTwigTemplate(): void
    {
        $lexer = new Lexer(new Environment(new ArrayLoader()));
        $source = file_get_contents(__DIR__.'/../../templates/pdf-templates/index.twig');

        self::assertInstanceOf(TokenStream::class, $lexer->tokenize(new Source($source, 'pdf-templates')));
    }

    #[TestWith([[], [], false])]
    #[TestWith([[Freeform::PERMISSION_PDF_TEMPLATES_MANAGE], [12], false])]
    #[TestWith([[Freeform::PERMISSION_PDF_TEMPLATES_MANAGE, Freeform::PERMISSION_SUBMISSIONS_ACCESS], [34], false])]
    #[TestWith([[Freeform::PERMISSION_PDF_TEMPLATES_MANAGE, Freeform::PERMISSION_SUBMISSIONS_ACCESS], ['12'], true])]
    public function testPreviewRequiresTemplateManagementAndReadableSubmissions(array $permissions, array $allowedIds, bool $allowed): void
    {
        $user = new class($permissions) {
            public function __construct(private array $permissions) {}

            public function getIsAdmin(): bool
            {
                return false;
            }

            public function checkPermission(string $permission): bool
            {
                return \in_array($permission, array_map('strtolower', $this->permissions), true);
            }
        };
        $request = $this->createStub(Request::class);
        $request->method('getIsConsoleRequest')->willReturn(false);
        \Craft::$app = new class($user, $request) {
            public function __construct(private object $user, public Request $request) {}

            public function getUser(): object
            {
                return $this->user;
            }
        };
        $forms = $this->createStub(FormsService::class);
        $forms->method('getAllowedReadFormIds')->willReturn($allowedIds);
        $controller = $this->getMockBuilder(PdfTemplatesController::class)->disableOriginalConstructor()->onlyMethods(['getFormsService'])->getMock();
        $controller->method('getFormsService')->willReturn($forms);
        if (!$allowed) {
            $this->expectException(ForbiddenHttpException::class);
        }
        (new \ReflectionMethod(PdfTemplatesController::class, 'requirePreviewPermissions'))->invoke($controller, 12);
        if ($allowed) {
            $this->addToAssertionCount(1);
        }
    }

    private function useTwig(): void
    {
        $twig = new Environment(new ArrayLoader());
        \Craft::$app = (object) ['view' => new class($twig) {
            public function __construct(private Environment $twig) {}

            public function getTwig(): Environment
            {
                return $this->twig;
            }
        }];
    }

    private function pdfStreams(string $content): string
    {
        preg_match_all('/stream\r?\n(.*?)\r?\nendstream/s', $content, $matches);

        return implode("\n", array_map(static fn ($stream) => @gzuncompress($stream) ?: $stream, $matches[1]));
    }
}
