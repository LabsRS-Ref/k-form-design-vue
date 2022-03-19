<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-19 09:41:46
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItems/node/base.vue
 * @LastEditTime : 2022-03-19 12:39:56
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->

<template>
  <form-node
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

<script>
import base from "../baseItem.vue";

export default {
  name: "batchNodeItem",
  extends: base,
  components: {
    // eslint-disable-next-line vue/no-unused-components
    toolBar: () => import("../components/toolBar.vue"),
    // 关联的节点
    formNode: () => import("../../formNode.vue"),
  },
};
</script>
