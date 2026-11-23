<?php

namespace Solspace\Freeform\Tests\Services;

use craft\services\Elements;
use craft\services\Search;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Services\IntegrationsQueueService;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Services\SpamSubmissionsService;
use Solspace\Freeform\Services\SubmissionsService;
use yii\caching\ArrayCache;
use yii\caching\TagDependency;

#[CoversClass(SpamSubmissionsService::class)]
class SpamSubmissionsServiceTest extends TestCase
{
    #[TestWith([true])]
    #[TestWith([false])]
    public function testAllowedSubmissionsAreIndexedBeforePostProcessingWhenEnabled(bool $updateSearchIndexes): void
    {
        $previousApp = \Craft::$app;
        $previousYiiApp = \Yii::$app;
        $layout = $this->createMock(FormLayout::class);
        $layout->method('getFields')->willReturn(new FieldCollection());
        $form = $this->createMock(Form::class);
        $form->method('getLayout')->willReturn($layout);
        $submission = $this->createMock(SpamSubmission::class);
        $submission->id = 123;
        $submission->isSpam = true;
        $submission->method('getForm')->willReturn($form);

        $elements = $this->getMockBuilder(Elements::class)->disableOriginalConstructor()->onlyMethods(['saveElement'])->getMock();
        $elements->expects(self::once())->method('saveElement')
            ->with($submission, false, false, false)
            ->willReturn(true)
        ;
        $indexed = false;
        $converted = false;
        $search = $this->createMock(Search::class);
        $search->expects($updateSearchIndexes ? self::once() : self::never())
            ->method('indexElementAttributes')->with($submission)
            ->willReturnCallback(static function () use ($submission, &$converted, &$indexed) {
                self::assertFalse($submission->isSpam);
                self::assertTrue($converted);
                $indexed = true;

                return true;
            })
        ;
        $cache = new ArrayCache();
        $cache->set('unrelated', 'warm');
        $postProcessing = $this->createMock(SubmissionsService::class);
        $postProcessing->expects(self::once())->method('postProcessSubmission')->with($form, $submission)
            ->willReturnCallback(static function () use ($updateSearchIndexes, &$indexed, $cache) {
                self::assertSame($updateSearchIndexes, $indexed);
                self::assertFalse($cache->get('spam-list'));
                self::assertFalse($cache->get('submission-list'));
                self::assertFalse($cache->get('submission-search'));
                self::assertSame('warm', $cache->get('unrelated'));
            })
        ;
        $queue = $this->createMock(IntegrationsQueueService::class);
        $queue->expects(self::once())->method('deleteTasksBySubmissionId')->with(123);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
        $plugin->method('__get')->willReturnMap([['integrationsQueue', $queue], ['submissions', $postProcessing]]);
        \Craft::$app = \Yii::$app = new class($elements, $search, $cache, $plugin) {
            public array $loadedModules;

            public function __construct(public Elements $elements, private Search $search, public ArrayCache $cache, Freeform $plugin)
            {
                $this->loadedModules = [Freeform::class => $plugin];
            }

            public function getSearch(): Search
            {
                return $this->search;
            }

            public function getElements(): Elements
            {
                return $this->elements;
            }

            public function getCache(): ArrayCache
            {
                return $this->cache;
            }
        };

        try {
            $cache->set('spam-list', [123], 0, new TagDependency(['tags' => 'element::'.SpamSubmission::class]));
            $cache->set('submission-list', [], 0, new TagDependency(['tags' => 'element::'.Submission::class]));
            $cache->set('submission-search', [], 0, new TagDependency(['tags' => ['element::'.Submission::class, 'element-search-query::'.Submission::class]]));

            $settings = $this->createMock(SettingsService::class);
            $settings->method('isUpdateSearchIndexes')->willReturn($updateSearchIndexes);
            $service = $this->getMockBuilder(SpamSubmissionsService::class)->onlyMethods(['getSettingsService', 'convertToSubmission'])->getMock();
            $service->method('getSettingsService')->willReturn($settings);
            $service->expects(self::once())->method('convertToSubmission')->with($submission)->willReturnCallback(static function () use (&$converted) {
                $converted = true;
            });

            self::assertTrue($service->allowSpamSubmission($submission));
        } finally {
            \Craft::$app = $previousApp;
            \Yii::$app = $previousYiiApp;
        }
    }
}
