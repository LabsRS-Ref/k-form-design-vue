import { createLazyLoadDirective } from "./directives";
import Cell from "./index.vue";
import * as util from "./util";
export function install(Vue) {
    if (install === null || install === void 0 ? void 0 : install.installed) {
        return;
    }
    install.installed = true;
    Vue.component(Cell.name, Cell);
}
export const utils = util;
export const directives = {
    createLazyLoadDirective,
};
export default Cell;
