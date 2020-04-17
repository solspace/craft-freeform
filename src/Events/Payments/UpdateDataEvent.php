<?php

namespace Solspace\Freeform\Events\Payments;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;

class UpdateDataEvent extends ArrayableEvent
{

    /** @var Submission */
    private $submission;

    /** @var Form */
    private $form;

    /** @var array */
    private $mandatoryData;

    /** @var array */
    private $paymentData;

    /**
     * @param Submission $submission
     * @param array      $mandatoryData
     */
    public function __construct(Submission $submission, array $mandatoryData = [])
    {
        $this->submission    = $submission;
        $this->form          = $submission->getForm();
        $this->mandatoryData = $mandatoryData;
        $this->paymentData   = [];

        parent::__construct();
    }

    /**
     * @param string $key
     * @param mixed  $value
     *
     * @return $this
     */
    public function addData(string $key, $value): UpdateDataEvent
    {
        $this->paymentData[$key] = $value;

        return $this;
    }

    /**
     * @param array $data
     *
     * @return $this
     */
    public function setData(array $data): UpdateDataEvent
    {
        $this->paymentData = $data;

        return $this;
    }

    /**
     * @return array
     */
    public function getCompiledData(): array
    {
        $paymentData = $this->paymentData ?? [];
        $paymentData = array_replace_recursive($paymentData, $this->mandatoryData);

        return $paymentData;
    }

    /**
     * @inheritDoc
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['submission', 'form']);
    }

    /**
     * @return Submission
     */
    public function getSubmission(): Submission
    {
        return $this->submission;
    }

    /**
     * @return Form
     */
    public function getForm(): Form
    {
        return $this->form;
    }
}
