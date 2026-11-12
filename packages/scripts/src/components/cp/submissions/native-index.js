import { mountNativeSubmissionTools } from "@lib/cp/native-submission-index";

// Import-map modules must remain external to this standalone plugin bundle.
const cpModule = "@craftcms/cp";
if (typeof document !== "undefined" && !window.freeformNativeIndexTools) {
  window.freeformNativeIndexTools = true;
  import(cpModule)
    .then((api) => mountNativeSubmissionTools(api))
    .catch((error) => {
      window.freeformNativeIndexTools = false;
      console.error("Could not initialize Freeform index tools.", error);
    });
}
