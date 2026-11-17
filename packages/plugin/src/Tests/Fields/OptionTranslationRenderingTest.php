<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\BaseGeneratedOptionsField;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\MultipleSelectField;
use Solspace\Freeform\Fields\Implementations\RadiosField;
use Solspace\Freeform\Fields\Properties\Options\Custom\Custom;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Translations\TranslationTable;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;
use Twig\TwigFilter;

/** @coversNothing */
class OptionTranslationRenderingTest extends TestCase
{
    #[DataProvider('renderers')]
    public function testTranslatedOptionLabelsPreserveSubmittedValues(string $class, ?string $template): void
    {
        $field = $this->getMockBuilder($class)->setConstructorArgs([$this->createMock(Form::class)])
            ->onlyMethods(['getIdAttribute', 'getInstructions', 'getLabel', 'getHandle', 'getTranslationTable'])->getMock()
        ;
        $field->method('getIdAttribute')->willReturn('choices');
        $field->method('getInstructions')->willReturn('');
        $field->method('getLabel')->willReturn('Choices');
        $field->method('getHandle')->willReturn('choices');
        $field->method('getTranslationTable')->willReturn(new TranslationTable((object) [
            'optionConfiguration' => (object) ['options' => [(object) ['value' => 'one', 'label' => 'Premier choix']]],
        ]));
        (new \ReflectionProperty(BaseGeneratedOptionsField::class, 'optionConfiguration'))->setValue($field, new Custom([
            'options' => [['value' => 'one', 'label' => 'Original choice'], ['value' => 'two', 'label' => 'Untranslated fallback']],
        ]));
        $field->setValue($field instanceof CheckboxesField || $field instanceof MultipleSelectField ? [] : '');
        if (null === $template) {
            $html = (string) $field->render();
        } else {
            $twig = new Environment(new FilesystemLoader(__DIR__.'/../../templates/_templates/formatting'), ['autoescape' => false]);
            $twig->addFilter(new TwigFilter('t', static fn ($text) => $text));
            $html = $twig->render($template, ['field' => $field]);
        }
        self::assertStringContainsString('Premier choix', $html);
        self::assertStringNotContainsString('Original choice', $html);
        self::assertStringContainsString('Untranslated fallback', $html);
        self::assertStringContainsString('value="one"', $html);
        self::assertStringContainsString('value="two"', $html);
    }

    public static function renderers(): iterable
    {
        foreach ([RadiosField::class => 'radios', CheckboxesField::class => 'checkboxes', DropdownField::class => 'dropdown', MultipleSelectField::class => 'multiple-select'] as $class => $type) {
            yield 'default/'.$type => [$class, null];
            foreach (glob(__DIR__.'/../../templates/_templates/formatting/*', \GLOB_ONLYDIR) as $directory) {
                $template = is_file($directory.'/fields/'.$type.'.twig') ? $type : '_default';

                yield basename($directory).'/'.$type => [$class, basename($directory).'/fields/'.$template.'.twig'];
            }
        }
    }
}
