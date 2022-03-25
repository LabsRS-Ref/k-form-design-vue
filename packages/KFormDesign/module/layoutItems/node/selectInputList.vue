<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-19 09:01:22
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItems/node/selectInputList.vue
 * @LastEditTime : 2022-03-25 19:59:32
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<template>
  <div
    class="select-input-list-box"
    :class="{ active: record.key === selectItem.key }"
    @click.stop="handleSelectItem(record)"
  >
    <a-form-item
      :label="!record.options.showLabel ? '' : record.label"
      :label-col="
        config.layout === 'horizontal' && record.options.showLabel
          ? config.labelLayout === 'flex'
            ? { style: `width:${config.labelWidth}px` }
            : config.labelCol
          : {}
      "
      :wrapper-col="
        config.layout === 'horizontal' && record.options.showLabel
          ? config.labelLayout === 'flex'
            ? { style: 'width:auto;flex:1' }
            : config.wrapperCol
          : {}
      "
      :style="
        config.layout === 'horizontal' && config.labelLayout === 'flex' && record.options.showLabel
          ? { display: 'flex' }
          : {}
      "
    >
      <div class="column-box" v-for="(column, index) in record.columns" :key="index">
        <div class="check-box">
          <a-checkbox v-if="record.options.multiple" disabled>
            {{ column.label }}
          </a-checkbox>
          <a-radio-group v-else disabled name="radio">
            <a-radio :value="column.value">{{ column.label }}</a-radio>
          </a-radio-group>
        </div>
        <draggable
          tag="div"
          class="draggable-box"
          v-bind="{
            group: insertAllowed ? 'form-draggable' : '',
            ghostClass: 'moving',
            animation: 180,
            handle: '.drag-move',
          }"
          v-model="column.list"
          @start="$emit('dragStart', $event, column.list)"
          @add="$emit('handleColAdd', $event, column.list)"
        >
          <transition-group tag="div" name="list" class="list-main">
            <form-node
              v-for="item in column.list"
              :key="item.key"
              class="drag-move"
              :selectItem.sync="selectItem"
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
      </div>
    </a-form-item>

    <tool-bar v-bind="$props" v-on="{ ...$listeners }" />
  </div>
</template>
<script>
import base from "./base";

export default {
  name: "SelectInputListNodeItem",
  extends: base,
};
</script>
