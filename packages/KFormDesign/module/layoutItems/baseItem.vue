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
