/** 
 * SKU 代码链接处理脚本
 * 功能：为列表视图中的料号链接添加点击事件，触发查看图纸操作
 */
(function() {
    'use strict';

    // 等待 Odoo 框架加载完成
    document.addEventListener('DOMContentLoaded', function() {
        initSkuCodeLinks();
    });

    // 当动态内容加载时也要重新初始化（用于列表视图刷新）
    if (window.odoo && window.odoo.define) {
        window.odoo.define('material_tracker.sku_link_handler', function(require) {
            var ListController = require('web.ListController');
            var originalRender = ListController.prototype.renderButtons;
            
            ListController.prototype.renderButtons = function() {
                var result = originalRender.apply(this, arguments);
                initSkuCodeLinks();
                return result;
            };
        });
    }

    /**
     * 初始化料号链接的点击事件处理
     */
    function initSkuCodeLinks() {
        var links = document.querySelectorAll('a.o_form_uri.o_field_uri[data-oid]');
        
        links.forEach(function(link) {
            // 移除已存在的事件监听器（防止重复绑定）
            var newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            newLink.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var itemId = parseInt(this.getAttribute('data-oid'), 10);
                if (itemId) {
                    triggerViewPdf(itemId);
                }
            });
        });
    }

    /**
     * 触发查看图纸操作
     * @param {number} itemId - 料号 ID
     */
    function triggerViewPdf(itemId) {
        if (!window.odoo || !window.odoo.client_action) {
            console.error('Odoo framework not loaded');
            return;
        }

        // 通过 RPC 调用 action_view_pdf 方法
        window.odoo.client_action.client_action_manager.do_action({
            type: 'ir.actions.client',
            tag: 'action_view_pdf',
            params: { item_id: itemId }
        }).catch(function(error) {
            console.error('Error calling action_view_pdf:', error);
        });

        // 或者使用标准的 RPC 调用方式
        window.rpc({
            model: 'material.tracker.item',
            method: 'action_view_pdf',
            args: [[itemId]],
            kwargs: {}
        }).then(function(action) {
            if (action && action.type) {
                window.odoo.client_action.client_action_manager.do_action(action);
            }
        }).catch(function(error) {
            console.error('Failed to call action_view_pdf:', error);
            if (error.data && error.data.message) {
                // 显示错误提示
                alert(error.data.message);
            }
        });
    }
})();
