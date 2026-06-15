<?php

namespace Solspace\Freeform\Library\Compatibility;

use craft\events\RegisterTemplateRootsEvent;
use craft\web\View;
use CraftCms\Cms\Plugin\Plugin;
use yii\base\Event;
use yii\base\Module;
use yii\base\UnknownPropertyException;

/**
 * Provides Yii Module-style setComponents() / magic service access for Craft 6 plugins,
 * and registers a Yii application module so legacy CP routes and controllers resolve.
 */
trait YiiComponentPluginTrait
{
    private ?Module $freeformYiiModule = null;

    private bool $freeformYiiModuleRegisteredWithCraft = false;

    public function __get($name)
    {
        $module = $this->getFreeformYiiModule();

        if ($module->has($name)) {
            return $module->get($name);
        }

        if (property_exists($this, $name)) {
            return $this->{$name};
        }

        throw new UnknownPropertyException('Getting unknown property: '.static::class."::\${$name}");
    }

    public function __isset($name): bool
    {
        return $this->getFreeformYiiModule()->has($name) || property_exists($this, $name);
    }

    public function setComponents(array $components): void
    {
        $this->getFreeformYiiModule()->setComponents($components);
    }

    /**
     * Registers Freeform as a Yii application module so UrlManager routes such as
     * `freeform/app` resolve to plugin controllers (Craft 6 plugins are not Modules).
     */
    protected function registerFreeformYiiApplicationModule(): void
    {
        if ($this->freeformYiiModuleRegisteredWithCraft) {
            return;
        }

        if (!class_exists(\Craft::class, false)) {
            return;
        }

        if (!\Craft::$app) {
            app('Craft');
        }

        $module = $this->getFreeformYiiModule();
        // CP/site controllers always live under controllers/, not Commands/
        $module->controllerNamespace = 'Solspace\Freeform\controllers';
        $module->controllerMap = $this->controllerMap;

        \Craft::$app->setModule($this->handle, $module);
        $this->freeformYiiModuleRegisteredWithCraft = true;
    }

    protected function registerFreeformCpTemplateRoots(): void
    {
        if (!$this instanceof Plugin) {
            return;
        }

        static $registered = false;

        if ($registered) {
            return;
        }

        $registered = true;
        $plugin = $this;

        Event::on(
            View::class,
            View::EVENT_REGISTER_CP_TEMPLATE_ROOTS,
            static function (RegisterTemplateRootsEvent $event) use ($plugin) {
                $templatesPath = $plugin->getBasePath().\DIRECTORY_SEPARATOR.'templates';

                if (is_dir($templatesPath)) {
                    $event->roots[$plugin->handle] = $templatesPath;
                }
            }
        );
    }

    private function getFreeformYiiModule(): Module
    {
        if ($this->freeformYiiModule === null) {
            $this->freeformYiiModule = new Module($this->handle);

            if ($this instanceof Plugin) {
                $this->freeformYiiModule->setBasePath($this->getBasePath());
            }
        }

        return $this->freeformYiiModule;
    }
}
