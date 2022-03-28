<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 16:05:59
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItems/baseItem.vue
 * @LastEditTime : 2022-03-28 15:11:50
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<script>
import draggable from "vuedraggable";
import { Fragment } from "vue-fragment";
import VueDraggableResizableCell from "../../../VueDraggableResizableCell";

import { layouts, nodes } from "./components";

export default {
  name: "BaseItem",
  props: {
    record: { type: Object, required: true },
    selectItem: { type: Object, required: true },
    config: { type: Object, required: true },
    startType: { type: String, required: true },
    insertAllowedType: { type: Array, required: true },
    hideModel: { type: Boolean, default: false },
  },
  computed: {
    registeredLayoutTypeMap() {
      return {
        "free-layout": layouts.freeLayout,
        table: layouts.tableLayout,
        tabs: layouts.tabsLayout,
        grid: layouts.gridLayout,
        card: layouts.cardLayout,
      };
    },
    registeredNodeTypeMap() {
      return {
        batch: nodes.batchNode,
        selectInputList: nodes.selectInputListNode,
      };
    },
    layoutComponent() {
      const { type } = this.record;
      return this.registeredLayoutTypeMap[type];
    },
    nodeComponent() {
      const { type } = this.record;
      return this.registeredNodeTypeMap[type] || nodes.baseNode;
    },
    insertAllowed() {
      return this.insertAllowedType.includes(this.startType);
    },
    /** 获得针对 VueDraggableResizableCell 的选项 */
    vdrCellOptions() {
      const { vdrCellOptions = {} } = this.record;
      return vdrCellOptions;
    },
    /** 判断是否启用了 VueDraggableResizableCell */
    vdrCellEnabled() {
      const { enable = false } = this.vdrCellOptions;
      return enable;
    },
  },
  components: {
    draggable,
    Fragment,
    // VueDraggableResizableCell: () => import("../../../VueDraggableResizableCell"),
    VueDraggableResizableCell,
    ...layouts,
    ...nodes,
  },
  methods: {
    //
    handleShowRightMenu(e, record, trIndex, tdIndex) {
      this.$emit("handleShowRightMenu", e, record, trIndex, tdIndex);
    },
    handleSelectItem(record) {
      console.log("%c%s", "color: #2346dd", `handleSelectItem=${record?.label}-${record?.key} [${this.$options.name}]`);
      this.$emit("handleSelectItem", record);
    },
    handleColAdd(e, list) {
      this.$emit("handleColAdd", e, list);
    },
    wrapRecord(record, isVDRCell = true) {
      if (record.vdrCellOptions && typeof record.vdrCellOptions.enable === "boolean") {
        // eslint-disable-next-line no-param-reassign
        record.vdrCellOptions.enable = !!isVDRCell;
      }

      return record;
    },
  },
};
</script>
