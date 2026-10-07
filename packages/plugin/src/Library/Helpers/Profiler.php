<?php

namespace Solspace\Freeform\Library\Helpers;

class Profiler
{
    public static function profile(string $name, callable $callback): mixed
    {
        $token = 'Freeform: '.$name;
        \Yii::beginProfile($token, 'freeform.performance');

        try {
            return $callback();
        } finally {
            \Yii::endProfile($token, 'freeform.performance');
        }
    }
}
