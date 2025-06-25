<?php

namespace Solspace\Freeform\Bundles\Notifications\Providers;

use Solspace\Freeform\Bundles\Notifications\Parsers\HtmlTemplateParser;

class NotificationsPostedContentProvider
{
    private const CONVERSION_MAP = [
        'bodyHtml' => 'body',
        'bodyText' => 'text',
        'subject',
        'fromName',
        'fromEmail',
        'replyToName',
        'replyToEmail',
        'cc',
        'bcc',
    ];

    private const NO_HTML_FIELDS = [
        'subject',
        'fromName',
        'fromEmail',
        'replyToName',
        'replyToEmail',
        'cc',
        'bcc',
    ];

    public function __construct(private HtmlTemplateParser $htmlTemplateParser) {}

    public function getConvertedPostWithTwigValues(): array
    {
        $post = \Craft::$app->request->post();
        foreach (self::CONVERSION_MAP as $convertable => $field) {
            $key = \is_int($convertable) ? $field : $convertable;
            $post[$key] = $this->htmlTemplateParser->toTwig($post[$field] ?? '');
            $post[$key] = trim(str_replace('&nbsp;', ' ', $post[$key]));
        }

        foreach (self::NO_HTML_FIELDS as $field) {
            if (isset($post[$field])) {
                $post[$field] = strip_tags($post[$field]);
            }
        }

        return $post;
    }
}
