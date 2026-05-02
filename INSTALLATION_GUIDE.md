# 独立项目来料跟踪模块 (Material Tracker) 完整安装指南

## 目录
1. [前置环境要求](#前置环境要求)
2. [Odoo 19 安装教程](#odoo-19-安装教程)
3. [Material Tracker 模块安装](#material-tracker-模块安装)
4. [数据库初始化](#数据库初始化)
5. [用户权限配置](#用户权限配置)
6. [功能验证](#功能验证)
7. [故障排除](#故障排除)

---

## 前置环境要求

### 系统要求
- **操作系统**: Ubuntu 20.04 / 22.04 / 24.04 / 25.04 (推荐)
- **Python**: 3.8 或更高版本
- **数据库**: PostgreSQL 12 或更高版本
- **磁盘空间**: 至少 10GB
- **内存**: 至少 2GB (生产环境建议 4GB+)

### 必需软件包
```bash
sudo apt update
sudo apt install -y \
    git \
    python3-pip \
    python3-dev \
    python3-venv \
    postgresql \
    postgresql-contrib \
    libpq-dev \
    libxml2-dev \
    libxslt1-dev \
    libjpeg-dev \
    zlib1g-dev \
    gcc \
    g++ \
    make \
    npm \
    nodejs \
    wkhtmltopdf
```

---

## Odoo 19 安装教程

### 1. 创建 Odoo 用户和目录

```bash
# 创建 Odoo 系统用户
sudo useradd -m -U -r -s /bin/bash odoo

# 创建 Odoo 安装目录
sudo mkdir -p /opt/odoo
sudo chown odoo:odoo /opt/odoo

# 创建日志目录
sudo mkdir -p /var/log/odoo
sudo chown odoo:odoo /var/log/odoo

# 创建自定义模块目录
sudo mkdir -p /opt/odoo/custom_addons
sudo chown odoo:odoo /opt/odoo/custom_addons
```

### 2. 安装和配置 PostgreSQL

```bash
# 启动 PostgreSQL 服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建 Odoo 数据库用户
sudo -u postgres createuser --createdb --createrole --inherit -P odoo

# 出现提示时输入密码，例如: odoo123456
# 确认密码后继续

# 创建初始数据库（可选，Odoo 会自动创建）
sudo -u postgres createdb -O odoo odoo_db
```

### 3. 克隆 Odoo 19 源码

```bash
# 切换到 Odoo 用户
sudo su - odoo

# 克隆 Odoo 19 源码
cd /opt/odoo
git clone https://github.com/odoo/odoo.git --depth 1 --branch 19.0 odoo-server
cd odoo-server

# 返回 root 用户
exit
```

### 4. 创建和激活虚拟环境

```bash
# 切换到 Odoo 用户
sudo su - odoo

# 创建虚拟环境
cd /opt/odoo/odoo-server
python3 -m venv venv
source venv/bin/activate

# 升级 pip
pip install --upgrade pip setuptools wheel

# 安装 Python 依赖
pip install -r requirements.txt

# 退出虚拟环境和 Odoo 用户
deactivate
exit
```

### 5. 创建 Odoo 配置文件

```bash
# 创建配置文件
sudo nano /etc/odoo/odoo.conf
```

复制以下内容并保存（按 Ctrl+O, Enter, Ctrl+X 保存）：

```ini
[options]
; 管理员密码 (强烈建议更改为安全密码)
admin_passwd = admin123

; 数据库配置
db_host = localhost
db_port = 5432
db_user = odoo
db_password = odoo123456
db_name = odoo_db

; 模块路径 (包括自定义模块)
addons_path = /opt/odoo/odoo-server/addons,/opt/odoo/custom_addons

; Odoo 服务配置
; listen = 127.0.0.1
; listen_port = 8069

; 日志配置
logfile = /var/log/odoo/odoo.log
log_level = info

; 工作进程数 (2*CPU核数+1 为佳)
workers = 4
max_cron_threads = 1

; 禁用自动模块加载 (提高性能)
auto_reload = False

; 允许多个数据库
; db_filter = .*
```

```bash
# 设置配置文件权限
sudo chown odoo:odoo /etc/odoo/odoo.conf
sudo chmod 600 /etc/odoo/odoo.conf
```

### 6. 创建 Systemd 服务文件

```bash
# 创建服务文件
sudo nano /etc/systemd/system/odoo.service
```

复制以下内容：

```ini
[Unit]
Description=Odoo 19 ERP Service
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=odoo
Group=odoo
WorkingDirectory=/opt/odoo/odoo-server
Environment="PATH=/opt/odoo/odoo-server/venv/bin"
ExecStart=/opt/odoo/odoo-server/venv/bin/python /opt/odoo/odoo-server/odoo-bin \
    -c /etc/odoo/odoo.conf \
    --logfile=/var/log/odoo/odoo.log

SyslogIdentifier=odoo
Restart=always
RestartSec=10s

; 日志输出
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
# 重新加载 systemd 配置
sudo systemctl daemon-reload

# 启动 Odoo 服务
sudo systemctl start odoo

# 设置开机自启
sudo systemctl enable odoo

# 检查服务状态
sudo systemctl status odoo

# 查看日志
sudo tail -f /var/log/odoo/odoo.log
```

### 7. 访问 Odoo

打开浏览器访问：
```
http://your_server_ip:8069
```

首次访问时会看到创建数据库的界面。

---

## Material Tracker 模块安装

### 1. 克隆模块到自定义目录

```bash
# 切换到 Odoo 用户
sudo su - odoo

# 进入自定义模块目录
cd /opt/odoo/custom_addons

# 克隆 Material Tracker 模块
git clone https://github.com/M014/material_tracker.git

# 返回 root
exit
```

### 2. 设置文件权限

```bash
sudo chown -R odoo:odoo /opt/odoo/custom_addons
sudo chmod -R 755 /opt/odoo/custom_addons
```

### 3. 重启 Odoo 服务

```bash
# 重启服务以加载新模块
sudo systemctl restart odoo

# 查看日志确认加载成功
sudo tail -f /var/log/odoo/odoo.log | grep -i "material_tracker"
```

### 4. 在 Odoo 中激活模块

1. 在 Odoo 中以管理员身份登录
2. 进入 **应用** (Apps) 菜单
3. 搜索 "material_tracker" 或 "独立项目来料跟踪"
4. 点击 **安装** 按钮

---

## 数据库初始化

### 1. 自动初始化

模块安装后会自动初始化以下数据：
- 创建必需的数据模型表
- 创建菜单项
- 设置基础权限

### 2. 手动初始化数据（可选）

如果需要导入示例数据：

```bash
# 进入 Odoo 数据库
sudo -u odoo psql -h localhost -d odoo_db

# 查看已创建的表
\dt material_tracker*

# 退出
\q
```

### 3. 备份数据库

```bash
# 导出数据库备份
sudo -u postgres pg_dump odoo_db > /home/user/odoo_db_backup.sql

# 恢复数据库
sudo -u postgres psql odoo_db < /home/user/odoo_db_backup.sql
```

---

## 用户权限配置

### 1. 创建用户组

1. 进入 Odoo 管理后台
2. 导航到 **设置** > **用户和公司** > **用户**
3. 点击 **创建**

### 2. 配置权限

#### 方式 A：通过 UI 界面

1. 进入 **设置** > **用户和公司** > **用户**
2. 选择要配置的用户
3. 在 **权限** 标签页中，找到 **独立项目来料跟踪** 部分
4. 勾选相应的权限：
   - ☑ 创建
   - ☑ 编辑
   - ☑ 删除
   - ☑ 查看

#### 方式 B：通过权限文件

权限定义在 `security/ir.model.access.csv` 中：

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
material_tracker.access_material_tracker_project_user,Project User Access,material_tracker.model_material_tracker_project,material_tracker.group_material_tracker_user,1,1,1,1
material_tracker.access_material_tracker_item_user,Item User Access,material_tracker.model_material_tracker_item,material_tracker.group_material_tracker_user,1,1,1,1
```

### 3. 权限说明

| 权限 | 说明 |
|------|------|
| **Project Manager** | 可管理所有项目和料号 |
| **Material Viewer** | 仅可查看项目和料号，不可修改 |
| **Draw Reviewer** | 可查看和审核图纸 |

### 4. 为用户分配权限

```bash
# 以 root 用户执行，或在 Odoo UI 中操作

# 方式 1：通过 Odoo UI
设置 > 用户和公司 > 用户 > 选择用户 > 权限 > 勾选相应权限

# 方式 2：通过数据库 SQL
sudo -u odoo psql -h localhost -d odoo_db

-- 为用户分配权限组
INSERT INTO res_groups_users_rel (gid, uid) 
SELECT rg.id, ru.id 
FROM res_groups rg, res_users ru 
WHERE rg.name = 'material_tracker.group_material_tracker_user' 
AND ru.login = 'username@example.com';
```

### 5. 推荐权限配置

#### 管理员
- 所有权限已启用
- 可访问所有功能

#### 项目经理
- ✅ 创建/编辑项目
- ✅ 创建/编辑料号
- ✅ 查看图纸
- ✅ 管理外购件

#### 普通员工
- ✅ 查看项目
- ✅ 查看料号
- ✅ 查看图纸
- ❌ 无法修改数据

#### 查看者
- ✅ 仅可查看所有数据
- ❌ 无法任何修改操作

---

## 功能验证

### 1. 验证模块安装

```bash
# 检查模块是否已安装
sudo systemctl is-active odoo

# 查看 Odoo 日志
sudo tail -100 /var/log/odoo/odoo.log
```

### 2. 创建测试项目

1. 在 Odoo 中登录
2. 导航到 **独立项目来料跟踪** > **项目**
3. 点击 **创建**
4. 填写项目信息：
   - 名称: 测试项目
   - 描述: 这是一个测试项目
5. 点击 **保存**

### 3. 添加料号

1. 在项目中点击 **料号明细** 标签
2. 点击 **添加一行**
3. 输入料号信息：
   - 料号: PWQ2602004-03-T03-01-01-H
   - 材料: 铝 6061
   - 工艺要求: 喷砂氧化
4. 点击 **保存**

### 4. 测试点击料号查看图纸

1. 在料号明细列表中，**直接点击料号代码**
2. 系统应弹出图纸预览窗口
3. 确认图纸能正常显示

### 5. 验证权限

1. 创建新用户
2. 分配仅查看权限
3. 用该用户登录，验证无法修改数据

---

## 故障排除

### 问题 1: Odoo 服务无法启动

```bash
# 查看错误日志
sudo systemctl status odoo -l

# 查看详细日志
sudo journalctl -u odoo -n 50 --no-paging

# 检查端口占用
sudo lsof -i :8069

# 如果端口被占用，杀死占用进程
sudo kill -9 <PID>
```

### 问题 2: PostgreSQL 连接失败

```bash
# 检查 PostgreSQL 服务
sudo systemctl status postgresql

# 重启 PostgreSQL
sudo systemctl restart postgresql

# 验证 Odoo 用户密码
sudo -u postgres psql -c "ALTER USER odoo WITH PASSWORD 'new_password';"

# 更新 Odoo 配置文件中的密码
sudo nano /etc/odoo/odoo.conf
# 修改: db_password = new_password
```

### 问题 3: 模块无法加载

```bash
# 检查模块路径配置
grep "addons_path" /etc/odoo/odoo.conf

# 检查自定义模块目录权限
ls -la /opt/odoo/custom_addons/

# 检查模块文件完整性
ls -la /opt/odoo/custom_addons/material_tracker/

# 查看模块加载错误
sudo grep -i "material_tracker" /var/log/odoo/odoo.log
```

### 问题 4: 页面白屏或JavaScript错误

```bash
# 清空 Odoo 缓存
sudo systemctl stop odoo

# 清理会话文件
sudo rm -rf /opt/odoo/odoo-server/.local/share/odoo/

# 重启 Odoo
sudo systemctl start odoo

# 在浏览器中进行硬刷新: Ctrl+Shift+R
```

### 问题 5: 权限错误

```bash
# 检查文件权限
ls -la /etc/odoo/odoo.conf
ls -la /var/log/odoo/

# 修正权限
sudo chown odoo:odoo /etc/odoo/odoo.conf
sudo chown odoo:odoo /var/log/odoo
sudo chmod 600 /etc/odoo/odoo.conf
sudo chmod 755 /var/log/odoo

# 重启 Odoo
sudo systemctl restart odoo
```

### 问题 6: 点击料号无反应

**检查步骤：**

1. 打开浏览器开发者工具 (F12)
2. 进入 **Console** 标签
3. 点击料号，查看是否有 JavaScript 错误
4. 如果有错误，查看错误信息

**常见原因：**
- JavaScript 文件未加载: 检查 Console 中是否有 404 错误
- RPC 调用失败: 检查网络请求 (Network 标签)
- 权限不足: 检查用户是否有查看图纸权限

**解决方案：**

```bash
# 重新加载资源文件
sudo systemctl restart odoo

# 清空浏览器缓存（Ctrl+Shift+Delete）并重新访问

# 检查日志
sudo tail -f /var/log/odoo/odoo.log
```

---

## 常用命令速查表

```bash
# Odoo 服务管理
sudo systemctl start odoo           # 启动
sudo systemctl stop odoo            # 停止
sudo systemctl restart odoo         # 重启
sudo systemctl status odoo          # 状态
sudo systemctl enable odoo          # 开机启动

# 日志查看
sudo tail -f /var/log/odoo/odoo.log        # 实时日志
sudo tail -100 /var/log/odoo/odoo.log      # 最后 100 行
sudo grep "ERROR" /var/log/odoo/odoo.log   # 查看错误

# 数据库操作
sudo -u postgres psql -l                   # 列出所有数据库
sudo -u postgres dropdb odoo_db            # 删除数据库
sudo -u postgres createdb -O odoo odoo_db  # 创建数据库
sudo -u postgres pg_dump odoo_db > backup.sql  # 备份

# 模块管理
# 通过 UI: 应用 > 搜索 > 安装/更新

# 文件权限修复
sudo chown -R odoo:odoo /opt/odoo
sudo chmod -R 755 /opt/odoo
```

---

## 安全建议

1. **强化密码**
   - 修改 admin_passwd 为强密码
   - 修改 PostgreSQL 密码

2. **防火墙配置**
   ```bash
   sudo ufw allow 8069/tcp
   sudo ufw enable
   ```

3. **SSL/TLS 支持**
   ```bash
   # 配置 Nginx 反向代理（推荐生产环境）
   sudo apt install nginx
   ```

4. **定期备份**
   ```bash
   # 创建备份脚本
   sudo nano /usr/local/bin/backup-odoo.sh
   ```

5. **日志监控**
   ```bash
   sudo apt install logwatch
   sudo logwatch --output mail --format html
   ```

---

## 获取帮助

- **官方文档**: https://www.odoo.com/documentation/19.0/
- **模块 GitHub**: https://github.com/M014/material_tracker
- **Odoo 社区**: https://github.com/OCA/

---

**最后更新**: 2026-05-02  
**适用版本**: Odoo 19.0 + Material Tracker 1.0  
**维护者**: M014
