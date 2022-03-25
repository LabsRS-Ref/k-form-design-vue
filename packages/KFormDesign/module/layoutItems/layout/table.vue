<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 16:20:14
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItems/layout/table.vue
 * @LastEditTime : 2022-03-25 20:46:14
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<template>
  <div class="table-box" :class="{ active: record.key === selectItem.key }" @click.stop="handleSelectItem(record)">
    <table
      class="table-layout kk-table-9136076486841527"
      :class="{
        bright: record.options.bright,
        small: record.options.small,
        bordered: record.options.bordered,
      }"
      :style="record.options.customStyle"
    >
      <tr v-for="(trItem, trIndex) in record.trs" :key="trIndex">
        <td
          class="table-td"
          v-for="(tdItem, tdIndex) in trItem.tds"
          v-show="tdItem.colspan && tdItem.rowspan"
          :key="tdIndex"
          :colspan="tdItem.colspan"
          :rowspan="tdItem.rowspan"
          @contextmenu.prevent="$emit('handleShowRightMenu', $event, record, trIndex, tdIndex)"
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
            v-model="tdItem.list"
            @start="$emit('dragStart', $event, tdItem.list)"
            @add="$emit('handleColAdd', $event, tdItem.list)"
          >
            <transition-group tag="div" name="list" class="list-main">
              <layout-item
                v-for="item in tdItem.list"
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
        </td>
      </tr>
    </table>

    <tool-bar v-bind="$props" v-on="{ ...$listeners }" />
  </div>
</template>
<script>
import base from "./base";

export default {
  name: "TableLayoutItem",
  extends: base,
};
</script>
