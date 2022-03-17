import DEF from "./def";
import { isFunction } from "./util";
const props = {
    constraintsInParent: {
        type: Boolean,
        default: () => false,
    },
    className: {
        type: String,
        default: "cell",
    },
    classNameVDR: {
        type: String,
        default: "vdr",
    },
    classNameDraggable: {
        type: String,
        default: "draggable",
    },
    classNameResizable: {
        type: String,
        default: "resizable",
    },
    classNameDragging: {
        type: String,
        default: "dragging",
    },
    classNameResizing: {
        type: String,
        default: "resizing",
    },
    classNameActive: {
        type: String,
        default: "active",
    },
    classNameHandle: {
        type: String,
        default: "handle",
    },
    x: {
        type: Number,
        default: 0,
    },
    y: {
        type: Number,
        default: 0,
    },
    z: {
        type: [String, Number],
        default: "auto",
        validator: (val) => typeof val === "string" ? val === "auto" : val >= 0,
    },
    minWidth: {
        type: Number,
        default: 0,
        validator: (val) => val >= 0,
    },
    minHeight: {
        type: Number,
        default: 0,
        validator: (val) => val >= 0,
    },
    maxWidth: {
        type: Number,
        default: null,
        validator: (val) => val >= 0,
    },
    maxHeight: {
        type: Number,
        default: null,
        validator: (val) => val >= 0,
    },
    draggable: {
        type: Boolean,
        default: true,
    },
    resizable: {
        type: Boolean,
        default: true,
    },
    resizeScope: {
        type: Array,
        default: () => DEF.defaultResizeScope,
        validator: (val) => {
            return val.every((item) => {
                if (isFunction(item)) {
                    DEF.resizeScope.includes(item());
                }
                if (DEF.resizeScope.includes(item)) {
                    return true;
                }
                return false;
            });
        },
    },
    resizeScopeManipulation: {
        type: String,
        default: () => "assign",
        validator: (val) => {
            return DEF.resizeScopeManipulation.includes(val);
        },
    },
    resizeFontStrategy: {
        type: String,
        default: () => "auto",
        validator: (val) => {
            return DEF.resizeFontStrategies.includes(val);
        },
    },
    nestingCellResizeStrategy: {
        type: String,
        default: () => DEF.defaultNestingCellResizeStrategy,
        validator: (val) => {
            return DEF.nestingCellResizeStrategies.includes(val);
        },
    },
    resizeHooks: {
        type: Object,
        default: () => ({}),
        validator: (val) => {
            return Object.keys(val).every((key) => {
                return (typeof val[key] === "function" &&
                    DEF.supportResizeHookNames.includes(key));
            });
        },
    },
    draggableHooks: {
        type: Object,
        default: () => ({}),
        validator: (val) => {
            return Object.keys(val).every((key) => {
                return (typeof val[key] === "function" &&
                    DEF.supportDraggableHookNames.includes(key));
            });
        },
    },
    lockAspectRatio: {
        type: Boolean,
        default: false,
    },
    autoMinWidthSet: {
        type: Boolean,
        default: true,
    },
    autoMinHeightSet: {
        type: Boolean,
        default: true,
    },
    reserveCellTransition: {
        type: [String, Boolean],
        default: "none",
    },
    markPropertyName: {
        type: String,
        default: "__$cell_$id__",
        validator: (val) => {
            return val.trim() !== "" && val.trim().startsWith("__$cell_");
        },
    },
    cellChildNodeInitInfoHooks: {
        type: Object,
        default: () => ({}),
        validator: (val) => {
            return Object.keys(val).every((key) => {
                return (typeof val[key] === "function" &&
                    (key.startsWith("after") || key.startsWith("before")));
            });
        },
    },
    childrenListenerHooks: {
        type: Object,
        default: () => ({}),
        validator: (val) => {
            return Object.keys(val).every((key) => {
                return (typeof val[key] === "function" &&
                    (key.startsWith("after_") || key.startsWith("before_")));
            });
        },
    },
    computeAndUpdateLayoutHook: {
        type: Function,
        default: () => { },
        validator: (val) => {
            return typeof val === "function";
        },
    },
    tip: {
        type: String,
        default: "",
    },
};
export default props;
