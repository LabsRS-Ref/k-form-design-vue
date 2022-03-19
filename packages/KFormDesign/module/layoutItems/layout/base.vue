<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-19 09:44:41
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/layoutItems/layout/base.vue
 * @LastEditTime : 2022-03-19 10:43:21
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<script>
import base from "../baseItem.vue";

export default {
  name: "baseLayout",
  extends: base,
  components: {
    toolBar: () => import("../components/toolBar.vue"),
    // HACK: 使用函数方式，有效解决自循环包含的组件，name的警告问题
    layoutItem: () => import("../../layoutItem.vue"),
    // 关联的节点
    formNode: () => import("../../formNode.vue"),
  },
};
</script>
