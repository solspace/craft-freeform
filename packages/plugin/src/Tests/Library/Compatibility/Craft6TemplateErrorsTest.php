<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use Illuminate\Container\Container;
use Illuminate\Http\Request;
use Illuminate\Session\ArraySessionHandler;
use Illuminate\Session\Store;
use Illuminate\Support\MessageBag;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Form\Types\Surveys\Models\SurveySettings;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\Notifications\NotificationWrapperRecord;
use Solspace\Freeform\Records\PdfTemplateRecord;
use Solspace\Freeform\Records\Pro\ExportNotificationRecord;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\Loader\ChainLoader;
use Twig\Loader\FilesystemLoader;
use Twig\TwigFilter;
use Twig\TwigFunction;

/**
 * @coversNothing
 */
#[CoversNothing]
class Craft6TemplateErrorsTest extends TestCase
{
    private Container $previousContainer;

    protected function setUp(): void
    {
        $this->previousContainer = Container::getInstance();
        Container::setInstance(new Container());
        app()->instance('request', Request::create('/login'));
        app()->instance('session', new Store('test', new ArraySessionHandler(120)));
    }

    protected function tearDown(): void
    {
        Container::setInstance($this->previousContainer);
    }

    public function testEmptySettingsErrorsRenderAsEmptyFieldLists(): void
    {
        $errors = $this->renderSpamSettings(new Settings());

        self::assertNotEmpty($errors);
        foreach ($errors as $messages) {
            self::assertSame([], $messages);
        }
    }

    public function testSettingsErrorsOnlyAppearOnTheirOwnField(): void
    {
        $settings = new Settings();
        $settings->addError('spamFolderEnabled', 'Choose a valid spam folder setting.');
        $settings->addError('minimumSubmitTime', 'Use a positive number.');

        $errors = $this->renderSpamSettings($settings);

        self::assertSame(['Choose a valid spam folder setting.'], $errors['settings[spamFolderEnabled]']);
        self::assertSame(['Use a positive number.'], $errors['settings[minimumSubmitTime]']);
        self::assertSame([], $errors['settings[bypassSpamCheckOnLoggedInUsers]']);
    }

    public function testSubmissionFieldReceivesItsNativeMessageBagErrors(): void
    {
        $submission = $this->createMock(Submission::class);
        $submission->method('errors')->willReturn(new MessageBag([
            'firstName' => ['Enter your first name.'],
            'email' => ['Enter a valid email.'],
        ]));

        $html = $this->twig()->render('submissions/fields/text.twig', [
            'submission' => $submission,
            'field' => ['handle' => 'firstName', 'label' => 'First Name', 'required' => true],
        ]);

        self::assertSame(['firstName' => ['Enter your first name.']], $this->readErrors($html));
    }

    public function testFormCreationSettingsReceiveOnlyTheirOwnNativeErrors(): void
    {
        $settings = new Settings();
        $settings->addError('formCreationOptions', 'Choose at least one option.');
        $settings->addError('defaultAiIntegration', 'Choose an available integration.');
        $errors = $this->readErrors($this->twig()->render('settings/_general.twig', [
            'settings' => $settings,
            'readOnly' => false,
            'aiIntegrations' => [],
            'forms' => [],
            'craft' => ['freeform' => ['name' => 'Freeform', 'pro' => true]],
        ]));

        self::assertSame(['Choose at least one option.'], $errors['settings[formCreationOptions]']);
        self::assertSame(['Choose an available integration.'], $errors['settings[defaultAiIntegration]']);
        self::assertSame([], $errors['settings[defaultView]']);
    }

    public function testSurveySwitchReceivesOnlyItsOwnErrors(): void
    {
        $settings = new SurveySettings();
        $loader = $this->twig();
        $source = file_get_contents(\dirname(__DIR__, 3).'/Bundles/Form/Types/Surveys/Templates/settings.twig');
        $loader->getLoader()->addLoader(new ArrayLoader(['survey-settings.twig' => explode('{% css %}', $source)[0]]));
        $context = [
            'settings' => $settings,
            'readOnly' => false,
            'fieldTypes' => [],
            'options' => [],
            'craft' => ['freeform' => ['name' => 'Freeform']],
        ];
        $settings->chartTypes = [];
        $errors = $this->readErrors($loader->render('survey-settings.twig', $context));
        self::assertSame([], $errors['highlightHighest']);

        $settings->addError('highlightHighest', 'Choose a valid highlight setting.');
        $errors = $this->readErrors($loader->render('survey-settings.twig', $context));
        self::assertSame(['Choose a valid highlight setting.'], $errors['highlightHighest']);
    }

    public function testNewWrapperRendersNullAttributesWithoutCallingThemAsMethods(): void
    {
        $wrapper = $this->createMock(NotificationWrapperRecord::class);
        $wrapper->method('getAttribute')->willReturnCallback(static fn (string $name) => 'content' === $name ? '{{ emailBody }}' : null);
        $wrapper->method('getErrors')->willReturn([]);
        $twig = $this->twig();
        $source = file_get_contents(\dirname(__DIR__, 3).'/templates/notifications/wrappers/edit.twig');
        $source = str_replace(['{% js %}', '{% endjs %}'], ['{% block script %}', '{% endblock %}'], $source);
        $twig->getLoader()->addLoader(new ArrayLoader([
            'wrapper-edit.twig' => $source,
            'freeform/notifications/_layout' => '{% block content %}{% endblock %}{% block script %}{% endblock %}',
        ]));
        $twig->addFilter(new TwigFilter('hash', static fn ($value) => $value));
        $html = $twig->render('wrapper-edit.twig', [
            'wrapper' => $wrapper,
            'title' => 'New Wrapper',
            'craft' => ['freeform' => ['name' => 'Freeform'], 'app' => ['request' => ['getSegment' => null]]],
        ]);

        self::assertStringContainsString('new Craft.HandleGenerator', $html);
        self::assertStringContainsString('freeform/notifications/wrappers/save', $html);
        self::assertStringContainsString('emailBody', $html);
    }

    public function testNewPdfTemplateRendersEmptyAttributes(): void
    {
        $template = $this->createMock(PdfTemplateRecord::class);
        $template->method('getAttribute')->willReturn(null);
        $template->method('getErrors')->willReturn([]);
        $twig = $this->twig();
        $source = file_get_contents(\dirname(__DIR__, 3).'/templates/pdf-templates/edit.twig');
        $source = str_replace(['{% js %}', '{% endjs %}'], ['{% block script %}', '{% endblock %}'], $source);
        $twig->getLoader()->addLoader(new ArrayLoader(['pdf-edit.twig' => $source]));
        $twig->addFilter(new TwigFilter('hash', static fn ($value) => $value));
        $html = $twig->render('pdf-edit.twig', [
            'template' => $template,
            'title' => 'New PDF Template',
            'craft' => ['freeform' => ['name' => 'Freeform']],
        ]);

        self::assertStringContainsString('freeform/pdf/pdf-templates/save', $html);
        self::assertStringContainsString('name="id" value=""', $html);
        self::assertSame([], $this->readErrors($html)['fileName']);
    }

    public function testNewExportNotificationRendersEmptyAttributes(): void
    {
        $notification = $this->createMock(ExportNotificationRecord::class);
        $notification->method('getAttribute')->willReturn(null);
        $notification->method('getRecipientArray')->willReturn([]);
        $notification->method('getErrors')->willReturn([]);
        $twig = $this->twig();
        $source = file_get_contents(\dirname(__DIR__, 3).'/templates/export/notifications/edit.twig');
        $source = str_replace(['{% js %}', '{% endjs %}'], ['{% block script %}', '{% endblock %}'], $source);
        $twig->getLoader()->addLoader(new ArrayLoader([
            'export-notification-edit.twig' => $source,
            'freeform/export/_layout' => '{% block content %}{% endblock %}{% block script %}{% endblock %}',
        ]));
        $twig->addFilter(new TwigFilter('hash', static fn ($value) => $value));
        $html = $twig->render('export-notification-edit.twig', [
            'notification' => $notification,
            'craft' => [
                'freeform' => ['name' => 'Freeform', 'pro' => true],
                'freeformServices' => ['exportProfiles' => ['allNamesById' => [], 'exporterTypes' => []]],
            ],
        ]);

        self::assertStringContainsString('freeform/export/notifications/save', $html);
        self::assertStringNotContainsString('name="notificationId"', $html);
        self::assertSame([], $this->readErrors($html)['profileId']);
    }

    private function renderSpamSettings(Settings $settings): array
    {
        return $this->readErrors($this->twig()->render('settings/_spam.twig', [
            'settings' => $settings,
            'readOnly' => false,
            'craft' => ['freeform' => ['name' => 'Freeform']],
        ]));
    }

    private function twig(): Environment
    {
        $field = '<script data-field="{{ config.name }}" type="application/json">{{ (config.errors ?? [])|fieldErrors|json_encode|raw }}</script>';
        $macros = '';
        foreach (['checkboxSelectField', 'selectField', 'booleanMenuField', 'lightswitchField', 'textField', 'textareaField', 'autosuggestField', 'field', 'text', 'select'] as $name) {
            $macros .= '{% macro '.$name.'(config, input) %}'.$field.'{% endmacro %}';
        }

        $twig = new Environment(new ChainLoader([
            new ArrayLoader([
                'freeform/_layouts/settings' => '{% block content %}{% endblock %}',
                '_includes/forms' => $macros,
                'freeform/_components/boolean-menu' => file_get_contents(\dirname(__DIR__, 3).'/templates/_components/boolean-menu.twig'),
            ]),
            new FilesystemLoader(\dirname(__DIR__, 3).'/templates'),
        ]));
        $twig->addFilter(new TwigFilter('t', static fn (string $text): string => $text));
        $twig->addFunction(new TwigFunction('freeformBooleanMenu', static fn (array $config): string => ''));
        $twig->addFilter(new TwigFilter('fieldErrors', static function ($errors): array {
            self::assertIsArray($errors, 'The CP field must receive a list of messages, not a MessageBag.');

            return $errors;
        }));
        foreach (['url', 'cpUrl', 'redirectInput', 'csrfInput'] as $name) {
            $twig->addFunction(new TwigFunction($name, static fn (string $path = ''): string => $path));
        }

        return $twig;
    }

    private function readErrors(string $html): array
    {
        preg_match_all('/<script data-field="([^"]+)" type="application\/json">(.*?)<\/script>/s', $html, $matches, \PREG_SET_ORDER);

        $errors = [];
        foreach ($matches as $match) {
            $errors[html_entity_decode($match[1])] = json_decode($match[2], true, flags: \JSON_THROW_ON_ERROR);
        }

        return $errors;
    }
}
