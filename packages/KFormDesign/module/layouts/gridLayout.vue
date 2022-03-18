<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 16:29:19
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layouts/gridLayout.vue
 * @LastEditTime : 2022-03-18 20:40:38
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<template>
  <div
    class="grid-box"
    :class="{ active: record.key === selectItem.key }"
    @click.stop="handleSelectItem(record)"
  >
    <a-row class="grid-row" :gutter="record.options.gutter">
      <a-col
        class="grid-col"
        v-for="(colItem, idnex) in record.columns"
        :key="idnex"
        :span="colItem.span || 0"
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
          v-model="colItem.list"
          @start="$emit('dragStart', $event, colItem.list)"
          @add="$emit('handleColAdd', $event, colItem.list)"
        >
          <transition-group tag="div" name="list" class="list-main">
            <layoutItem
              class="drag-move"
              v-for="item in colItem.list"
              :key="item.key"
              :selectItem.sync="selectItem"
              :startType="startType"
              :insertAllowedType="insertAllowedType"
              :record="item"
              :hideModel="hideModel"
              :config="config"
              @handleSelectItem="handleSelectItem"
              @handleColAdd="handleColAdd"
              @handleCopy="$emit('handleCopy')"
              @handleShowRightMenu="handleShowRightMenu"
              @handleDelete="$emit('handleDelete')"
            />
          </transition-group>
        </draggable>
      </a-col>
    </a-row>

    <tool-bar v-bind="$props" v-on="{ ...$listeners }" />
  </div>
</template>
<script>
import base from "./base";

export default {
  name: "gridLayoutItem",
  extends: base,
};
</script>
