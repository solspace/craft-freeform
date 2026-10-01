<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use Illuminate\Container\Container;
use Illuminate\Http\Request;
use Illuminate\Support\MessageBag;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Models\Settings;
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
        foreach (['selectField', 'booleanMenuField', 'lightswitchField', 'textField', 'field', 'text', 'select'] as $name) {
            $macros .= '{% macro '.$name.'(config, input) %}'.$field.'{% endmacro %}';
        }

        $twig = new Environment(new ChainLoader([
            new ArrayLoader([
                'freeform/_layouts/settings' => '{% block content %}{% endblock %}',
                '_includes/forms' => $macros,
            ]),
            new FilesystemLoader(\dirname(__DIR__, 3).'/templates'),
        ]));
        $twig->addFilter(new TwigFilter('t', static fn (string $text): string => $text));
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
