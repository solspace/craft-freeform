import type Freeform from '@components/front-end/plugin/freeform';
import type { FreeformHandler } from 'types/form';

class Rating implements FreeformHandler {
  freeform: Freeform;

  constructor(freeform: Freeform) {
    this.freeform = freeform;
    this.reload();
  }

  reload = () => {
    const ratingFields = this.freeform.form.querySelectorAll<HTMLDivElement>('[data-field-type="rating"]');
    ratingFields.forEach((field) => {
      const { colorIdle, colorHover, colorSelected } = field.dataset;

      field.style.setProperty('--ff-rating-color-idle', colorIdle);
      field.style.setProperty('--ff-rating-color-hover', colorHover);
      field.style.setProperty('--ff-rating-color-selected', colorSelected);
    });
  };
}

export default Rating;
