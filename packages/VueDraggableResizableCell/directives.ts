/* eslint-disable import/prefer-default-export */
/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-03 11:01:33
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 * @LastEditTime : 2022-04-01 10:04:06
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/directives.ts
 * @Description  : Created by sunzhifeng, Please coding something here
 */

import { VNode } from "vue";
import {
  debug as debugUtil,
  createIntersectionObserver,
  isFunction,
  getBoundingClientRect,
  getVideoControlDimensions,
} from "./util";

export type AnyObject = { [key: string]: any };

export type VNodeDirective = AnyObject;
export type VNodeDirectiveBinding = AnyObject;

export type VNodeDirectiveContext = {
  el: HTMLElement;
  binding: AnyObject;
  vnode: VNode;
  oldVnode: VNode;
};

export type LoadResultData = {
  consultWidth?: number;
  consultHeight?: number;
};

export type LoadElementType = "img" | "video" | "audio";

export type LoadResult = {
  load: boolean;
  type: LoadElementType;
  error?: Error;
  data?: LoadResultData;
};

export type LoadCallback = (
  results: LoadResult,
  context: VNodeDirectiveContext
) => void;

function _debug(...args: any) {
  debugUtil("[directives]", ...args);
}

export const createLazyLoadDirective = (handler: LoadCallback = () => {}) => {
  const noticeFnc: LoadCallback = isFunction(handler) ? handler : () => {};

  return {
    // 当被绑定的元素插入到DOM中时……
    inserted(
      el: HTMLElement,
      binding: VNodeDirectiveBinding,
      vnode: VNode,
      oldVnode: VNode
    ) {
      // _debug("inserted", { el, binding, vnode, oldVnode });
      const context = { el, binding, vnode, oldVnode };
      const load = (element: HTMLElement) => {
        const loadImage = (img: HTMLImageElement, notice = true) => {
          if (img) {
            const url = img.getAttribute("src") || "null";
            img.addEventListener("load", () => {
              const rect = getBoundingClientRect(img);
              noticeFnc(
                {
                  load: true,
                  type: "img",
                  data: {
                    consultWidth: rect.width,
                    consultHeight: rect.height,
                  },
                },
                context
              );
            });
            img.addEventListener("error", () => {
              noticeFnc(
                {
                  load: false,
                  type: "img",
                  error: new Error("image load failed ..."),
                },
                context
              );
            });
            // eslint-disable-next-line no-param-reassign
            img.src = url;
          }
        };
        const loadPicture = (pic: HTMLPictureElement, notice = true) => {
          if (pic) {
            const imgs = pic.getElementsByTagName("img") || [];
            for (let i = 0; i < imgs.length; i += 1) {
              loadImage(imgs[i], notice);
            }
          }
        };

        const loadVideo = (video: HTMLVideoElement, notice = true) => {
          if (video) {
            video.addEventListener("loadedmetadata", (e) => {
              // _debug("video loadedmetadata", e);
              const videoElement = e.target as HTMLVideoElement;
              const { width, height } = getVideoControlDimensions(videoElement);
              noticeFnc(
                {
                  load: true,
                  type: "video",
                  data: {
                    consultWidth: width,
                    consultHeight: height,
                  },
                },
                context
              );
            });
          }
        };
        const loadAudio = () => {};
        const loadIframe = () => {};
        const loadOther = () => {};

        loadImage(
          Array.from([element, ...element.children]).find(
            (childEle) => childEle.tagName === "IMG"
          ) as HTMLImageElement
        );
        loadPicture(
          Array.from([element, ...element.children]).find(
            (childEle) => childEle.tagName === "PICTURE"
          ) as HTMLPictureElement
        );
        loadVideo(
          Array.from([element, ...element.children]).find(
            (childEle) => childEle.tagName === "VIDEO"
          ) as HTMLVideoElement
        );
        loadAudio();
        loadIframe();
        loadOther();
      };

      if (window?.IntersectionObserver) {
        createIntersectionObserver(el, load);
      } else {
        load(el);
      }
    },
  };
};

export const lazyLoad = createLazyLoadDirective();
