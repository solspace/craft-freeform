import { useModal } from "@components/modals/modal.context";

import { ScreenshotModal } from "./form-monitor.screenshot.modal";

type ScreenshotModalData = {
  screenshot?: string;
  beforeSubmitScreenshot?: string;
  testId: number;
};

type UseScreenshotModal = (data: ScreenshotModalData) => () => void;

export const useScreenshotModal: UseScreenshotModal = (data) => {
  const { openModal } = useModal();

  return (): void => {
    openModal(ScreenshotModal, data);
  };
};
