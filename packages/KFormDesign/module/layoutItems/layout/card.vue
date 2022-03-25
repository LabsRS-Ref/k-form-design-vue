<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 21:04:38
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItems/layout/card.vue
 * @LastEditTime : 2022-03-25 20:46:31
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<template>
  <div class="grid-box" :class="{ active: record.key === selectItem.key }" @click.stop="handleSelectItem(record)">
    <a-card class="grid-row" :title="record.label">
      <div class="grid-col">
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
          <transition-group tag="div" name="list" class="list-main">
            <layoutItem
              class="drag-move"
              v-for="item in record.list"
              :key="item.key"
              :selectItem.sync="selectItem"
              :startType="startType"
              :insertAllowedType="insertAllowedType"
              :record="wrapRecord(item, false)"
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
      </div>
    </a-card>

    <tool-bar v-bind="$props" v-on="{ ...$listeners }" />
  </div>
</template>
<script>
import base from "./base";

export default {
  name: "CardLayoutItem",
  extends: base,
};
</script>
