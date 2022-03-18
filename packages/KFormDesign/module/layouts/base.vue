<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 16:05:59
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layouts/base.vue
 * @LastEditTime : 2022-03-18 21:34:49
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<script>
export default {
  props: {
    record: {
      type: Object,
      required: true,
    },
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
    // HACK: 使用函数方式，有效解决自循环包含的组件，name的警告问题
    layoutItem: () => import("../layoutItem.vue"),
    toolBar: () => import("./components/toolBar.vue"),
    draggable: () => import("vuedraggable"),
  },
  methods: {
    handleShowRightMenu(e, record, trIndex, tdIndex) {
      this.$emit("handleShowRightMenu", e, record, trIndex, tdIndex);
    },
    handleSelectItem(record) {
      this.$emit("handleSelectItem", record);
    },
    handleColAdd(e, list) {
      this.$emit("handleColAdd", e, list);
    },
  },
};
</script>
