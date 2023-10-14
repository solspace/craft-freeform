<?php

namespace Solspace\Freeform\Bundles\GraphQL;

use craft\events\RegisterGqlMutationsEvent;
use craft\events\RegisterGqlQueriesEvent;
use craft\events\RegisterGqlSchemaComponentsEvent;
use craft\events\RegisterGqlTypesEvent;
use craft\services\Gql;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AttributeInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AttributesInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FieldInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FormInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FreeformInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\OpinionScaleInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\OptionInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\PageInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\RowInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\CsrfTokenInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\FormCaptchaInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\HoneypotInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\SubmissionCaptchaInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SubmissionInterface;
use Solspace\Freeform\Bundles\GraphQL\Mutations\SubmissionMutation;
use Solspace\Freeform\Bundles\GraphQL\Queries\FreeformQuery;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class GraphQLBundle extends FeatureBundle
{
    public function __construct()
    {
        if (version_compare(\Craft::$app->version, '3.5.0', '<')) {
            return;
        }

        if ($this->plugin()->edition()->isBelow(Freeform::EDITION_LITE)) {
            return;
        }

        Event::on(
            Gql::class,
            Gql::EVENT_REGISTER_GQL_TYPES,
            function (RegisterGqlTypesEvent $event) {
                $event->types[] = FreeformInterface::class;
                $event->types[] = FormInterface::class;
                $event->types[] = FieldInterface::class;
                $event->types[] = PageInterface::class;
                $event->types[] = RowInterface::class;
                $event->types[] = OptionInterface::class;
                $event->types[] = OpinionScaleInterface::class;
                $event->types[] = HoneypotInterface::class;
                $event->types[] = CsrfTokenInterface::class;
                $event->types[] = FormCaptchaInterface::class;
                $event->types[] = SubmissionCaptchaInterface::class;
                $event->types[] = AttributeInterface::class;
                $event->types[] = AttributesInterface::class;
                $event->types[] = SubmissionInterface::class;
            }
        );

        Event::on(
            Gql::class,
            Gql::EVENT_REGISTER_GQL_QUERIES,
            function (RegisterGqlQueriesEvent $event) {
                $event->queries = array_merge(
                    $event->queries,
                    FreeformQuery::getQueries()
                );
            }
        );

        Event::on(
            Gql::class,
            Gql::EVENT_REGISTER_GQL_MUTATIONS,
            function (RegisterGqlMutationsEvent $event) {
                $event->mutations = array_merge(
                    $event->mutations,
                    SubmissionMutation::getMutations()
                );
            }
        );

        Event::on(
            Gql::class,
            Gql::EVENT_REGISTER_GQL_SCHEMA_COMPONENTS,
            function (RegisterGqlSchemaComponentsEvent $event) {
                $freeform = Freeform::getInstance();

                $group = $freeform->name;
                $forms = $freeform->forms->getAllForms();

                $formsCategory = GqlPermissions::CATEGORY_FORMS;
                $submissionsCategory = GqlPermissions::CATEGORY_SUBMISSIONS;

                $queries = [];
                $queries[$formsCategory.'.all:read'] = [
                    'label' => Freeform::t('View all forms'),
                ];

                $mutations = [];
                $mutations[$submissionsCategory.'.all:create'] = [
                    'label' => Freeform::t('Create all submissions'),
                ];

                foreach ($forms as $form) {
                    $formUid = $form->getUid();
                    $formName = $form->getName();

                    $formsScopeByContext = $formsCategory.'.'.$formUid;

                    $queries[$formsScopeByContext.':read'] = [
                        'label' => Freeform::t('View "{formName}" form', [
                            'formName' => $formName,
                        ]),
                    ];

                    $submissionsScopeByContext = $submissionsCategory.'.'.$formUid;

                    $mutations[$submissionsScopeByContext.':create'] = [
                        'label' => Freeform::t('Create submissions for form "{formName}"', [
                            'formName' => $formName,
                        ]),
                    ];
                }

                $event->queries[$group] = $queries;

                $event->mutations[$group] = $mutations;
            }
        );
    }
}
