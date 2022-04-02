/* eslint-disable no-use-before-define */
/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-21 15:01:39
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/types.ts
 * @LastEditTime : 2022-04-02 17:04:01
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 */

import Vue, { VNode } from "vue";

export interface IProps {
  x: number;
  y: number;
  [key: string]: any;
}

export interface IState {
  left: number;
  top: number;
  right: number | null;
  bottom: number | null;
  width: "auto" | number;
  height: "auto" | number;
  zIndex: "auto" | number;

  // 关联的VueDraggableResizableCell组件实例
  cell: {
    parent: null | IVDRCellInstance;
    children: IVDRCellInstance[];
    cache: {
      [key: string]: any;
    };
    aspectRatioInitialized: boolean;
    resizeSteps: {
      [key: string]: IResizeStepOptions;
    };
    effects: {
      resize: {
        [key: string]: IResizeEffectOptions;
      };
    };
  };

  isActive: boolean;
  isResizing: boolean;
  isDragging: boolean;
  isUpdatingForChildLayout: boolean;

  tempData: {
    lastResizeInfo: null | string;
    lastDraggingInfo: null | string;
  };
  history: {
    undo: any[];
    redo: any[];
  };

  // 元素resize观察者
  ro: null | MutationObserver;
  roObserveEleList: HTMLElement[];
}

export interface IVDRCellInstance extends Vue, IState, IProps {}

export interface IVDRCell extends Vue {
  [key: string]: any;
}

export interface IResizeStepOptions {
  // resize calculate offset, change ratio ... params
  leftOffset?: number;
  topOffset?: number;
  widthOffset?: number;
  heightOffset?: number;
  widthChangeRatio?: number;
  heightChangeRatio?: number;
  changeRatio?: number;
  // resize base params
  l?: number;
  t?: number;
  w?: number;
  h?: number;
  onHooks?: any[];
  parent?: IVDRCell;
}

export interface IResizeEffectOptions {}
