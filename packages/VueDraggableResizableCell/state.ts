/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-31 08:36:43
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/state.ts
 * @LastEditTime : 2022-04-02 17:04:08
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 */

import { IState, IVDRCellInstance } from "./types";

const createState = (instance: IVDRCellInstance): IState => {
  return {
    // 以下内容是传递给最基础组件的，参加器Props说明
    left: instance.x,
    top: instance.y,
    right: null,
    bottom: null,
    width: "auto",
    height: "auto",
    zIndex: "auto",

    cell: {
      parent: null,
      children: [],
      cache: {},
      aspectRatioInitialized: false,
      resizeSteps: {},
      effects: {
        resize: {},
      },
    },

    isActive: false,
    isResizing: false,
    isDragging: false,
    isUpdatingForChildLayout: false,

    tempData: {
      lastResizeInfo: null,
      lastDraggingInfo: null,
    },
    history: {
      undo: [],
      redo: [],
    },

    // 元素resize观察者
    ro: null,
    roObserveEleList: [],
  };
};

export default createState;
