<?php

namespace Solspace\Freeform\Commands;

use craft\console\Controller;
use yii\helpers\Console;

abstract class BaseCommand extends Controller
{
    protected function banner(string $string): void
    {
        $size = \strlen($string) + 4;

        $this->stdout(str_repeat('=', $size)."\n", Console::FG_YELLOW);
        $this->stdout('= '.$string." =\n", Console::FG_YELLOW);
        $this->stdout(str_repeat('=', $size)."\n\n", Console::FG_YELLOW);
    }
}
