<?php

namespace Solspace\Freeform\Tests\Services;

use craft\services\Elements;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Services\SpamSubmissionsService;

#[CoversClass(SpamSubmissionsService::class)]
class SpamApprovalTest extends TestCase
{
    public function testFailedSaveLeavesTheSubmissionInSpamAndStopsApproval(): void
    {
        $previousApp = \Craft::$app;

        try {
            $submission = $this->createMock(SpamSubmission::class);
            $submission->isSpam = true;
            $elements = $this->createMock(Elements::class);
            $elements->expects(self::once())->method('saveElement')->with($submission, false, false, false)->willReturn(false);
            \Craft::$app = (object) ['elements' => $elements];
            $service = $this->getMockBuilder(SpamSubmissionsService::class)->onlyMethods(['convertToSubmission'])->getMock();
            $service->expects(self::never())->method('convertToSubmission');
            self::assertFalse($service->allowSpamSubmission($submission));
            self::assertTrue($submission->isSpam);
        } finally {
            \Craft::$app = $previousApp;
        }
    }
}
