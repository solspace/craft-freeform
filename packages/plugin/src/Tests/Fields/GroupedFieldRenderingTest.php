<?php

namespace Solspace\Freeform\Tests\Fields;

use CraftCms\Cms\Twig\TokenParsers\TagTokenParser;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Implementations\MultipleSelectField;
use Solspace\Freeform\Fields\Implementations\Pro\CardsField;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Fields\Implementations\Pro\OpinionScaleField;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use Solspace\Freeform\Fields\Implementations\RadiosField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Properties\Cards\Card;
use Solspace\Freeform\Fields\Properties\Cards\CardCollection;
use Solspace\Freeform\Fields\Properties\OpinionScale\Scale;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\CardAttributesCollection;
use Solspace\Freeform\Library\Translations\TranslationTable;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\Loader\ChainLoader;
use Twig\Loader\FilesystemLoader;
use Twig\TokenParser\DoTokenParser;
use Twig\TwigFilter;
use Twig\TwigTest;

/** @coversNothing */
class GroupedFieldRenderingTest extends TestCase
{
    #[DataProvider('fields')]
    public function testSharedRenderingNamesGroupsAndConnectsInstructionsAndErrors(string $class): void
    {
        $field = $this->field($class);
        $field->addError('Choose an option.');
        $html = (string) $field->render();
        $xpath = $this->xpath($html);
        self::assertSame(1, $xpath->query('//fieldset')->length, $html);
        self::assertSame(1, $xpath->query('//fieldset/legend')->length, $html);
        self::assertSame('Choices', $xpath->evaluate('string(//fieldset/legend)'));
        self::assertSame(0, $xpath->query('//legend[@for]')->length);
        foreach ($xpath->query('//input | //select') as $input) {
            self::assertSame('true', $input->getAttribute('aria-invalid'));
            foreach (explode(' ', $input->getAttribute('aria-describedby')) as $id) {
                self::assertSame(1, $xpath->query('//*[@id="'.$id.'"]')->length, $html);
            }
        }
        if (MultipleSelectField::class === $class) {
            self::assertSame('choices-legend', $xpath->evaluate('string(//select/@aria-labelledby)'));
        }
    }

    public static function fields(): iterable
    {
        foreach ([RadiosField::class, CheckboxesField::class, MultipleSelectField::class, RatingField::class, OpinionScaleField::class, CardsField::class, GroupField::class, SignatureField::class] as $class) {
            yield $class => [$class];
        }
    }

    #[DataProvider('sampleFields')]
    public function testEverySampleRendersOneNamedGroup(string $class, string $template): void
    {
        $root = __DIR__.'/../../templates/_templates/formatting';
        $aliases = [];
        foreach (glob($root.'/*/_row.twig') as $row) {
            $aliases['freeform/_templates/formatting/'.basename(\dirname($row)).'/_row.twig'] = file_get_contents($row);
        }
        $twig = new Environment(new ChainLoader([new ArrayLoader($aliases), new FilesystemLoader($root)]), ['autoescape' => false]);
        $twig->addTokenParser(new TagTokenParser());
        $twig->addTokenParser(new DoTokenParser());
        $twig->addFilter(new TwigFilter('t', static fn ($text) => $text));
        $twig->addTest(new TwigTest('object', 'is_object'));
        $twig->addTest(new TwigTest('numeric', 'is_numeric'));
        $html = $twig->render($template, ['field' => $this->field($class)]);
        $xpath = $this->xpath($html);
        self::assertSame(1, $xpath->query('//fieldset')->length, $template);
        self::assertSame(1, $xpath->query('//fieldset/legend')->length, $template);
        self::assertSame(0, $xpath->query('//legend[@for]')->length, $template);
        foreach ($xpath->query('//input[@type="radio" or @type="checkbox"]') as $input) {
            if ($input->hasAttribute('aria-label')) {
                self::assertNotSame('', $input->getAttribute('aria-label'));

                continue;
            }
            $id = $input->getAttribute('id');
            self::assertTrue($xpath->query('ancestor::label', $input)->length > 0 || ($id && $xpath->query('//label[@for="'.$id.'"]')->length > 0), $template);
        }
    }

    public static function sampleFields(): iterable
    {
        $root = __DIR__.'/../../templates/_templates/formatting';
        foreach (glob($root.'/*', \GLOB_ONLYDIR) as $directory) {
            foreach ([RadiosField::class => 'radios', CheckboxesField::class => 'checkboxes', MultipleSelectField::class => 'multiple-select', RatingField::class => 'rating', OpinionScaleField::class => 'opinion-scale', CardsField::class => 'cards', GroupField::class => 'group', SignatureField::class => 'signature'] as $class => $type) {
                $template = is_file($directory.'/fields/'.$type.'.twig') ? $type : '_default';

                yield basename($directory).'/'.$type => [$class, basename($directory).'/fields/'.$template.'.twig'];
            }
        }
    }

    public function testTextFieldsKeepTheirIndividualLabel(): void
    {
        $xpath = $this->xpath((string) $this->field(TextField::class)->render());
        self::assertSame(0, $xpath->query('//fieldset')->length);
        self::assertSame('choices', $xpath->evaluate('string(//label/@for)'));
    }

    public function testRatingOptionsFollowVisualAndKeyboardOrderAndHaveNames(): void
    {
        $xpath = $this->xpath((string) $this->field(RatingField::class)->render());
        $values = [];
        foreach ($xpath->query('//input[@type="radio"]') as $input) {
            $values[] = $input->getAttribute('value');
            self::assertNotSame('', $input->getAttribute('aria-label'));
        }
        self::assertSame(['1', '2', '3', '4', '5'], $values);
    }

    private function field(string $class, string $handle = 'choices', string $label = 'Choices'): AbstractField
    {
        $methods = ['getIdAttribute', 'getInstructions', 'getLabel', 'getHandle', 'translate'];
        if (SignatureField::class === $class) {
            $methods[] = 'getTranslationTable';
        }
        if (OpinionScaleField::class === $class) {
            $methods = [...$methods, 'getScales', 'getLegends'];
        }
        if (is_a($class, CardsField::class, true)) {
            $methods = [...$methods, 'getLayout', 'getCardAttributes'];
        } elseif (method_exists($class, 'getOptions')) {
            $methods[] = 'getOptions';
        }
        $field = $this->getMockBuilder($class)->setConstructorArgs([$this->createMock(Form::class)])->onlyMethods($methods)->getMock();
        if ($field instanceof SignatureField) {
            $field->method('getTranslationTable')->willReturn(new TranslationTable());
        }
        $field->method('getIdAttribute')->willReturn($handle);
        $field->method('getInstructions')->willReturn('Choose your preferred options.');
        $field->method('getLabel')->willReturn($label);
        $field->method('getHandle')->willReturn($handle);
        $field->method('translate')->willReturnCallback(static fn ($key, $default = null) => $default);
        if ($field instanceof CardsField) {
            $cards = new CardCollection();
            foreach (['one' => 'First', 'two' => 'Second'] as $value => $cardLabel) {
                $card = new Card();
                $card->id = $value;
                $card->value = $value;
                $card->label = $cardLabel;
                $card->description = 'Option description';
                $card->assetId = null;
                $cards->add($card);
            }
            $field->method('getLayout')->willReturn($cards);
            $field->method('getCardAttributes')->willReturn(new CardAttributesCollection());
        } elseif (method_exists($class, 'getOptions')) {
            $options = new OptionCollection();
            $options->add('one', 'First');
            $options->add('two', 'Second');
            $field->method('getOptions')->willReturn($options);
        }

        if ($field instanceof OpinionScaleField) {
            $field->method('getScales')->willReturn([new Scale('one', 'First'), new Scale('two', 'Second')]);
            $field->method('getLegends')->willReturn([]);
        }
        if ($field instanceof CheckboxesField || $field instanceof MultipleSelectField || $field instanceof CardsField) {
            $field->setValue([]);
        }

        return $field;
    }

    private function xpath(string $html): \DOMXPath
    {
        $dom = new \DOMDocument();
        @$dom->loadHTML('<html><body>'.$html.'</body></html>');

        return new \DOMXPath($dom);
    }
}
