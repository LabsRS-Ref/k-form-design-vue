<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 16:05:59
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItems/baseItem.vue
 * @LastEditTime : 2022-03-19 17:33:13
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<script>
export default {
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
    vueDraggableResizableCell: () =>
      import("../../../VueDraggableResizableCell/index"),
    Fragment: () => import("vue-fragment"), // 使用Fragment，解决不允许多节点问题
  },
  methods: {
    handleShowRightMenu(e, record, trIndex, tdIndex) {
      this.$emit("handleShowRightMenu", e, record, trIndex, tdIndex);
    },
    handleSelectItem(record) {
      console.log(`handleSelectItem: ${record.key}`);
      this.$emit("handleSelectItem", record);
    },
    handleColAdd(e, list) {
      this.$emit("handleColAdd", e, list);
    },
  },
};
</script>
