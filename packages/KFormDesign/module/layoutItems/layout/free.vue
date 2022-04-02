<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 15:50:49
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItems/layout/free.vue
 * @LastEditTime : 2022-04-01 17:36:31
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->

<template>
  <div
    class="grid-box"
    :class="{ active: record.key === selectItem.key }"
    @click.stop="handleSelectItem(record)"
  >
    <draggable
      tag="div"
      class="draggable-box"
      v-bind="{
        group: 'form-draggable',
        ghostClass: 'moving',
        animation: 180,
        handle: '.drag-move',
      }"
      v-model="record.list"
      @start="$emit('dragStart', $event, record.list)"
      @add="$emit('handleColAdd', $event, record.list)"
    >
      <transition-group
        tag="div"
        name="list"
        class="list-main"
        :style="transitionGroupStyle"
      >
        <div
          v-for="item in record.list"
          :key="item.key"
          @click.stop="void 0"
          :class="{ 'drag-move': false }"
        >
          <layoutItem
            :key="item.key"
            :class="{ 'drag-move': false }"
            :selectItem.sync="selectItem"
            :startType="startType"
            :insertAllowedType="insertAllowedType"
            :record="wrapRecord(item)"
            :hideModel="hideModel"
            :config="config"
            @handleSelectItem="handleSelectItem"
            @handleColAdd="handleColAdd"
            @handleCopy="$emit('handleCopy')"
            @handleShowRightMenu="handleShowRightMenu"
            @handleDelete="$emit('handleDelete')"
          />
        </div>
      </transition-group>
    </draggable>

    <!-- 浮动工具栏 -->
    <tool-bar v-bind="$props" v-on="{ ...$listeners }" />
  </div>
</template>
<script>
import base from "./base";

export default {
  name: "FreeLayoutItem",
  extends: base,
  computed: {
    transitionGroupStyle() {
      return {
        width: `${this.record.options.width}px`,
        height: `${this.record.options.height}px`,
      };
    },
  },
};
</script>
