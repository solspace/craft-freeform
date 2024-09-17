<?php

namespace Solspace\Freeform\Library\ServerSentEvents;

use yii\web\Response;

class SSE
{
    public function __construct()
    {
        $response = \Craft::$app->response;

        $response->format = Response::FORMAT_RAW;
        $response->stream = true;

        while (ob_get_level() > 0) {
            @ob_end_clean();
        }

        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('X-Accel-Buffering: no');
    }

    public function message(string $event, mixed $message): void
    {
        if (\is_array($message) || \is_object($message)) {
            $message = json_encode($message);
        }

        echo "event: {$event}\n";
        echo "data: {$message}\n\n";

        @ob_flush();
        @flush();
    }

    public function isAborted(): bool
    {
        return connection_aborted();
    }
}
