<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 21:22:50
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layouts/components/toolBar.vue
 * @LastEditTime : 2022-03-18 21:51:37
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<template>
  <Fragment>
    <div
      class="copy"
      :class="record.key === selectItem.key ? 'active' : 'unactivated'"
      @click.stop="$emit('handleCopy')"
    >
      <a-icon type="copy" />
    </div>
    <div
      class="delete"
      :class="record.key === selectItem.key ? 'active' : 'unactivated'"
      @click.stop="$emit('handleDelete')"
    >
      <a-icon type="delete" />
    </div>
  </Fragment>
</template>

<script>
// 使用Fragment，解决不允许多节点问题
import { Fragment } from "vue-fragment";

export default {
  name: "LayoutToolBar",
  props: {
    record: { type: Object, required: true },
    selectItem: { type: Object, required: true },
  },
  components: {
    Fragment,
  },
};
</script>

<style></style>
