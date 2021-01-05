<?php

namespace Solspace\Freeform\Services\Pro;

use craft\base\Component;
use Solspace\Freeform\Events\Assets\RegisterEvent;
use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Events\Forms\PageJumpEvent;
use Solspace\Freeform\Resources\Bundles\SubmissionEditRulesBundle;

class RulesService extends Component
{
    public function addAttributesToFormTag(AttachFormAttributesEvent $event)
    {
        $form = $event->getForm();
        $ruleProperties = $form->getRuleProperties();

        if (null !== $ruleProperties && $ruleProperties->hasActiveFieldRules($form->getCurrentPage()->getIndex())) {
            $event->attachAttribute('data-has-rules', true);
        }
    }

    public function handleFormPageJump(PageJumpEvent $event)
    {
        $form = $event->getForm();
        $ruleProperties = $form->getRuleProperties();

        if (null !== $ruleProperties && $ruleProperties->hasActiveGotoRules($form->getCurrentPage()->getIndex())) {
            $event->setJumpToIndex($ruleProperties->getPageJumpIndex($form));
        }
    }

    /**
     * @throws \yii\base\InvalidConfigException
     */
    public function registerRulesJsAsAssets(RegisterEvent $event)
    {
        $event->getView()->registerAssetBundle(SubmissionEditRulesBundle::class);
    }
}
