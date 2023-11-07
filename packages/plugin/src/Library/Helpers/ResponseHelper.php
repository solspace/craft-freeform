<?php

namespace Solspace\Freeform\Library\Helpers;

use yii\web\Response;

class ResponseHelper
{
    private const POLICY_HEADER_KEY = 'Content-Security-Policy';

    private static array $rules = [];

    public function setContentSecurityPolicy($src, ...$policy): void
    {
        if (!isset(self::$rules[$src])) {
            self::$rules[$src] = [];
        }

        self::$rules[$src] = array_merge(self::$rules[$src], $policy);
        self::$rules[$src] = array_unique(self::$rules[$src]);
        self::$rules[$src] = array_filter(self::$rules[$src]);

        $compiledPolicy = [];
        foreach (self::$rules as $source => $policyUrls) {
            $compiledPolicy[] = $source.' '.implode(' ', $policyUrls);
        }

        $compiledPolicy = implode('; ', $compiledPolicy);

        $headers = $this->getResponse()->getHeaders();
        if ($headers->get(self::POLICY_HEADER_KEY)) {
            $headers->remove(self::POLICY_HEADER_KEY);
        }

        $headers->set('Content-Security-Policy', $compiledPolicy);
    }

    public function getResponse(): Response
    {
        return \Craft::$app->getResponse();
    }
}
