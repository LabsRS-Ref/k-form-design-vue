<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-19 08:17:16
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItems/node/batch.vue
 * @LastEditTime : 2022-03-19 10:44:32
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<template>
  <div class="batch-box" :class="{ active: record.key === selectItem.key }" @click.stop="handleSelectItem(record)">
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
      <draggable
        tag="div"
        class="draggable-box"
        v-bind="{
          group: insertAllowed ? 'form-draggable' : '',
          ghostClass: 'moving',
          animation: 180,
          handle: '.drag-move',
        }"
        v-model="record.list"
        @start="$emit('dragStart', $event, record.list)"
        @add="$emit('handleColAdd', $event, record.list)"
      >
        <transition-group tag="div" name="list" class="list-main">
          <formNode
            v-for="item in record.list"
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
    </a-form-item>

    <tool-bar v-bind="$props" v-on="{ ...$listeners }" />
  </div>
</template>
<script>
import base from "./base";

export default {
  name: "batchNodeItem",
  extends: base,
};
</script>
