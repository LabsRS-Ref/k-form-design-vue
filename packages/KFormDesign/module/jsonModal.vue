<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-18 08:59:35
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/KFormDesign/module/jsonModal.vue
 * @LastEditTime : 2022-03-31 15:35:43
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->
<template>
  <a-modal
    title="JSON数据"
    :footer="null"
    :visible="visible"
    @cancel="handleCancel"
    :destroyOnClose="true"
    wrapClassName="code-modal-9136076486841527"
    style="top:20px;"
    width="850px"
  >
    <previewCode :editorJson="editorJson" />
  </a-modal>
</template>
<script>
/*
 * author kcz
 * date 2019-11-20
 * description 生成json Modal
 */
import serialize from "serialize-javascript";
import previewCode from "../../PreviewCode/index";

export default {
  name: "JsonModal",
  data() {
    return {
      visible: false,
      editorJson: "",
      jsonData: {},
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.editorJson = serialize(this.jsonData, { space: 2 });
      }
    },
  },
  components: {
    previewCode,
  },
  methods: {
    handleCancel() {
      this.visible = false;
    },
  },
};
</script>
