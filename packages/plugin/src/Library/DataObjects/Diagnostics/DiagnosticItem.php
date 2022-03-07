<?php

namespace Solspace\Freeform\Library\DataObjects\Diagnostics;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\Diagnostics\Validators\AbstractValidator;
use Solspace\Freeform\Library\DataObjects\Diagnostics\Validators\NoticeValidator;
use Solspace\Freeform\Library\DataObjects\Diagnostics\Validators\SuggestionValidator;
use Solspace\Freeform\Library\DataObjects\Diagnostics\Validators\WarningNoticeValidator;
use Solspace\Freeform\Library\DataObjects\Diagnostics\Validators\WarningValidator;
use Twig\Markup;

class DiagnosticItem
{
    public const COLOR_BASE = 'base';
    public const COLOR_PASS = 'pass';
    public const COLOR_ERROR = 'error';

    /** @var string */
    private $label;

    /** @var mixed */
    private $value;

    /** @var AbstractValidator[] */
    private $validators = [];

    /** @var null|callable */
    private $colorOverride;

    /** @var NotificationItem[] */
    private $warnings = [];

    /** @var NotificationItem[] */
    private $suggestions = [];

    /** @var NotificationItem[] */
    private $notices = [];

    /**
     * DiagnosticItem constructor.
     *
     * @param mixed               $value
     * @param AbstractValidator[] $validators
     * @param callable            $colorOverride
     */
    public function __construct(string $markup, $value, array $validators = [], callable $colorOverride = null)
    {
        $this->label = $markup;
        $this->value = $value;
        $this->colorOverride = $colorOverride;

        foreach ($validators as $validator) {
            $this->addValidator($validator);
        }

        $this->validate();
    }

    public function getMarkup(): Markup
    {
        $colorOpen = '<span class="diagnostic-color-'.$this->getColor().'" />';

        $string = $this->label;
        $string = str_replace('[color]', $colorOpen, $string);
        $string = str_replace('[/color]', '</span>', $string);

        return $this->renderMarkup($string, ['value' => $this->value]);
    }

    public function getWarnings(): array
    {
        return $this->warnings;
    }

    public function getSuggestions(): array
    {
        return $this->suggestions;
    }

    public function getNotices(): array
    {
        return $this->notices;
    }

    public function getColor(): string
    {
        if ($this->colorOverride) {
            return \call_user_func($this->colorOverride, $this->value);
        }

        if ($this->getWarnings()) {
            return self::COLOR_ERROR;
        }

        return self::COLOR_PASS;
    }

    private function addValidator(AbstractValidator $validator)
    {
        $this->validators[] = $validator;
    }

    private function validate()
    {
        foreach ($this->validators as $validator) {
            if (!$validator->validate($this->value)) {
                $reflection = new \ReflectionClass($validator);

                $heading = Freeform::t($validator->getHeading());
                $message = Freeform::t($validator->getMessage());

                $heading = $this->renderMarkup($heading, ['value' => $this->value, 'extra' => $validator->getExtraProperties()]);
                $message = $this->renderMarkup($message, ['value' => $this->value, 'extra' => $validator->getExtraProperties()]);

                $notificationItem = new NotificationItem($heading, $message, $reflection->getShortName());

                switch (\get_class($validator)) {
                    case WarningValidator::class:
                        $this->warnings[] = $notificationItem;

                        break;

                    case SuggestionValidator::class:
                        $this->suggestions[] = $notificationItem;

                        break;

                    case NoticeValidator::class:
                    case WarningNoticeValidator::class:
                        $this->notices[] = $notificationItem;

                        break;
                }
            }
        }
    }

    private function renderMarkup(string $markup, array $values): Markup
    {
        return new Markup(\Craft::$app->view->renderString($markup, $values), 'UTF-8');
    }
}
