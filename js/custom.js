/**
 * custom.js · 博客自定义脚本
 *
 * 1. 修复 TOC 目录点击跳转被固定导航栏遮挡的问题
 *    原因：主题 utils.js 的 scrollToDest 检查 #page-header 是否含 `fixed` 类，
 *    但 Butterfly 实际添加的是 `nav-fixed`，导致 isNavFixed 恒为 false，
 *    向下跳转时不减去导航栏高度（70px），标题被导航栏盖住。
 *    方案：在 capture 阶段拦截 TOC 点击，自行计算带偏移的滚动位置。
 *    用 document 委托以兼容 pjax 页面切换后 TOC 元素重建。
 */
(function () {
  'use strict'

  // 导航栏高度偏移（与主题 #nav height: 60px + 少量间距一致）
  var NAV_OFFSET = 72

  function scrollToHeading(target) {
    if (!target) return
    var pos = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
    // 边界：不低于 0
    if (pos < 0) pos = 0
    window.scrollTo({
      top: pos,
      behavior: 'smooth'
    })
  }

  function handleTocClick(e) {
    // 仅处理 #card-toc 内的 .toc-link 点击
    var cardToc = document.getElementById('card-toc')
    if (!cardToc) return
    var link = e.target.closest('.toc-link')
    if (!link || !cardToc.contains(link)) return

    e.preventDefault()
    e.stopPropagation()

    var href = link.getAttribute('href') || ''
    if (href.charAt(0) !== '#') return

    // 与主题一致用 decodeURI 解码（标题 ID 可能含中文/全角字符）
    var id
    try {
      id = decodeURI(href.slice(1))
    } catch (err) {
      id = href.slice(1)
    }
    var target = document.getElementById(id)
    if (target) {
      scrollToHeading(target)
    }

    // 移动端点击后关闭 TOC 浮层
    if (window.innerWidth < 900 && cardToc) {
      cardToc.classList.remove('open')
    }
  }

  // capture 阶段拦截，先于主题的 target/bubbling 阶段监听器执行
  document.addEventListener('click', handleTocClick, true)
})()
