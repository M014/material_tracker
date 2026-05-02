/** 
 * SKU 代码链接处理脚本 (Odoo 19 适配版)
 * 功能：为列表视图中的料号链接添加点击事件，触发查看图纸操作
 */
(function() {
    'use strict';

    // 检查 Odoo 框架是否加载
    function waitForOdoo(callback) {
        if (window.odoo && window.odoo.web) {
            callback();
        } else {
            setTimeout(function() {
                waitForOdoo(callback);
            }, 100);
        }
    }

    waitForOdoo(function() {
        // 初始化链接事件
        initSkuCodeLinks();
        
        // 监听动态内容更新
        var observer = new MutationObserver(function(mutations) {
            initSkuCodeLinks();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: false
        });
    });

    /**
     * 初始化料号链接的点击事件处理
     */
    function initSkuCodeLinks() {
        var links = document.querySelectorAll('a.o_form_uri[data-oid]');
        
        if (links.length === 0) {
            return;
        }
        
        links.forEach(function(link) {
            // 检查是否已绑定事件
            if (link.hasOwnProperty('_sku_handler_bound')) {
                return;
            }
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var itemId = parseInt(this.getAttribute('data-oid'), 10);
                if (itemId) {
                    triggerViewPdf(itemId);
                }
            });
            
            link._sku_handler_bound = true;
        });
    }

    /**
     * 触发查看图纸操作
     * @param {number} itemId - 料号 ID
     */
    function triggerViewPdf(itemId) {
        // 获取 Odoo 的 RPC 方法
        var rpc = window.odoo.web.rpc;
        
        if (!rpc) {
            console.error('RPC not available');
            return;
        }

        // 通过 RPC 调用 action_view_pdf 方法
        rpc.query({
            model: 'material.tracker.item',
            method: 'action_view_pdf',
            args: [[itemId]]
        }).then(function(action) {
            if (action) {
                // 通过 do_action 执行返回的 action
                var ActionManager = window.odoo.web.ActionManager;
                if (ActionManager && ActionManager.prototype.do_action) {
                    // Odoo 19 方式
                    var env = window.odoo.env;
                    if (env && env.services && env.services.action) {
                        env.services.action.doAction(action);
                    }
                } else {
                    console.warn('Cannot execute action - ActionManager not found');
                }
            }
        }).catch(function(error) {
            console.error('Failed to call action_view_pdf:', error);
            
            // 显示用户友好的错误提示
            var message = '查看图纸失败';
            if (error.data && error.data.message) {
                message = error.data.message;
            } else if (error.message) {
                message = error.message;
            }
            
            // 使用 Odoo 的通知系统显示错误
            var Notification = window.odoo.Notification;
            if (Notification) {
                Notification.notify({
                    title: '错误',
                    message: message,
                    type: 'danger',
                    sticky: false
                });
            } else {
                alert(message);
            }
        });
    }
})();
