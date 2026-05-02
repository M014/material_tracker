# Odoo 19 DEB 版本 + Material Tracker 安装指南

> 针对 Ubuntu 25.04 系统使用官方 DEB 包快速安装

## 目录
1. [系统要求](#系统要求)
2. [Odoo 19 DEB 版本安装](#odoo-19-deb-版本安装)
3. [Material Tracker 模块安装](#material-tracker-模块安装)
4. [用户权限配置](#用户权限配置)
5. [快速验证](#快速验证)
6. [故障排除](#故障排除)

---

## 系统要求

### 最小配置
- **OS**: Ubuntu 20.04 LTS / 22.04 LTS / 24.04 LTS / 25.04
- **RAM**: 2GB (建议 4GB+)
- **磁盘**: 20GB (建议 50GB+)
- **CPU**: 2 核心 (建议 4 核心+)

### 必需依赖
```bash
sudo apt update
sudo apt install -y \
    postgresql \
    postgresql-contrib \
    git \
    wkhtmltopdf \
    python3-pip \
    nodejs \
    npm
```

---

## Odoo 19 DEB 版本安装

### 1. 添加 Odoo 官方仓库

```bash
# 添加 GPG 密钥
wget -q -O - https://nightly.odoo.com/odoo.key | sudo apt-key add -

# 添加仓库（选择你的 Ubuntu 版本）
# Ubuntu 24.04
echo "deb [signed-by=/usr/share/keyrings/odoo-archive-keyring.gpg] https://nightly.odoo.com/19.0/ubuntu focal main" | sudo tee /etc/apt/sources.list.d/odoo.list

# 或者 Ubuntu 25.04
echo "deb [signed-by=/usr/share/keyrings/odoo-archive-keyring.gpg] http://deb.debian.org/debian bookworm main" | sudo tee /etc/apt/sources.list.d/odoo.list
```

### 2. 安装 Odoo 19

```bash
# 更新包列表
sudo apt update

# 安装 Odoo 19
sudo apt install -y odoo

# 安装成功后，Odoo 服务会自动启动
sudo systemctl status odoo
```

### 3. 验证安装

```bash
# 检查 Odoo 版本
odoo --version

# 检查服务状态
sudo systemctl is-active odoo

# 查看日志（实时）
sudo tail -f /var/log/odoo/odoo.log
```

### 4. 访问 Odoo

打开浏览器访问：
```
http://localhost:8069
```

或者用服务器 IP：
```
http://192.168.1.100:8069
```

首次访问会出现 **创建数据库** 界面：
- **数据库名**: odoo_db (或任意名称)
- **邮箱**: admin@example.com
- **密码**: 设置管理员密码
- **语言**: Chinese (中文)
- **国家**: China (中国)

---

## Material Tracker 模块安装

### 1. 查找自定义模块目录

DEB 版本的 Odoo 自定义模块目录为：

```bash
# 查看当前配置的 addons_path
grep -i "addons_path" /etc/odoo/odoo.conf

# 典型路径示例
/opt/odoo/addons
/home/odoo/custom-addons
```

如果没有指定，默认为：
```
/opt/odoo/addons
```

### 2. 创建自定义模块目录

```bash
# 如果目录不存在，创建它
sudo mkdir -p /opt/odoo/custom-addons

# 设置权限（重要！）
sudo chown odoo:odoo /opt/odoo/custom-addons
sudo chmod 755 /opt/odoo/custom-addons
```

### 3. 更新 Odoo 配置文件

```bash
# 编辑 Odoo 配置
sudo nano /etc/odoo/odoo.conf
```

找到 `addons_path` 行，修改为：

```ini
addons_path = /opt/odoo/addons,/opt/odoo/custom-addons
```

保存文件：按 `Ctrl+O` > `Enter` > `Ctrl+X`

### 4. 克隆 Material Tracker 模块

```bash
# 进入自定义模块目录
cd /opt/odoo/custom-addons

# 克隆模块
sudo git clone https://github.com/M014/material_tracker.git

# 设置权限
sudo chown -R odoo:odoo material_tracker
sudo chmod -R 755 material_tracker
```

### 5. 重启 Odoo 服务

```bash
# 重启 Odoo
sudo systemctl restart odoo

# 等待 10-20 秒，然后查看日志
sleep 5
sudo tail -50 /var/log/odoo/odoo.log | grep -i material_tracker

# 应该看到类似输出：
# 2026-05-02 10:30:45,123 9876 INFO ? odoo.modules.loading: loading material_tracker
# 2026-05-02 10:30:46,456 9876 INFO ? odoo.modules.module: module material_tracker: loaded
```

### 6. 在 Odoo 中激活模块

**步骤 1**: 以管理员身份登录 Odoo

**步骤 2**: 进入 **应用** (Apps)
- 在右上角菜单中找到 **应用** 或直接在搜索栏搜索

**步骤 3**: 搜索模块
- 在搜索框输入 "material_tracker" 或 "独立项目来料跟踪"

**步骤 4**: 安装模块
- 点击模块卡片
- 点击 **安装** 按钮
- 等待安装完成（通常需要 30 秒-1 分钟）

**步骤 5**: 验证安装
- 在菜单中应该看到 **独立项目来料跟踪** 菜单项
- 点击可进入模块首页

---

## 用户权限配置

### 1. 创建新用户

1. 进入 **设置** > **用户和公司** > **用户**
2. 点击 **创建** 按钮
3. 填写用户信息：
   - **姓名**: John Doe
   - **邮箱**: john@example.com
   - **登录名**: john
   - **密码**: 点击"设置密码"链接生成临时密码

### 2. 分配权限

在用户编辑界面中：

**方式 1: 通过组分配权限（推荐）**
1. 向下滚动到 **用户类型** 或 **权限** 部分
2. 在 **用户的权限组** 中勾选：
   - ☑ 采购员 (Buying Manager)
   - ☑ 库存员 (Stock Manager)
   - 或其他相关角色

**方式 2: 通过菜单访问权限**
1. 找到 **菜单访问权限** 部分
2. 在 **独立项目来料跟踪** 下勾选：
   - ☑ 项目
   - ☑ 料号
   - ☑ 图纸管理

### 3. 权限级别对照表

| 用户类型 | 查看项目 | 编辑项目 | 查看料号 | 编辑料号 | 查看图纸 | 备注 |
|---------|--------|--------|--------|--------|--------|------|
| 管理员 | ✅ | ✅ | ✅ | ✅ | ✅ | 所有权限 |
| 项目经理 | ✅ | ✅ | ✅ | ✅ | ✅ | 可管理项目和料号 |
| 采购员 | ✅ | ✅ | ✅ | ✅ | ✅ | 可管理采购相关 |
| 仓库员 | ✅ | ❌ | ✅ | ⚠️ | ✅ | 可更新完成状态 |
| 查看者 | ✅ | ❌ | ✅ | ❌ | ✅ | 仅可查看 |

### 4. 快速权限配置脚本

如果需要批量创建用户，可以在 Odoo 开发者模式下使用 Python 控制台：

```python
# 进入 Odoo 开发者模式: 右上角 > 设置 > 开发者工具 > 激活开发者模式

# 然后在浏览器控制台中执行 (F12 > Console):
# 这只是示例，实际应通过 Odoo UI 操作

# 创建用户
env['res.users'].create({
    'name': 'John Doe',
    'login': 'john@example.com',
    'email': 'john@example.com',
    'password': 'password123',
    'groups_id': [(6, 0, [env.ref('base.group_user').id])]
})
```

---

## 快速验证

### 1. 验证模块正常加载

```bash
# 检查模块是否被识别
sudo -u odoo psql -h localhost odoo_db -c \
  "SELECT name, state FROM ir_module_module WHERE name='material_tracker';"

# 应该输出:
#     name     |  state
# ---------------+----------
#  material_tracker | installed
```

### 2. 创建测试数据

1. 在 Odoo 中进入 **独立项目来料跟踪** > **项目**
2. 点击 **创建**，填写：
   - **项目名**: 测试项目
   - **描述**: 这是一个测试项目用于验证功能
3. 点击 **保存**

4. 在项目的 **料号明细** Tab，点击 **添加一行**：
   - **料号**: PWQ2602004-03-T03-01-H
   - **材料**: 铝 6061
   - **数量**: 2
   - **工艺要求**: 喷砂氧化

5. **重点测试**：直接点击料号代码，应该弹出图纸预览窗口

### 3. 测试权限

1. 创建一个非管理员账户
2. 只分配 **查看** 权限
3. 用该账户登录，验证：
   - ✅ 能看到项目和料号
   - ❌ 无法修改数据
   - ❌ 无法删除数据

---

## 故障排除

### 问题 1: 模块在应用列表中不显示

```bash
# 检查 addons_path 配置
grep "addons_path" /etc/odoo/odoo.conf

# 检查模块目录权限
ls -la /opt/odoo/custom-addons/
ls -la /opt/odoo/custom-addons/material_tracker/

# 检查 __manifest__.py 是否存在
ls -la /opt/odoo/custom-addons/material_tracker/__manifest__.py

# 重启 Odoo 并查看日志
sudo systemctl restart odoo
sleep 5
sudo tail -100 /var/log/odoo/odoo.log | grep -i "material_tracker"
```

**解决方案:**
```bash
# 1. 确保路径正确
sudo ls -la /opt/odoo/custom-addons/material_tracker/

# 2. 确保权限正确
sudo chown -R odoo:odoo /opt/odoo/custom-addons
sudo chmod -R 755 /opt/odoo/custom-addons

# 3. 重启 Odoo
sudo systemctl restart odoo

# 4. 在应用中清除缓存
# 在 Odoo 中: 应用 > 右上角三点菜单 > 更新应用列表
```

### 问题 2: 点击料号无反应或白屏

```bash
# 打开浏览器开发者工具 (F12)
# 1. 进入 Console 标签，查看是否有红色错误信息
# 2. 进入 Network 标签，点击料号，查看网络请求是否成功

# 后端检查
sudo tail -50 /var/log/odoo/odoo.log

# 查找错误：ERROR 或 Traceback
```

**常见原因和解决：**

| 症状 | 原因 | 解决方案 |
|------|------|--------|
| 404 not found (js file) | JavaScript 文件未加载 | `sudo systemctl restart odoo` 并清浏览器缓存 |
| RPC Error | 后端方法调用失败 | 检查用户权限，查看日志中的 ERROR |
| 弹窗显示但无内容 | 图纸管理模块问题 | 检查是否上传了 PDF 文件 |
| 权限拒绝 | 用户权限不足 | 重新分配权限，或联系管理员 |

### 问题 3: Odoo 服务无法启动

```bash
# 查看详细错误
sudo systemctl status odoo -l

# 查看 journal 日志
sudo journalctl -u odoo -n 100 --no-paging

# 常见原因：
# 1. PostgreSQL 未启动
sudo systemctl status postgresql
sudo systemctl start postgresql

# 2. 端口被占用
sudo lsof -i :8069

# 3. 配置文件错误
sudo nano /etc/odoo/odoo.conf
# 检查语法是否正确

# 4. 权限问题
sudo chown odoo:odoo /etc/odoo/odoo.conf
sudo chown odoo:odoo /var/log/odoo
sudo chmod 600 /etc/odoo/odoo.conf
sudo chmod 755 /var/log/odoo
```

### 问题 4: PostgreSQL 连接错误

```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 启动 PostgreSQL
sudo systemctl start postgresql

# 测试数据库连接
sudo -u postgres psql -l

# 查看 Odoo 配置中的数据库参数
grep "^db_" /etc/odoo/odoo.conf

# 重置 PostgreSQL 密码（如果遗忘）
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'new_password';"
```

### 问题 5: JavaScript 控制台错误

**错误**: `ReferenceError: odoo is not defined`
```bash
# 原因: Odoo 框架未加载
# 解决: 清浏览器缓存 (Ctrl+Shift+Delete) 并重新访问
```

**错误**: `404 /web/static/...`
```bash
# 原因: 静态文件未找到
# 解决: 
sudo systemctl restart odoo
# 等待 20 秒后重新访问
```

**错误**: `CORS error`
```bash
# 原因: 跨域请求被阻止
# 解决: 更新 Odoo 配置
sudo nano /etc/odoo/odoo.conf

# 添加或修改以下行:
cors_origins = *
```

---

## 日常维护命令

```bash
# 启动/停止/重启 Odoo
sudo systemctl start odoo
sudo systemctl stop odoo
sudo systemctl restart odoo

# 查看 Odoo 状态
sudo systemctl status odoo

# 实时日志监听
sudo tail -f /var/log/odoo/odoo.log

# 查看特定错误
sudo grep "ERROR" /var/log/odoo/odoo.log

# 备份数据库
sudo -u odoo pg_dump odoo_db > /home/user/backup_$(date +%Y%m%d).sql

# 恢复数据库
sudo -u odoo psql odoo_db < /home/user/backup_20260502.sql

# 查看 Odoo 占用的资源
ps aux | grep odoo
```

---

## 性能优化

### 1. 调整工作进程数

```bash
sudo nano /etc/odoo/odoo.conf

# 修改为 CPU 核数 * 2 + 1
workers = 5

# 重启生效
sudo systemctl restart odoo
```

### 2. 启用 Redis 缓存（可选）

```bash
# 安装 Redis
sudo apt install redis-server

# 在 Odoo 配置中添加
sudo nano /etc/odoo/odoo.conf

# 添加以下行:
cache_db = 1
session_store = redis
session_redis_host = localhost
session_redis_port = 6379

# 重启
sudo systemctl restart odoo
```

### 3. 数据库优化

```bash
# 清理数据库日志
sudo -u postgres psql -d odoo_db -c "DELETE FROM ir_logging WHERE create_date < NOW() - INTERVAL '30 days';"

# 重建索引
sudo -u postgres psql -d odoo_db -c "VACUUM FULL ANALYZE;"
```

---

## 安全建议

### 1. 修改管理员密码

进入 **设置** > **安全** > **修改密码**

### 2. 启用 2FA（两步认证）

1. 进入 **设置** > **安全** > **两步认证**
2. 下载认证器应用（Google Authenticator 或 Authy）
3. 扫描二维码完成设置

### 3. 防火墙配置

```bash
# 允许 Odoo 端口
sudo ufw allow 8069/tcp

# 允许 SSH
sudo ufw allow 22/tcp

# 启用防火墙
sudo ufw enable
```

### 4. 定期备份

```bash
# 创建备份脚本
sudo nano /usr/local/bin/backup-odoo.sh
```

添加以下内容：
```bash
#!/bin/bash
BACKUP_DIR="/backups/odoo"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
sudo -u odoo pg_dump odoo_db | gzip > $BACKUP_DIR/odoo_db_$DATE.sql.gz

# 保留最近 30 天的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

```bash
# 设置执行权限
sudo chmod +x /usr/local/bin/backup-odoo.sh

# 添加到 crontab（每天晚上 11 点备份）
sudo crontab -e

# 添加以下行:
0 23 * * * /usr/local/bin/backup-odoo.sh
```

---

## 获取帮助

- **Odoo 官方文档**: https://www.odoo.com/documentation/19.0/
- **Material Tracker GitHub**: https://github.com/M014/material_tracker
- **Odoo 社区论坛**: https://github.com/OCA/
- **Ubuntu 帮助**: https://help.ubuntu.com

---

**文档版本**: 1.0  
**Odoo 版本**: 19.0 (DEB)  
**Ubuntu 版本**: 20.04+ / 25.04  
**最后更新**: 2026-05-02
