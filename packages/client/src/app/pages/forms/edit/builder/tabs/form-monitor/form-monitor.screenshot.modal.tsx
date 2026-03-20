import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from "@components/modals/modal.styles";
import type { ModalContainerProps } from "@components/modals/modal.types";
import { spacings } from "@ff-client/styles/variables";
import translate from "@ff-client/utils/translations";
import type React from "react";
import {
  MiniMap,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

import {
  Controls,
  ImageContainer,
  NoImageMessage,
  ScreenshotImage,
  ScreenshotSection,
  ScreenshotsContainer,
  ScreenshotTitle,
  SingleScreenshotContainer,
  ZoomButton,
  ZoomButtons,
} from "./form-monitor.screenshot.modal.styles";

interface ScreenshotModalData {
  screenshot?: string;
  beforeSubmitScreenshot?: string;
  testId: number;
}

export const ScreenshotModal: React.FC<
  ModalContainerProps<ScreenshotModalData>
> = ({ data, closeModal }) => {
  if (!data) {
    return null;
  }

  const { screenshot, beforeSubmitScreenshot, testId } = data;

  const hasAfterScreenshot = !!screenshot;
  const hasBeforeScreenshot = !!beforeSubmitScreenshot;
  const hasBothScreenshots = hasAfterScreenshot && hasBeforeScreenshot;

  const renderScreenshot = (
    imageUrl: string,
    title: string,
  ): React.JSX.Element => {
    return (
      <ScreenshotSection>
        {hasBothScreenshots && <ScreenshotTitle>{title}</ScreenshotTitle>}
        <ImageContainer>
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={3}
            wheel={{ step: 0.1 }}
            pinch={{ step: 5 }}
            doubleClick={{ step: 0.5 }}
          >
            {({ zoomIn, zoomOut, resetTransform, instance }) => (
              <>
                <TransformComponent
                  wrapperStyle={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  contentStyle={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ScreenshotImage
                    src={imageUrl}
                    alt={title}
                    loading="lazy"
                    draggable={false}
                  />
                </TransformComponent>
                <Controls>
                  <ZoomButtons>
                    <ZoomButton
                      onClick={() => zoomOut()}
                      disabled={instance.transformState.scale <= 0.5}
                      title={translate("Zoom Out")}
                    >
                      −
                    </ZoomButton>
                    <ZoomButton
                      onClick={() => resetTransform()}
                      title={translate("Reset Zoom")}
                    >
                      ↺
                    </ZoomButton>
                    <ZoomButton
                      onClick={() => zoomIn()}
                      disabled={instance.transformState.scale >= 3}
                      title={translate("Zoom In")}
                    >
                      +
                    </ZoomButton>
                  </ZoomButtons>
                  {/* MiniMap */}
                  <MiniMap
                    width={104}
                    height={108}
                    borderColor="rgba(255, 255, 255, 0.8)"
                  >
                    <img src={imageUrl} alt="Minimap" />
                  </MiniMap>
                </Controls>
              </>
            )}
          </TransformWrapper>
        </ImageContainer>
      </ScreenshotSection>
    );
  };

  const renderNoScreenshot = (title: string): React.JSX.Element => (
    <ScreenshotSection>
      <ScreenshotTitle>{title}</ScreenshotTitle>
      <ImageContainer>
        <NoImageMessage>{translate("No screenshot available")}</NoImageMessage>
      </ImageContainer>
    </ScreenshotSection>
  );

  return (
    <ModalContainer style={{ maxWidth: "90vw", width: "1200px" }}>
      <ModalHeader>
        <h1>{translate("Screenshots for Test", { testId })}</h1>
      </ModalHeader>

      <div style={{ padding: `${spacings.lg} ${spacings.xl}` }}>
        {hasBothScreenshots ? (
          <ScreenshotsContainer>
            {renderScreenshot(
              beforeSubmitScreenshot!,
              translate("Before Submit"),
            )}
            {renderScreenshot(screenshot!, translate("After Submit"))}
          </ScreenshotsContainer>
        ) : hasBeforeScreenshot ? (
          <SingleScreenshotContainer>
            {renderScreenshot(beforeSubmitScreenshot!, "")}
          </SingleScreenshotContainer>
        ) : hasAfterScreenshot ? (
          <SingleScreenshotContainer>
            {renderScreenshot(screenshot!, "")}
          </SingleScreenshotContainer>
        ) : (
          <SingleScreenshotContainer>
            {renderNoScreenshot(translate("Screenshots"))}
          </SingleScreenshotContainer>
        )}
      </div>

      <ModalFooter>
        <button type="button" className="btn cancel" onClick={closeModal}>
          {translate("Close")}
        </button>
      </ModalFooter>
    </ModalContainer>
  );
};
