declare const Craft: {
  cp: {
    displaySuccess(message: string): void;
    displayNotice(message: string): void;
    displayError(message: string): void;
  };
};

export const notifications = {
  success: (message: string): void => {
    Craft.cp.displaySuccess(message);
  },
  notice: (message: string): void => {
    Craft.cp.displayNotice(message);
  },
  error: (message: string): void => {
    Craft.cp.displayError(message);
  },
};
