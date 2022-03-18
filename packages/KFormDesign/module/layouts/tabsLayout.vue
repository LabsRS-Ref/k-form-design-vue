<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 21:04:38
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layouts/tabsLayout.vue
 * @LastEditTime : 2022-03-18 21:57:34
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<template>
  <div
    class="grid-box"
    :class="{ active: record.key === selectItem.key }"
    @click.stop="handleSelectItem(record)"
  >
    <a-tabs
      class="grid-row"
      :default-active-key="0"
      :tabBarGutter="record.options.tabBarGutter || null"
      :type="record.options.type"
      :size="record.options.size"
      :tabPosition="record.options.tabPosition"
      :animated="record.options.animated"
    >
      <a-tab-pane
        v-for="(tabItem, index) in record.columns"
        :key="index"
        :tab="tabItem.label"
      >
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
            v-model="tabItem.list"
            @start="$emit('dragStart', $event, tabItem.list)"
            @add="$emit('handleColAdd', $event, tabItem.list)"
          >
            <transition-group tag="div" name="list" class="list-main">
              <layoutItem
                class="drag-move"
                v-for="item in tabItem.list"
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
        </div>
      </a-tab-pane>
    </a-tabs>

    <tool-bar v-bind="$props" v-on="{ ...$listeners }" />
  </div>
</template>
<script>
import base from "./base";

export default {
  name: "tabsLayoutItem",
  extends: base,
};
</script>
