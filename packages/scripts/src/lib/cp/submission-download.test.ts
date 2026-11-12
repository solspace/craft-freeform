import { afterEach, expect, it } from "vitest";
import { mountSubmissionDownload } from "./submission-download";

afterEach(() => document.body.replaceChildren());

it("keeps file downloads separate from the native editor form and retains its POST fields", () => {
  document.body.innerHTML =
    '<form id="main-form"><input name="title" value="Unsaved title"><template id="freeform-submission-download"><form id="asset_download" method="post" hidden><input name="action" value="assets/download-asset"><input name="assetId" value=""><input name="token" value="test-csrf"></form></template></form>';
  mountSubmissionDownload();
  mountSubmissionDownload();
  const form = document.getElementById("asset_download") as HTMLFormElement;
  expect(form.parentElement).toBe(document.body);
  expect(document.querySelectorAll("#asset_download")).toHaveLength(1);
  expect(form.method).toBe("post");
  expect(new FormData(form).get("token")).toBe("test-csrf");
  expect(
    new FormData(document.querySelector("#main-form") as HTMLFormElement).get(
      "assetId",
    ),
  ).toBeNull();
});
