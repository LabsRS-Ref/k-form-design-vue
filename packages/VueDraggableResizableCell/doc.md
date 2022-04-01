<!--
 * @Author       : sunzhifeng <ian.sun@auodigitech.com>
 * @Date         : 2022-03-08 17:03:50
 * @Description  : Created by sunzhifeng, Please coding something here
 * @FilePath     : /k-form-design-vue/packages/VueDraggableResizableCell/doc.md
 * @LastEditTime : 2022-04-01 17:01:07
 * @LastEditors  : sunzhifeng <ian.sun@auodigitech.com>
-->

# Development Document


## features

* [X] 支持实现针对antd-icon元素的resize支持， 内部包含SVG图
* [X] 支持SVG元素resize
* [X] 支持INPUT元素resize
* [X] 支持针对如: <a-date-picker /> 等元素的resize, 只能对宽带进行resize
* [X] 支持修改 <a-input placeholder="Input 输入框控件 附带Style" :style="{width: '280px'}"></a-input>
* [X] 支持字体大小的resize
* [X] 支持根据width height 的限制resize设置handler
* [X] 支持设置Tip信息
* [X] 支持附加对子节点的listener的hook操作
* [X] 支持屏蔽子孙节点的click穿透事件（依赖Hook作为基础来实现）
* [X] 暴露一些实例事件供外部使用，例如：Cell Resize事件
* [X] 支持对于包裹类型的节点，可以自定义resize的处理逻辑，包括副作用的处理，例如：<div<a-button /></div> 这种情况的处理
* [X] [Optimize]] 统一防止事件继续透传，vue中的v-on:click.stop 是否要统一在Cell组件中禁止掉（原因：无法知道n层子孙节点是否禁用事件传播）: 交由Hook 用户定制处理
* [ ] TODO: 支持Vue 内置组件transition 节点的处理
* [ ] TODO: 验证zoom的设置的影响
* [X] 支持嵌套的Cell组件，拖拽移动不互相影响
* [X] 嵌套Cell组件的resize，支持是否可以对嵌套Cell组件进行resize
* [X] 嵌套Cell组件的resize，支持选择resize的方式，如按步进模式，按比例模式
* [X] 支持字体大小的resize策略设置，默认是auto，选项包括：ratio，fit，auto
* [X] 嵌套Cell组件的resize，支持过滤掉不需要resize的子节点
* [X] 支持自动监听Cell所有子孙节点的变化，并自动更新
  * [X] 限制只允许在非拖拽及非resize状态下进行监听
* [X] 支持提供更多的Hooks处理，交由组件使用者自行定制

## Issues

* [X] fix [Bug] <a-auto-complete /> 设置成resizeScope: ['width']时，会导致自适应宽度失效, 使用 Math.round 解决 height 含0.5px的问题
* [X] fix [Bug] font-size, 有超出边界的情况， 如ANTD的Button
* [X] fix [Bug] 未考虑 scroll-x scroll-y 的情况
* [X] fix [Bug] img 元素延迟加载时，计算布局不准确
* [X] fix [Bug] picture 元素延迟加载时，计算布局不准确
* [X] fix [Bug] p 元素 boundingClientRect 的计算有问题， 如果元素内有文字， 则计算的高度会有问题
* TODO: [Bug] 字体可以改变的情况，placeholder没有改变
* TODO: [Bug] 元素被active，导致如 a 标签会跳转，应该禁用a标签的激活状态
* TODO: [Bug] SVG图，有offset的情况， 如ANTD的带有图标的Button
* TODO: [Bug]  <a-date-picker /> 内部元素总是被激活，影响拖拽及resize
* [X] fix [Bug] 嵌套Cell中，拖拽父亲Cell，子Cell应该跟随变动
* [X] fix [Bug] 嵌套Cell中，拖拽子Cell，父亲Cell不应该随之变动
* TODO: [Bug] 嵌套Cell中，子Cell中包含inline-block的元素，导致拖拽受限，总是居中在中部（例如：Antd的按钮）
* [X]: fix [Bug] 嵌套Cell中，子Cell初始化布局有问题，设置x,y 会导致子Cell的位置变动
* [X]: fix [Bug] 嵌套Cell中，子Cell被Resize后，激活状态可拖拽ResizeHandler位置及范围大小不准确
