<?php

namespace Solspace\Freeform\Widgets\Pro;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Activity\ActivityPolicy;
use Solspace\Freeform\Resources\Bundles\Widgets\Dashboard\ActivityHealthBundle;
use Solspace\Freeform\Services\ActivityHealthService;
use Solspace\Freeform\Widgets\AbstractWidget;
use Solspace\Freeform\Widgets\ExtraWidgetInterface;
use Solspace\Freeform\Widgets\FormDashboardOnlyWidgetInterface;
use yii\web\ForbiddenHttpException;

class ActivityHealthWidget extends AbstractWidget implements ExtraWidgetInterface, FormDashboardOnlyWidgetInterface
{
    public ?string $title = null;
    public $days = 30;
    public $events = ['submission', 'email-sent', 'integration-error', 'spam'];
    public $showRecent = true;
    public $replaceBanner = true;

    public static function displayName(): string
    {
        return Freeform::t('Activity & Health');
    }

    public static function icon(): ?string
    {
        return '@freeform/icon-mask.svg';
    }

    public function settingsAttributes(): array
    {
        return ['title', 'days', 'events', 'showRecent', 'replaceBanner'];
    }

    public function rules(): array
    {
        return [
            ['title', 'string', 'max' => 100],
            ['days', 'integer', 'min' => 1, 'max' => 365, 'skipOnEmpty' => false],
            [['showRecent', 'replaceBanner'], 'filter', 'filter' => static fn ($value) => '' === $value ? false : $value],
            [['showRecent', 'replaceBanner'], 'boolean', 'skipOnEmpty' => false],
            ['events', 'filter', 'filter' => static fn ($value) => '' === $value ? [] : $value],
            ['events', function () {
                if (!\is_array($this->events) || array_filter($this->events, static fn ($value) => !\is_string($value)) || array_diff($this->events, array_keys(ActivityPolicy::EVENTS))) {
                    $this->addError('events', Freeform::t('Select supported activity types.'));
                }
            }, 'skipOnEmpty' => false],
        ];
    }

    public function getBodyHtml(): string
    {
        if (!Freeform::getInstance()->isPro() || !ActivityHealthService::canAccess()) {
            throw new ForbiddenHttpException('Activity access is required.');
        }
        \Craft::$app->getView()->registerAssetBundle(ActivityHealthBundle::class);

        $health = (new ActivityHealthService())->snapshot((int) $this->days, (array) $this->events, (bool) $this->showRecent);

        return \Craft::$app->getView()->renderTemplate('freeform/_widgets/activity-health/body', ['health' => $health, 'settings' => $this]);
    }

    public function getSettingsHtml(): string
    {
        return \Craft::$app->getView()->renderTemplate('freeform/_widgets/activity-health/settings', ['settings' => $this, 'eventOptions' => array_map(static fn ($definition) => Freeform::t($definition[0]), ActivityPolicy::EVENTS)]);
    }
}
