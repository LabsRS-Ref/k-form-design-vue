<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 16:05:59
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItems/baseItem.vue
 * @LastEditTime : 2022-03-25 20:43:25
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<script>
export default {
  name: "BaseItem",
  props: {
    record: { type: Object, required: true },
    selectItem: { type: Object, required: true },
    config: { type: Object, required: true },
    startType: { type: String, required: true },
    insertAllowedType: { type: Array, required: true },
    hideModel: { type: Boolean, default: false },
  },
  computed: {
    insertAllowed() {
      return this.insertAllowedType.includes(this.startType);
    },
  },
  components: {
    draggable: () => import("vuedraggable"),
    VueDraggableResizableCell: () => import("../../../VueDraggableResizableCell/index"),
    Fragment: () => import("vue-fragment"), // 使用Fragment，解决不允许多节点问题
  },
  methods: {
    handleShowRightMenu(e, record, trIndex, tdIndex) {
      this.$emit("handleShowRightMenu", e, record, trIndex, tdIndex);
    },
    handleSelectItem(record) {
      console.log("%c%s", "color: #2346dd", `handleSelectItem=${record.label}-${record.key} [${this.$options.name}]`);
      this.$emit("handleSelectItem", record);
    },
    handleColAdd(e, list) {
      this.$emit("handleColAdd", e, list);
    },
    wrapRecord(record, isVDRCell = true) {
      if (record.vdrCellOptions && typeof record.vdrCellOptions.enable === "boolean") {
        // eslint-disable-next-line no-param-reassign
        record.vdrCellOptions.enable = !!isVDRCell;
      }

      return record;
    },
  },
};
</script>
