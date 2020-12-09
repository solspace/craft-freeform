<?php

namespace Solspace\Freeform\Library\Composer\Components\Properties;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Connections\AbstractConnection;
use Solspace\Freeform\Library\Connections\ConnectionInterface;
use Solspace\Freeform\Library\Exceptions\Connections\ConnectionException;
use Solspace\Freeform\Library\Logging\FreeformLogger;

class ConnectionProperties extends AbstractProperties
{
    /** @var array */
    protected $list;

    /** @var array */
    private $compiledList;

    /**
     * @return ConnectionInterface[]
     */
    public function getList(): array
    {
        if (null === $this->compiledList) {
            $list = [];
            if ($this->list) {
                foreach ($this->list as $item) {
                    try {
                        $list[] = AbstractConnection::create($item);
                    } catch (ConnectionException $e) {
                        Freeform::getInstance()->logger
                            ->getLogger(FreeformLogger::ELEMENT_CONNECTION)
                            ->warning($e->getMessage(), ['properties' => $list])
                        ;
                    }
                }
            }

            $this->compiledList = $list;
        }

        return $this->compiledList;
    }

    /**
     * {@inheritDoc}
     */
    protected function getPropertyManifest(): array
    {
        return [
            'list' => self::TYPE_ARRAY,
        ];
    }
}
