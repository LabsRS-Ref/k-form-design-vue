import Vue from "vue";
export function isFunction(func) {
    return (typeof func === "function" ||
        Object.prototype.toString.call(func) === "[object Function]");
}
export function getBoundingClientRect(el) {
    if (el && isFunction(el.getBoundingClientRect)) {
        return el.getBoundingClientRect();
    }
    return new DOMRect();
}
export function forEachNode(currentNode, callback = () => { }, { deep = true, levels = [], parent = null } = {}) {
    var _a, _b;
    if (isFunction(callback)) {
        callback(currentNode, 0, [currentNode], levels.length - 1, parent);
    }
    if (!currentNode)
        return;
    let childNodes = [];
    if (currentNode instanceof Vue) {
        if (currentNode.$vnode) {
            childNodes = currentNode.$children;
        }
        else if (currentNode.children) {
            childNodes = ((_b = (_a = currentNode) === null || _a === void 0 ? void 0 : _a.componentInstance) === null || _b === void 0 ? void 0 : _b.$children) || [];
        }
    }
    else if (currentNode instanceof Node) {
        childNodes = currentNode.childNodes;
    }
    levels.push(currentNode);
    (childNodes !== null && childNodes !== void 0 ? childNodes : []).forEach((child, index, list) => {
        if (deep) {
            forEachNode(child, callback, {
                deep,
                levels,
                parent: currentNode,
            });
        }
        else if (isFunction(callback)) {
            callback(child, index, list, levels.length - 1, currentNode);
        }
    });
}
export function getVueInstanceByUnknownNode(currentNode) {
    if (currentNode instanceof Vue) {
        if (currentNode.$vnode) {
            return currentNode;
        }
        if (currentNode.componentInstance) {
            return currentNode.componentInstance;
        }
        return null;
    }
    if (currentNode instanceof Node) {
        return currentNode === null || currentNode === void 0 ? void 0 : currentNode.__vue__;
    }
    return null;
}
export function checkVueInstanceContainsNode(vueInstance, node) {
    if (vueInstance.$el) {
        return vueInstance.$el.contains(node);
    }
    return false;
}
export function isPointInRect(point, rect) {
    return (point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height);
}
export function isPointInDOMRect(point, rect) {
    return (point.x >= rect.left &&
        point.x <= rect.right &&
        point.y >= rect.top &&
        point.y <= rect.bottom);
}
export function getOffsetRect(el) {
    if (el) {
        return new DOMRect(el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight);
    }
    return new DOMRect();
}
export function getOffset(el) {
    if (el && isFunction(el.getBoundingClientRect)) {
        const rect = el.getBoundingClientRect();
        return {
            x: rect.left + document.body.scrollLeft,
            y: rect.top + document.body.scrollTop,
        };
    }
    return { x: 0, y: 0 };
}
export function isTransitionComponentName(name) {
    return ["transition-group", "TransitionGroup"].includes(name);
}
export function isTransitionComponent(slots) {
    if (!Array.isArray(slots)) {
        return false;
    }
    if (slots.length !== 1) {
        return false;
    }
    const [{ componentOptions }] = slots;
    if (!componentOptions) {
        return false;
    }
    const { tag } = componentOptions;
    return isTransitionComponentName(tag);
}
export function getVideoControlDimensions(videoElement) {
    if (videoElement) {
        return {
            width: videoElement.offsetWidth,
            height: videoElement.offsetHeight,
        };
    }
    return {
        width: 0,
        height: 0,
    };
}
export function getVideoDimensions(videoElement) {
    if (videoElement) {
        return {
            width: videoElement.videoWidth,
            height: videoElement.videoHeight,
        };
    }
    return {
        width: 0,
        height: 0,
    };
}
export function createIntersectionObserver(element, observerHandler) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                observerHandler && observerHandler(element);
                observer.unobserve(element);
            }
        });
    });
    observer.observe(element);
}
export function addEvent(el, event, handler) {
    if (!el) {
        return;
    }
    if (el.attachEvent) {
        el.attachEvent(`on${event}`, handler);
    }
    else if (el.addEventListener) {
        el.addEventListener(event, handler, true);
    }
    else {
        el[`on${event}`] = handler;
    }
}
export function removeEvent(el, event, handler) {
    if (!el) {
        return;
    }
    if (el.detachEvent) {
        el.detachEvent(`on${event}`, handler);
    }
    else if (el.removeEventListener) {
        el.removeEventListener(event, handler, true);
    }
    else {
        el[`on${event}`] = null;
    }
}
export function getDocumentElementFontSize() {
    return (parseFloat(window.getComputedStyle(document.documentElement).fontSize) ||
        16.0);
}
export function remToPx(rem) {
    return rem * getDocumentElementFontSize();
}
export function getTextWidth(text, font) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context) {
        context.font = font;
        return context.measureText(text).width;
    }
    throw new Error("Canvas is not supported");
}
export function fitTextToBox(text = "", clientHeight = 0, clientWidth = 0, fontFamily = "") {
    const factor = getDocumentElementFontSize();
    const bh = clientHeight / factor;
    const bw = clientWidth / factor;
    const fh = 1;
    const fw = getTextWidth(text, `${fh}rem ${fontFamily}`);
    const scaleFont = (2.0 * Math.sqrt(bh * bw)) / Math.sqrt(fw);
    const fontSize = `${scaleFont * fh}rem`;
    return fontSize;
}
fitTextToBox.px = (...args) => remToPx(parseFloat(fitTextToBox(...args)));
export function restrictToBounds(value, min, max) {
    if (min !== null && value < min) {
        return min;
    }
    if (max !== null && max < value) {
        return max;
    }
    return value;
}
export function boundNumberFilter(args, { selectMaxValue = true, maxValueOffset = 0, minValueOffset = 0 } = {}) {
    const fn = selectMaxValue ? Math.max : Math.min;
    return fn(Math.round(fn(...args) + maxValueOffset), Math.floor(fn(...args) + minValueOffset));
}
boundNumberFilter.max = (args, options) => boundNumberFilter(args, Object.assign(Object.assign({}, options), { selectMaxValue: true }));
boundNumberFilter.min = (args, options) => boundNumberFilter(args, Object.assign(Object.assign({}, options), { selectMaxValue: false }));
export function assignNoNullValue(curValue = 0, newValue = 0) {
    return curValue !== newValue && newValue !== null ? newValue : curValue;
}
export function checkAssert(condition, ...args) {
    console.assert(condition, ...args);
}
export function debug(group, ...args) {
    const filters = [];
    if (filters.includes(group))
        return;
    console.log(`[${group}]☛`, ...args);
}
