import {
  SearchableSelect,
  type SearchableSelectConfig,
} from "@solspace/freeform-core";
import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  type PropType,
  ref,
} from "vue";

export const SearchableSelectWrapper = defineComponent({
  name: "SearchableSelectWrapper",
  props: {
    config: {
      type: Object as PropType<SearchableSelectConfig>,
      required: true,
    },
  },
  setup(props, { slots }) {
    const host = ref<HTMLDivElement>();
    let controller: SearchableSelect | undefined;
    onMounted(() => {
      const select = host.value?.querySelector("select");
      if (select) controller = new SearchableSelect(select, props.config);
    });
    onUpdated(() => controller?.sync(props.config));
    onBeforeUnmount(() => controller?.destroy());
    return () => <div ref={host}>{slots.default?.()}</div>;
  },
});
