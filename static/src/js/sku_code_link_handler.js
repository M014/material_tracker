/** 
 * SKU 代码链接处理脚本 (Odoo 19 Web Components 版)
 * 功能：为列表视图中的料号链接添加点击事件，触发查看图纸操作
 */

(function() {
    'use strict';

    // 定义模块
    odoo.define('material_tracker.sku_link_handler', function(require) {
        var core = require('web.core');
        var Widget = require('web.Widget');
        var rpc = require('web.rpc');
        var ActionManager = require('web.ActionManager');
        
        // 监听 DOM 变化并初始化链接
        function initializeSkuLinks() {
            var links = document.querySelectorAll('a.o_form_uri[data-oid]');
            
            links.forEach(function(link) {
                // 检查是否已绑定事件
                if (link.dataset.skuHandlerBound) {
                    return;
                }
                
                link.style.cursor = 'pointer';
                link.style.color = '#017e84';
                link.style.fontWeight = '500';
                link.style.textDecoration = 'underline';
                
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    var itemId = parseInt(this.getAttribute('data-oid'), 10);
                    if (itemId) {
                        viewPdfAction(itemId);
                    }
                    return false;
                });
                
                link.dataset.skuHandlerBound = true;
            });
        }

        /**
         * 执行查看图纸的 action
         */
        function viewPdfAction(itemId) {
            rpc.query({
                model: 'material.tracker.item',
                method: 'action_view_pdf',
                args: [[itemId]]
            }).then(function(action) {
                if (action) {
                    return new ActionManager().do_action(action);
                }
            }).catch(function(error) {
                var message = '查看图纸失败';
                if (error.data && error.data.message) {
                    message = error.data.message;
                } else if (error.message) {
                    message = error.message;
                }
                
                // 使用 Odoo 核心通知
                require('web.Dialog').alert(null, message);
                console.error('action_view_pdf error:', error);
            });
        }

        // 页面加载时初始化
        $(document).ready(function() {
            initializeSkuLinks();
        });

        // 监听 AJAX 加载完成事件
        $(document).on('oe_list_content_reload', function() {
            setTimeout(initializeSkuLinks, 100);
        });

        // 使用 MutationObserver 监听 DOM 变化
        if (window.MutationObserver) {
            var observer = new MutationObserver(function(mutations) {
                var shouldReinit = false;
                
                for (var i = 0; i < mutations.length; i++) {
                    if (mutations[i].addedNodes.length > 0) {
                        shouldReinit = true;
                        break;
                    }
                }
                
                if (shouldReinit) {
                    setTimeout(initializeSkuLinks, 50);
                }
            });

            var config = {
                childList: true,
                subtree: true,
                characterData: false,
                attributes: false
            };

            var targetNode = document.querySelector('.o_content');
            if (targetNode) {
                observer.observe(targetNode, config);
            } else {
                observer.observe(document.body, config);
            }
        }

        return {
            initializeSkuLinks: initializeSkuLinks,
            viewPdfAction: viewPdfAction
        };
    });

})();
