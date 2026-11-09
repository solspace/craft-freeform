import "../../../../../../styles/src/cp/choice-cards/recommended-badge.css";
import translate from "@ff-client/utils/translations";

export function RecommendedBadge() {
  return (
    <span className="ff-recommended-badge">{translate("Recommended")}</span>
  );
}
