import { debug as debugUtil, createIntersectionObserver, isFunction, getBoundingClientRect, getVideoControlDimensions, } from "./util";
function _debug(...args) {
    debugUtil("[directives]", ...args);
}
export const createLazyLoadDirective = (handler = () => { }) => {
    const noticeFnc = isFunction(handler) ? handler : () => { };
    return {
        inserted(el, binding, vnode, oldVnode) {
            const context = { el, binding, vnode, oldVnode };
            const load = (element) => {
                const loadImage = (img, notice = true) => {
                    if (img) {
                        const url = img.getAttribute("src") || "null";
                        img.addEventListener("load", () => {
                            const rect = getBoundingClientRect(img);
                            notice &&
                                noticeFnc({
                                    load: true,
                                    type: "img",
                                    data: {
                                        consultWidth: rect.width,
                                        consultHeight: rect.height,
                                    },
                                }, context);
                        });
                        img.addEventListener("error", () => {
                            notice &&
                                noticeFnc({
                                    load: false,
                                    type: "img",
                                    error: new Error("image load failed ..."),
                                }, context);
                        });
                        img.src = url;
                    }
                };
                const loadPicture = (pic, notice = true) => {
                    if (pic) {
                        const imgs = pic.getElementsByTagName("img") || [];
                        for (let i = 0; i < imgs.length; i += 1) {
                            loadImage(imgs[i], notice);
                        }
                    }
                };
                const loadVideo = (video, notice = true) => {
                    if (video) {
                        video.addEventListener("loadedmetadata", (e) => {
                            const videoElement = e.target;
                            const { width, height } = getVideoControlDimensions(videoElement);
                            notice &&
                                noticeFnc({
                                    load: true,
                                    type: "video",
                                    data: {
                                        consultWidth: width,
                                        consultHeight: height,
                                    },
                                }, context);
                        });
                    }
                };
                const loadAudio = () => { };
                const loadIframe = () => { };
                const loadOther = () => { };
                loadImage(Array.from([element, ...element.children]).find((childEle) => childEle.tagName === "IMG"));
                loadPicture(Array.from([element, ...element.children]).find((childEle) => childEle.tagName === "PICTURE"));
                loadVideo(Array.from([element, ...element.children]).find((childEle) => childEle.tagName === "VIDEO"));
                loadAudio();
                loadIframe();
                loadOther();
            };
            if (window === null || window === void 0 ? void 0 : window.IntersectionObserver) {
                createIntersectionObserver(el, load);
            }
            else {
                load(el);
            }
        },
    };
};
export const lazyLoad = createLazyLoadDirective();
