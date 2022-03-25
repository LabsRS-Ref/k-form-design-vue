//@ts-nocheck
/*
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-25 16:57:21
 * @Description  : 清除指定文件的包含的debug语句信息
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/$tools/remove_debug.ts
 * @LastEditTime : 2022-03-25 19:01:39
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
 */

// 命令执行: deno run --allow-write --allow-read remove_debug.ts

const __filename = new URL('', import.meta.url).pathname;
const __dirname = new URL('.', import.meta.url).pathname;

const reg1 = /[\/]{1,} debug\(.*?\);\n[\s| ]*/g;
const reg2 = /debug\(.*?\);\n[\s| ]*/g; // 正则表达式

async function remove(filePath: string, newFilePath: string) {
  const fileContent = await Deno.readTextFile(filePath);
  const newFileContent = fileContent.replace(reg1, "").replace(reg2, "");
  await Deno.writeTextFile(newFilePath, newFileContent);
}

for await (const iterator of [
  "../Cell-debug.vue",
]) {
  const filePath = `${__dirname}/${iterator}`;
  const newFilePath = `${__dirname}/${iterator.replace(
    "-debug",
    ""
  )}`;
  await remove(filePath, newFilePath);
}