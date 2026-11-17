<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Form\Bags\PropertyBag;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Jobs\ProcessSubmissionJob;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\SubmissionProcessingService;
use Solspace\Freeform\Services\SubmissionsService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;
use yii\di\Container;

#[CoversNothing]
class ProcessSubmissionJobTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith([false, false])]
    #[TestWith([true, false])]
    #[TestWith([false, true])]
    public function testWorkerReloadsValuesAndRestoresSiteLanguageAndSuppressorsEvenOnFailure(bool $fails, bool $spam): void
    {
        $sites = new class {
            public int $id = 1;

            public function getCurrentSite(): object
            {
                return (object) ['id' => $this->id, 'handle' => 'site'.$this->id, 'language' => 1 === $this->id ? 'en' : 'de'];
            }

            public function setCurrentSite($id): void
            {
                $this->id = $id;
            }
        };
        $form = $this->createMock(Form::class);
        $bag = new PropertyBag($form);
        $bag->set(Form::DATA_DISABLE, ['webhooks' => true]);
        $form->method('getProperties')->willReturn($bag);
        $submission = $this->createMock(Submission::class);
        $submission->id = 123;
        $submission->isSpam = $spam;
        $form->expects($spam ? self::never() : self::once())->method('valuesFromSubmission')->with($submission);
        $form->expects($spam ? self::never() : self::once())->method('setSubmission')->with($submission)->willReturnSelf();
        $forms = $this->createMock(FormsService::class);
        $forms->expects(self::once())->method('getFormById')->with(4, 'site2')->willReturn($form);
        $submissions = $this->createMock(SubmissionsService::class);
        $submissions->method('getSubmissionById')->with(123)->willReturn($submission);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
        $plugin->method('__get')->willReturnMap([['forms', $forms], ['submissions', $submissions]]);
        app()->instance(Freeform::class, $plugin);
        $processor = $this->createMock(SubmissionProcessingService::class);
        $processor->expects($spam ? self::never() : self::once())->method('process')->with($form, $submission)->willReturnCallback(static function () use ($sites, $bag, $fails) {
            self::assertSame(2, $sites->id);
            self::assertSame('de', \Craft::$app->language);
            self::assertSame(['notifications' => true], $bag->get(Form::DATA_DISABLE));
            if ($fails) {
                throw new \RuntimeException('retry this step');
            }
        });
        $beforeApp = \Craft::$app;
        $beforeContainer = \Craft::$container;
        \Craft::$app = new class($sites) {
            public string $language = 'fr';

            public function __construct(private object $sites) {}

            public function getSites(): object
            {
                return $this->sites;
            }
        };
        \Craft::$container = new Container();
        \Craft::$container->set(SubmissionProcessingService::class, $processor);

        try {
            $job = new ProcessSubmissionJob(['formId' => 4, 'submissionId' => 123, 'siteId' => 2, 'disabled' => ['notifications' => true]]);
            // A separate worker receives only serialized job state.
            $job = unserialize(serialize($job));

            try {
                $job->execute(null);
                self::assertFalse($fails);
            } catch (\RuntimeException $e) {
                self::assertTrue($fails);
                self::assertSame('retry this step', $e->getMessage());
            }
            self::assertSame(1, $sites->id);
            self::assertSame('fr', \Craft::$app->language);
            self::assertSame(['webhooks' => true], $bag->get(Form::DATA_DISABLE));
        } finally {
            \Craft::$app = $beforeApp;
            \Craft::$container = $beforeContainer;
        }
    }
}
