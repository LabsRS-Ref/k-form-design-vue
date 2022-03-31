<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 15:50:49
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItems/layout/free.vue
 * @LastEditTime : 2022-03-30 21:42:39
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->

<template>
  <div class="grid-box" :class="{ active: record.key === selectItem.key }" @click.stop="handleSelectItem(record)">
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
      <transition-group tag="div" name="list" class="list-main" :style="transitionGroupStyle">
        <div v-for="item in record.list" :key="item.key" @click.stop="void 0" :class="{ 'drag-move': false }">
          <component
            :key="item.key"
            :is="getWrapperBy(item)"
            v-bind="{
              ...getWrapperPropsBy(item, $props, $attrs),
            }"
            v-on="{
              ...getWrapperListenersBy(item, $listeners),
            }"
          >
            <layoutItem
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
          </component>
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
  methods: {
    isLayoutItem(type) {
      return Object.keys(this.registeredLayoutTypeMap).includes(type);
    },
    getWrapperBy({ type }) {
      const { VueDraggableResizableCell } = this.$options.components;
      const isLayout = this.isLayoutItem(type);
      // HACK: 使用Fragment组件，会出错，单独嵌入简单的Item时，使用 div 替代
      return isLayout ? VueDraggableResizableCell : "div";
    },
    getWrapperPropsBy(item) {
      if (this.isLayoutItem(item.type)) {
        return {
          ...item.vdrCellOptions,
        };
      }
      return {};
    },
    getWrapperListenersBy(item) {
      if (this.isLayoutItem(item.type)) {
        const updateVDRCellLayout = ({ left: x, top: y, width: w, height: h }) => {
          // eslint-disable-next-line no-param-reassign
          item.vdrCellOptions = {
            ...item.vdrCellOptions,
            x,
            y,
            w,
            h,
          };
        };
        return {
          activated: (cell) => {
            this.handleSelectItem(item);
            updateVDRCellLayout(cell);
          },
          deactivated: (cell) => updateVDRCellLayout(cell),
          cellDragStart: (cell) => updateVDRCellLayout(cell),
          cellDragging: (cell) => updateVDRCellLayout(cell),
          cellDragEnd: (cell) => updateVDRCellLayout(cell),
          cellResizeEnd: (cell) => updateVDRCellLayout(cell),
          cellResizeStart: (cell) => updateVDRCellLayout(cell),
          cellResizing: (cell) => updateVDRCellLayout(cell),
        };
      }

      return {};
    },
  },
};
</script>
