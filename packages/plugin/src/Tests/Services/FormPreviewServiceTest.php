<?php

namespace Solspace\Freeform\Tests\Services;

use craft\web\Request;
use craft\web\View;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Form\Context\Session\SessionContext;
use Solspace\Freeform\Bundles\Form\Context\Session\StorageTypes\PayloadStorage;
use Solspace\Freeform\Bundles\Form\HiddenInputs\CsrfInput;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Bags\PropertyBag;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\DataObjects\FormTemplate;
use Solspace\Freeform\Library\Helpers\PreviewAssetHelper;
use Solspace\Freeform\Services\FormPreviewService;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\SettingsService;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;
use yii\base\Event;

#[CoversClass(FormPreviewService::class)]
#[CoversClass(PreviewAssetHelper::class)]
class FormPreviewServiceTest extends TestCase
{
    public function testPublicImagesCanRenderWithoutCorsHeadersAndRemainUrlRestricted(): void
    {
        $html = (new FormPreviewService())->isolate('<html><head></head><body><img src="https://example.test/photo.jpg" crossorigin="anonymous" srcset="https://other.test/photo.jpg 2x"></body></html>', 'CSRF');
        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $xpath = new \DOMXPath($document);
        $image = $xpath->query('//img')->item(0);
        self::assertFalse($image->hasAttribute('crossorigin'));
        self::assertFalse($image->hasAttribute('srcset'));
        self::assertSame('no-referrer', $image->getAttribute('referrerpolicy'));
        $policy = $xpath->query('//head/meta')->item(0)->getAttribute('content');
        self::assertStringContainsString('img-src data: blob: https://example.test/photo.jpg;', $policy);
        self::assertStringNotContainsString('other.test', $policy);
        self::assertStringContainsString("connect-src 'none'", $policy);
    }

    public function testSectionBackgroundsAllowOnlyTheirExplicitSafeImageUrls(): void
    {
        $html = (new FormPreviewService())->isolate('<html><head></head><body><div data-freeform-background-image="https://example.test/hero.jpg"></div><div data-freeform-background-image="javascript:alert(1)"></div></body></html>', 'CSRF');
        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $policy = (new \DOMXPath($document))->query('//meta[@http-equiv="Content-Security-Policy"]')->item(0)->getAttribute('content');
        self::assertStringContainsString('img-src data: blob: https://example.test/hero.jpg;', $policy);
        self::assertStringNotContainsString('javascript:', $policy);
        self::assertStringContainsString("connect-src 'none'", $policy);
    }

    #[TestWith(['javascript:alert(1)'])]
    #[TestWith(['0'])]
    #[TestWith(['http://example.test/styles.css'])]
    #[TestWith(['//example.test/styles.css'])]
    #[TestWith(['https://user@example.test/styles.css'])]
    #[TestWith(['https://example.test/styles.css#fragment'])]
    #[TestWith(["https://example.test/style.css\tbad"])]
    #[TestWith(['https://example.test/\';connect-src *'])]
    public function testRejectsUnsafeAssetUrl(string $url): void
    {
        $this->expectException(\InvalidArgumentException::class);
        PreviewAssetHelper::parse($url);
    }

    public function testRejectsExcessiveUrlLength(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        PreviewAssetHelper::parse('https://example.test/'.str_repeat('x', 2048));
    }

    public function testAssetUrlsPreserveOrderAndDeduplicate(): void
    {
        self::assertSame(['https://example.test/a.js?v=2', 'https://cdn.example.test/b.js'], PreviewAssetHelper::parse(" https://example.test/a.js?v=2\r\n\nhttps://cdn.example.test/b.js\nhttps://example.test/a.js?v=2 "));
        self::assertSame([], PreviewAssetHelper::parse(''));
        $this->expectException(\InvalidArgumentException::class);
        PreviewAssetHelper::parse(implode("\n", array_map(static fn ($i) => "https://example.test/{$i}.js", range(1, 21))));
    }

    public function testFrameRemovesCredentialsAndNavigationAndRestrictsNetwork(): void
    {
        $html = (new FormPreviewService())->isolate('<!doctype html><html><head><base href="https://evil.test"><meta http-equiv="refresh" content="0;url=https://evil.test"><script src="https://example.test/app.js"></script><script>window.previewReady = true;</script><link rel="stylesheet" href="https://example.test/app.css"></head><body><iframe src="https://evil.test"></iframe><form action="/actions/freeform/submit"><input name="CSRF" value="secret"><input name="freeform_payload" value="encrypted"><input name="formHash" value="live"><input name="productId" value="42"><button formaction="/danger">Submit</button></form><script src="javascript:alert(1)"></script><p>Überprüfung</p></body></html>', 'CSRF');
        $document = new \DOMDocument();
        @$document->loadHTML('<?xml encoding="UTF-8">'.$html);
        $xpath = new \DOMXPath($document);
        self::assertSame(0, $xpath->query('//base | //iframe | //*[@formaction]')->length);
        self::assertSame(1, $xpath->query('//input')->length);
        self::assertSame('productId', $xpath->query('//input')->item(0)->getAttribute('name'));
        self::assertSame('about:blank', $xpath->query('//form')->item(0)->getAttribute('action'));
        self::assertSame(2, $xpath->query('//script')->length);
        self::assertSame('anonymous', $xpath->query('//script[@src]')->item(0)->getAttribute('crossorigin'));
        self::assertSame('no-referrer', $xpath->query('//script[@src]')->item(0)->getAttribute('referrerpolicy'));
        $policy = $xpath->query('//head/meta')->item(0)->getAttribute('content');
        self::assertStringContainsString("form-action 'none'; connect-src 'none'", $policy);
        self::assertStringContainsString("'sha256-".base64_encode(hash('sha256', 'window.previewReady = true;', true))."'", $policy);
        self::assertStringNotContainsString("'unsafe-eval'", $policy);
        // libxml may serialize non-ASCII text as HTML entities.
        self::assertSame('Überprüfung', $xpath->query('//p')->item(0)->textContent);
    }

    public function testPreviewAllowsOnlyTheDatepickerAssetsNeededByEnabledInputs(): void
    {
        $html = (new FormPreviewService())->isolate('<html><head></head><body><form data-freeform data-scripts-datepicker>
            <input data-datepicker data-datepicker-enabled data-datepicker-locale="default">
            <input data-datepicker data-datepicker-enabled data-datepicker-locale="fr">
            <input data-datepicker data-datepicker-enabled data-datepicker-locale="fr">
            <input data-datepicker data-datepicker-enabled data-datepicker-locale="en">
            <input data-datepicker data-datepicker-enabled="0" data-datepicker-locale="de">
            <input data-datepicker data-datepicker-enabled="false" data-datepicker-locale="it">
            <input data-datepicker data-datepicker-enabled data-datepicker-locale="../../other">
            </form><input data-datepicker data-datepicker-enabled data-datepicker-locale="nl"></body></html>', 'CSRF');
        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $policy = (new \DOMXPath($document))->query('//head/meta')->item(0)->getAttribute('content');
        $base = 'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/';
        self::assertStringContainsString('script-src '.$base.'flatpickr.min.js '.$base.'l10n/fr.js;', $policy);
        self::assertStringContainsString("style-src 'unsafe-inline' ".$base.'flatpickr.min.css;', $policy);
        self::assertStringContainsString("connect-src 'none'", $policy);
        self::assertStringContainsString("form-action 'none'", $policy);
        self::assertStringNotContainsString("'unsafe-eval'", $policy);
    }

    #[TestWith(['<form data-freeform><input data-datepicker data-datepicker-enabled></form>'])]
    #[TestWith(['<form data-freeform data-scripts-datepicker><input data-datepicker data-datepicker-enabled="0"></form>'])]
    #[TestWith(['<form data-freeform data-scripts-datepicker><input data-datepicker data-datepicker-enabled="false"></form>'])]
    #[TestWith(['<form data-freeform data-scripts-datepicker><input type="date"></form>'])]
    #[TestWith(['<form data-freeform data-scripts-datepicker><input data-datepicker data-datepicker-enabled data-datepicker-kind="freeform"></form>'])]
    public function testPreviewDoesNotAllowDatepickerAssetsForFormsWithoutEnabledPickers(string $markup): void
    {
        $html = (new FormPreviewService())->isolate('<html><head></head><body>'.$markup.'</body></html>', 'CSRF');
        self::assertStringNotContainsString('cdnjs.cloudflare.com', $html);
        self::assertStringContainsString("script-src 'none'", $html);
    }

    public function testPreviewDoesNotRegisterContextOrExposeCsrfAndPayload(): void
    {
        $form = $this->getMockBuilder(Form::class)->disableOriginalConstructor()->onlyMethods(['getProperties'])->getMock();
        $bag = new PropertyBag($form);
        $form->method('getProperties')->willReturn($bag);
        (new \ReflectionProperty(Form::class, 'propertyBag'))->setValue($form, $bag);
        $form->setPreview();
        $bundled = new RenderTagEvent($form);
        $bundled->addScript('js/scripts/front-end/plugin/freeform.js');
        $bundled->addScript('/etc/passwd');
        self::assertFalse($bundled->isScriptsDisabled());
        self::assertStringContainsString('<script>', $bundled->getChunksAsString());
        self::assertStringNotContainsString('root:', $bundled->getChunksAsString());
        self::assertTrue($form->isPreview());
        self::assertTrue($form->isAvailable());
        self::assertStringStartsWith('preview-', $form->getHash());
        $fail = static function () { self::fail('Preview must not register or persist submission context'); };
        Event::on(Form::class, Form::EVENT_REGISTER_CONTEXT, $fail);
        Event::on(Form::class, Form::EVENT_PERSIST_STATE, $fail);

        try {
            $form->registerContext();
            $form->persistState();
        } finally {
            Event::off(Form::class, Form::EVENT_REGISTER_CONTEXT, $fail);
            Event::off(Form::class, Form::EVENT_PERSIST_STATE, $fail);
        }
        self::assertFalse($form->handleRequest($this->createMock(Request::class)));

        $render = new RenderTagEvent($form);
        $json = new OutputAsJsonEvent($form, []);
        $csrf = (new \ReflectionClass(CsrfInput::class))->newInstanceWithoutConstructor();
        $csrf->attachInput($render);
        $csrf->attachToJson($json);
        // Exercise the preview hooks without registering global form handlers.
        $payload = (new \ReflectionClass(PayloadStorage::class))->newInstanceWithoutConstructor();
        $payload->attachInput($render);
        $payload->attachJson($json);
        (new \ReflectionClass(SessionContext::class))->newInstanceWithoutConstructor()->addHiddenInputs($render);
        self::assertSame('', $render->getChunksAsString());
        self::assertSame([], $json->getJsonObject());
        $this->expectException(\LogicException::class);
        $form->submit(['productId' => 42]);
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function testPreviewExcludesControlPanelAssetsAndRestoresThemAfterRendering(bool $fail): void
    {
        $view = $this->getMockBuilder(View::class)->disableOriginalConstructor()->onlyMethods([])->getMock();
        $view->assetBundles = ['control-panel' => false];
        $view->js = [View::POS_END => ['cp' => 'window.controlPanel=true;']];
        $view->jsFiles = [View::POS_END => ['cp.js' => '<script src="cp.js"></script>']];
        $view->css = ['cp' => '<style>body{background:red}</style>'];
        $view->cssFiles = ['cp.css' => '<link href="cp.css">'];
        $view->metaTags = ['cp' => '<meta name="cp">'];
        $view->linkTags = ['cp' => '<link rel="icon" href="cp.ico">'];
        $previous = [];
        foreach (['assetBundles', 'js', 'jsFiles', 'css', 'cssFiles', 'metaTags', 'linkTags'] as $property) {
            $previous[$property] = $view->{$property};
        }
        $previousApp = \Craft::$app;
        \Craft::$app = new class($view) {
            public function __construct(private View $view) {}

            public function getView(): View
            {
                return $this->view;
            }
        };

        try {
            $method = new \ReflectionMethod(FormPreviewService::class, 'withIsolatedAssets');

            try {
                $result = $method->invoke(new FormPreviewService(), static function () use ($view, $previous, $fail) {
                    foreach ($previous as $property => $value) {
                        self::assertSame([], $view->{$property}, $property.' must not include CP assets');
                    }
                    $view->js[View::POS_END]['form'] = 'window.form=true;';
                    $view->assetBundles['form'] = false;
                    if ($fail) {
                        throw new \RuntimeException('Template failed');
                    }
                    // Rendering a page consumes its queues. This must not consume
                    // the CP queues saved before the preview started.
                    $view->clear();

                    return 'Rendered preview';
                });
                self::assertFalse($fail);
                self::assertSame('Rendered preview', $result);
            } catch (\RuntimeException $exception) {
                self::assertTrue($fail);
                self::assertSame('Template failed', $exception->getMessage());
            }
            foreach ($previous as $property => $value) {
                self::assertSame($value, $view->{$property});
            }
        } finally {
            \Craft::$app = $previousApp;
        }
    }

    public function testKnownBundledTemplateAssetsAreInlinedAndHashed(): void
    {
        $html = (new FormPreviewService())->isolate('<html><head><link rel="stylesheet" href="/cpresources/example/_main.css?v=1"></head><body><script src="/cpresources/example/_main.js?v=1"></script></body></html>', 'CSRF', [
            '/cpresources/example/_main.css' => 'body{padding:24px}',
            '/cpresources/example/_main.js' => 'window.sampleLoaded=true;',
        ]);
        self::assertStringNotContainsString('src=', $html);
        self::assertStringContainsString('<style>body{padding:24px}</style>', $html);
        self::assertStringContainsString('<script>window.sampleLoaded=true;</script>', $html);
        self::assertStringContainsString("'sha256-".base64_encode(hash('sha256', 'window.sampleLoaded=true;', true))."'", $html);
    }

    #[TestWith(['tailwind-4-light', true])]
    #[TestWith(['tailwind-4-dark', true])]
    #[TestWith(['tailwind-4-light', false])]
    #[TestWith(['tailwind-4-dark', false])]
    public function testRadioTemplatePreservesFollowingRowInPreview(string $template, bool $oneLine): void
    {
        $field = new class($oneLine) {
            public array $attributes;
            public array $options = [['value' => 'personal', 'label' => 'Personal'], ['value' => 'business', 'label' => 'Business']];
            public string $handle = 'type';
            public string $idAttribute = 'type';
            public string $value = 'personal';
            public bool $hasErrors = false;
            public string $renderContainerOpeningTag = '<fieldset id="type-field">';
            public string $renderContainerClosingTag = '</fieldset>';
            public string $renderLabel = '<legend>Type</legend>';
            public string $renderInstructions = '';
            public string $renderErrors = '<p id="type-errors"></p>';

            public function __construct(public bool $oneLine)
            {
                $this->attributes = [
                    'input' => new Attributes(['class' => 'radio']),
                    'optionLabel' => new Attributes(['class' => 'option-label']),
                ];
            }

            public function translateOptionLabel(array $option): string
            {
                return $option['label'];
            }
        };
        $twig = new Environment(new FilesystemLoader(__DIR__.'/../../templates/_templates/formatting'), ['autoescape' => false]);
        $markup = $twig->render($template.'/fields/radios.twig', ['field' => $field]);
        $html = (new FormPreviewService())->isolate('<html><head></head><body><form><div id="type-row">'.$markup.'</div><div id="name-row"><input name="firstName"></div></form></body></html>', 'CSRF');
        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $xpath = new \DOMXPath($document);
        self::assertSame(1, $xpath->query('//form/div[@id="name-row"]')->length);
        self::assertSame(1, $xpath->query('//fieldset[@id="type-field"]/p[@id="type-errors"]')->length);
        self::assertSame(2, $xpath->query('//fieldset[@id="type-field"]//input[@type="radio"]')->length);
    }

    public function testResolvedSamplePathBypassesCustomTemplateWithTheSameFilename(): void
    {
        $path = realpath(__DIR__.'/../../templates/_templates/formatting/tailwind-4-dark/index.twig');
        $sample = $this->createMock(FormTemplate::class);
        $sample->method('getFileName')->willReturn('tailwind-4-dark/index.twig');
        $sample->method('getFilePath')->willReturn($path);
        $custom = $this->createMock(FormTemplate::class);
        $custom->method('getFilePath')->willReturn('/custom/tailwind-4-dark/index.twig');
        $settings = $this->createMock(SettingsService::class);
        $settings->method('getCustomFormTemplates')->willReturn([$custom]);
        $settings->method('getSolspaceFormTemplates')->willReturn([$sample]);
        $service = $this->getMockBuilder(FormsService::class)->disableOriginalConstructor()->onlyMethods(['getSettingsService'])->getMock();
        $service->method('getSettingsService')->willReturn($settings);
        $form = $this->createMock(Form::class);
        $view = $this->createMock(View::class);
        $view->expects(self::once())->method('renderString')->with(file_get_contents($path), ['form' => $form], View::TEMPLATE_MODE_CP)->willReturn('<p>Sample</p>');
        $previousApp = \Craft::$app;
        \Craft::$app = (object) ['view' => $view, 'charset' => 'UTF-8'];

        try {
            self::assertSame('<p>Sample</p>', (string) $service->renderFormTemplate($form, $sample->getFilePath()));
        } finally {
            \Craft::$app = $previousApp;
        }
    }
}
