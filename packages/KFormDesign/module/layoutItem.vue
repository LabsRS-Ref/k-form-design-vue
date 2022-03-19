<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 09:03:05
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItem.vue
 * @LastEditTime : 2022-03-19 12:44:12
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<template>
  <div
    :class="{
      'layout-width': isLayout,
    }"
  >
    <component
      :is="layoutComponent || nodeComponent"
      v-bind="$props"
      v-on="{
        ...$listeners,
      }"
    />
  </div>
</template>
<script>
import LayoutItems from "./layoutItems";

const { baseClass: base, layouts, nodes } = LayoutItems;
export default {
  name: "layoutItem",
  extends: base,
  computed: {
    isLayout() {
      return !!this.layoutComponent;
    },
    layoutComponent() {
      const { type } = this.record;
      return {
        "free-layout": layouts.freeLayout,
        table: layouts.tableLayout,
        tabs: layouts.tabsLayout,
        grid: layouts.gridLayout,
        card: layouts.cardLayout,
        divider: layouts.freeLayout,
        html: layouts.freeLayout,
      }[type];
    },
    nodeComponent() {
      const { type } = this.record;
      return (
        {
          batch: nodes.batchNode,
          selectInputList: nodes.selectInputListNode,
        }[type] || nodes.baseNode
      );
    },
  },
  components: {
    ...layouts,
    ...nodes,
  },
};
</script>
