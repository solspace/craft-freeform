<?php

namespace Solspace\Freeform\Tests\Models;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Models\Settings;

#[CoversClass(Settings::class)]
class SettingsTest extends TestCase
{
    public function testBuilderTemplatesStayWithinTheConfiguredSiteDirectory(): void
    {
        $root = sys_get_temp_dir().'/freeform-builder-'.bin2hex(random_bytes(5));
        mkdir($root.'/sections/nested', 0777, true);
        file_put_contents($root.'/sections/hero.twig', "{# name: Landing hero #}\n{# description: A welcoming headline. #}\n<h1>Hero</h1>");
        file_put_contents($root.'/sections/nested/card.twig', '<p>Card</p>');
        file_put_contents($root.'/sections/note.txt', 'Not a template');
        foreach (['navigation', 'hero', 'feature-cards', 'faq', 'footer', 'sidebar'] as $sample) {
            copy(__DIR__.'/../../Resources/builder-samples/sample-'.$sample.'.twig', $root.'/sections/sample-'.$sample.'.twig');
        }
        $previousApp = \Yii::$app;
        \Yii::$app = (object) ['path' => new class($root) {
            public function __construct(private string $root) {}

            public function getSiteTemplatesPath(): string
            {
                return $this->root;
            }
        }];

        try {
            $settings = $this->normalize(['builderTemplateDirectory' => 'sections']);
            self::assertSame('Landing hero', $settings->listBuilderTemplates()['hero.twig']);
            self::assertSame('nested/card.twig', $settings->listBuilderTemplates()['nested/card.twig']);
            self::assertSame(
                ['name' => 'Landing hero', 'description' => 'A welcoming headline.', 'preview' => 'hero'],
                $settings->getBuilderTemplateDetails()['hero.twig'],
            );
            foreach (['navigation' => 'navigation', 'hero' => 'hero', 'feature-cards' => 'cards', 'faq' => 'faq', 'footer' => 'footer', 'sidebar' => 'sidebar'] as $sample => $preview) {
                self::assertSame($preview, $settings->getBuilderTemplateDetails()['sample-'.$sample.'.twig']['preview']);
            }
            $settings->builderTemplateDirectory = '../outside';
            self::assertSame([], $settings->listBuilderTemplates());
            $settings->builderTemplateDirectory = '/tmp';
            self::assertSame([], $settings->listBuilderTemplates());
        } finally {
            \Yii::$app = $previousApp;
            unlink($root.'/sections/hero.twig');
            unlink($root.'/sections/nested/card.twig');
            unlink($root.'/sections/note.txt');
            foreach (glob($root.'/sections/sample-*.twig') ?: [] as $sample) {
                unlink($sample);
            }
            rmdir($root.'/sections/nested');
            rmdir($root.'/sections');
            rmdir($root);
        }
    }

    public function testFormCreationOptionsDefaultToAllAndPreserveTheirDisplayOrder(): void
    {
        $settings = $this->normalize([]);
        self::assertSame(['wizard', 'ai', 'blank'], $settings->getEnabledFormCreationOptions());
        $settings->formCreationOptions = ['blank', 'wizard', 'wizard'];
        self::assertSame(['wizard', 'blank'], $settings->getEnabledFormCreationOptions());
        $settings->formCreationOptions = ['ai'];
        self::assertSame(['ai'], $settings->getEnabledFormCreationOptions());
    }

    public function testFormCreationOptionsRejectEmptyAndUnknownChoices(): void
    {
        foreach (['', [], ['unknown'], ['wizard', 'unknown']] as $value) {
            $settings = $this->normalize(['formCreationOptions' => $value]);
            $settings->validate(['formCreationOptions']);
            self::assertTrue($settings->hasErrors('formCreationOptions'));
        }
    }

    public function testDefaultBooleanStringsAreNormalized(): void
    {
        $settings = $this->normalize([]);

        $this->assertSame('0', $settings->sitesEnabled);
        $this->assertSame('0', $settings->allowDashesInFieldHandles);
        $this->assertSame('0', $settings->exportTrackedUrlParameters);
        $this->assertSame('1', $settings->abTests);
        $this->assertSame('1', $settings->formSubmitDisable);
    }

    public function testStoredBooleanStringsAreNormalized(): void
    {
        $settings = $this->normalize([
            'sitesEnabled' => 'false',
            'abTests' => 'TRUE',
            'useIdempotencyKey' => 'False',
        ]);

        $this->assertSame('0', $settings->sitesEnabled);
        $this->assertSame('1', $settings->abTests);
        $this->assertSame('0', $settings->useIdempotencyKey);
    }

    public function testOtherValuesAreLeftUntouched(): void
    {
        $settings = $this->normalize([
            'sitesEnabled' => '$FREEFORM_SITES_ENABLED',
            'useQueueForEmailNotifications' => '1',
            'removeNewlines' => '',
            'pluginName' => 'false',
        ]);

        $this->assertSame('$FREEFORM_SITES_ENABLED', $settings->sitesEnabled);
        $this->assertSame('1', $settings->useQueueForEmailNotifications);
        $this->assertSame('', $settings->removeNewlines);
        $this->assertSame('false', $settings->pluginName);
    }

    /**
     * The full constructor builds form builder defaults that need a Craft app,
     * so create the model without it and run the normalization directly.
     */
    private function normalize(array $values): Settings
    {
        $reflection = new \ReflectionClass(Settings::class);
        $settings = $reflection->newInstanceWithoutConstructor();

        foreach ($values as $property => $value) {
            $settings->{$property} = $value;
        }

        $reflection->getMethod('normalizeBooleanStrings')->invoke($settings);

        return $settings;
    }
}
