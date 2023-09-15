<?php

namespace Solspace\Freeform\Tests\Form\Layout;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Form\Layout\Layout;
use Solspace\Freeform\Form\Layout\Page;

/**
 * @internal
 *
 * @coversNothing
 */
class LayoutTest extends TestCase
{
    public function testIteratePages()
    {
        $layout = new FormLayout();
        $layout->getPages()
            ->add(new Page(new Layout(), ['label' => 'Page One']))
            ->add(new Page(new Layout(), ['label' => 'Page Two']))
        ;

        $labels = [];
        foreach ($layout as $page) {
            $labels[] = $page->getLabel();
        }

        $this->assertSame(['Page One', 'Page Two'], $labels);
    }

    public function testCountPages()
    {
        $layout = new FormLayout();
        $layout->getPages()
            ->add(new Page(new Layout(), ['label' => 'Page One']))
            ->add(new Page(new Layout(), ['label' => 'Page Two']))
        ;

        $this->assertCount(2, $layout);
    }
}
