<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 09:03:05
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItem.vue
 * @LastEditTime : 2022-03-28 10:13:37
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<template>
  <div
    data-name="layoutItem"
    :class="{
      'layout-width': enableUseLayoutWidth,
    }"
  >
    <component
      :is="layoutComponent || nodeComponent"
      v-bind="{
        ...$props,
        ...$attrs,
      }"
      v-on="{
        ...$listeners,
      }"
    />
  </div>
</template>
<script>
import LayoutItems from "./layoutItems";

const { baseClass: base } = LayoutItems;
export default {
  name: "layoutItem",
  extends: base,
  computed: {
    enableUseLayoutWidth() {
      const { type } = this.record;
      return !!this.layoutComponent || ["html", "divider"].includes(type);
    },
  },
};
</script>
