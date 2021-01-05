<?php

namespace Solspace\Freeform\Commands;

use Carbon\Carbon;
use craft\console\Controller;
use Solspace\Freeform\Freeform;
use yii\console\ExitCode;
use yii\helpers\Console;

class NotificationsController extends Controller
{
    /** @var string */
    public $rangeStart;

    /** @var string */
    public $rangeEnd;

    /**
     * Sends the weekly digest notification.
     */
    public function actionDigest(): int
    {
        $rangeStart = new Carbon('last Monday', 'UTC');
        $rangeStart->setTime(0, 0, 0);
        $rangeEnd = $rangeStart->copy()->addDays('7');
        $rangeEnd->setTime(23, 59, 59);

        Freeform::getInstance()->digest->sendDigest($rangeStart, $rangeEnd);

        $this->stdout("Digest sent\n", Console::FG_BLUE);

        return ExitCode::OK;
    }

    public function actionNotices(): int
    {
        Freeform::getInstance()->feed->parseFeed();

        $this->stdout("\nDone...\n", Console::FG_BLUE);

        return ExitCode::OK;
    }
}
