<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 09:03:05
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItem.vue
 * @LastEditTime : 2022-03-18 22:01:23
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<template>
  <div
    :class="{
      'layout-width': isLayout,
    }"
  >
    <!-- layout 节点 -->
    <template v-if="isLayout">
      <component
        :is="layoutComponent"
        v-bind="$props"
        v-on="{
          ...$listeners,
          handleSelectItem,
          handleShowRightMenu,
        }"
      />
    </template>
    <!-- 非layout 节点 -->
    <template v-else>
      <formNode
        :key="record.key"
        :selectItem.sync="selectItem"
        :record="record"
        :config="config"
        :hideModel="hideModel"
        @handleSelectItem="handleSelectItem"
        @handleCopy="$emit('handleCopy')"
        @handleDelete="$emit('handleDelete')"
        @handleShowRightMenu="$emit('handleShowRightMenu')"
      />
    </template>
  </div>
</template>
<script>
// layouts
import base from "./layouts/base";
import cardLayout from "./layouts/cardLayout";
import freeLayout from "./layouts/freeLayout";
import gridLayout from "./layouts/gridLayout";
import tableLayout from "./layouts/tableLayout";
import tabsLayout from "./layouts/tabsLayout";

// node
import formNode from "./formNode";

export default {
  name: "layoutItem",
  extends: base,
  computed: {
    insertAllowed() {
      return this.insertAllowedType.includes(this.startType);
    },
    isLayout() {
      return !!this.layoutComponent;
    },
    layoutComponent() {
      const { type } = this.record;
      return {
        "free-layout": freeLayout,
        table: tableLayout,
        tabs: tabsLayout,
        grid: gridLayout,
        card: cardLayout,
        divider: freeLayout,
        html: freeLayout,
      }[type];
    },
  },
  components: {
    formNode,
    ...{
      cardLayout,
      freeLayout,
      gridLayout,
      tableLayout,
      tabsLayout,
    },
  },
  methods: {
    handleShowRightMenu(e, record, trIndex, tdIndex) {
      this.$emit("handleShowRightMenu", e, record, trIndex, tdIndex);
    },
    handleSelectItem(record) {
      this.$emit("handleSelectItem", record);
    },
    handleColAdd(e, list) {
      this.$emit("handleColAdd", e, list);
    },
  },
};
</script>
