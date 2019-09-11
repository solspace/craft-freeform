<?php

namespace Solspace\Freeform\Services\Pro;

use craft\base\Component;
use Solspace\Freeform\Events\Assets\RegisterEvent;
use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Events\Forms\FormRenderEvent;
use Solspace\Freeform\Events\Forms\PageJumpEvent;
use Solspace\Freeform\Resources\Bundles\SubmissionEditRulesBundle;

class RulesService extends Component
{
    /**
     * @param FormRenderEvent $event
     */
    public function addJavascriptToForm(FormRenderEvent $event)
    {
        $form           = $event->getForm();
        $ruleProperties = $form->getRuleProperties();

        if (null !== $ruleProperties && $ruleProperties->hasActiveFieldRules($form->getCurrentPage()->getIndex())) {
            static $scriptLoaded;

            if (null === $scriptLoaded || $event->isNoScriptRenderEnabled()) {
                $scriptJs = file_get_contents(\Yii::getAlias('@freeform') . '/Resources/js/other/pro/form/rules.js');
                $event->appendJsToOutput($scriptJs);
            }
        }
    }

    /**
     * @param AttachFormAttributesEvent $event
     */
    public function addAttributesToFormTag(AttachFormAttributesEvent $event)
    {
        $form           = $event->getForm();
        $ruleProperties = $form->getRuleProperties();

        if (null !== $ruleProperties && $ruleProperties->hasActiveFieldRules($form->getCurrentPage()->getIndex())) {
            $event->attachAttribute('data-has-rules', true);
        }
    }

    /**
     * @param PageJumpEvent $event
     */
    public function handleFormPageJump(PageJumpEvent $event)
    {
        $form           = $event->getForm();
        $ruleProperties = $form->getRuleProperties();

        if (null !== $ruleProperties && $ruleProperties->hasActiveGotoRules($form->getCurrentPage()->getIndex())) {
            $event->setJumpToIndex($ruleProperties->getPageJumpIndex($form));
        }
    }

    /**
     * @param RegisterEvent $event
     *
     * @throws \yii\base\InvalidConfigException
     */
    public function registerRulesJsAsAssets(RegisterEvent $event)
    {
        $event->getView()->registerAssetBundle(SubmissionEditRulesBundle::class);
    }
}
