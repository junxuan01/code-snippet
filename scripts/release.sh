#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# 检查命令是否存在
check_command() {
  if ! command -v $1 &> /dev/null; then
    error "$1 未安装，请先安装"
  fi
}

# 检查 npm 登录状态
check_npm_login() {
  info "检查 npm 登录状态..."
  if npm whoami &> /dev/null; then
    success "已登录 npm: $(npm whoami)"
  else
    warn "未登录 npm"
    echo ""
    read -p "是否现在登录? (y/n): " login_choice
    if [[ $login_choice == "y" || $login_choice == "Y" ]]; then
      npm login || error "npm 登录失败"
    else
      error "请先登录 npm 后再发布"
    fi
  fi
}

# 检查是否有未提交的更改
check_git_status() {
  info "检查 Git 状态..."
  if [[ -n $(git status --porcelain) ]]; then
    warn "存在未提交的更改:"
    git status --short
    echo ""
    read -p "是否继续? (y/n): " continue_choice
    if [[ $continue_choice != "y" && $continue_choice != "Y" ]]; then
      error "请先提交或暂存更改"
    fi
  else
    success "工作区干净"
  fi
}

# 检查是否有 changeset
check_changesets() {
  local changeset_files=$(ls .changeset/*.md 2>/dev/null | grep -v README.md | wc -l | tr -d ' ')
  echo $changeset_files
}

# 主菜单
show_menu() {
  echo ""
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}       📦 发布管理工具${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
  echo "  1) 创建变更记录 (changeset)"
  echo "  2) 更新版本号 (version)"
  echo "  3) 发布到 npm (publish)"
  echo "  4) 一键发布 (version + publish + push)"
  echo "  5) 查看当前状态"
  echo "  0) 退出"
  echo ""
  read -p "请选择操作 [0-5]: " choice
}

# 创建 changeset
create_changeset() {
  info "创建变更记录..."
  bunx changeset
  success "变更记录已创建"
  echo ""
  read -p "是否提交变更记录? (y/n): " commit_choice
  if [[ $commit_choice == "y" || $commit_choice == "Y" ]]; then
    git add .changeset/
    read -p "请输入提交信息 [默认: chore: add changeset]: " commit_msg
    commit_msg=${commit_msg:-"chore: add changeset"}
    git commit -m "$commit_msg"
    success "已提交变更记录"
  fi
}

# 更新版本号
update_version() {
  local changeset_count=$(check_changesets)
  if [[ $changeset_count -eq 0 ]]; then
    warn "没有待处理的 changeset"
    read -p "是否先创建 changeset? (y/n): " create_choice
    if [[ $create_choice == "y" || $create_choice == "Y" ]]; then
      create_changeset
    else
      return 1
    fi
  fi

  info "更新版本号..."
  bunx changeset version
  success "版本号已更新"
  
  echo ""
  info "变更内容:"
  git diff --stat
  echo ""
  
  read -p "是否提交版本变更? (y/n): " commit_choice
  if [[ $commit_choice == "y" || $commit_choice == "Y" ]]; then
    git add .
    git commit -m "chore: version packages"
    success "已提交版本变更"
  fi
}

# 发布到 npm
publish_packages() {
  check_npm_login
  
  info "构建项目..."
  bun run build || error "构建失败"
  success "构建完成"
  
  info "发布到 npm..."
  bunx changeset publish || error "发布失败"
  success "发布完成! 🎉"
}

# 推送到远程
push_to_remote() {
  info "推送到远程仓库..."
  git push --follow-tags || error "推送失败"
  success "已推送到远程仓库"
}

# 一键发布
full_release() {
  echo ""
  warn "即将执行一键发布流程:"
  echo "  1. 更新版本号"
  echo "  2. 提交版本变更"
  echo "  3. 构建项目"
  echo "  4. 发布到 npm"
  echo "  5. 推送代码和 tag"
  echo ""
  read -p "确认继续? (y/n): " confirm
  if [[ $confirm != "y" && $confirm != "Y" ]]; then
    info "已取消"
    return
  fi
  
  check_git_status
  check_npm_login
  
  # 更新版本
  local changeset_count=$(check_changesets)
  if [[ $changeset_count -eq 0 ]]; then
    error "没有待处理的 changeset，请先运行 'bun run changeset'"
  fi
  
  info "更新版本号..."
  bunx changeset version
  git add .
  git commit -m "chore: version packages"
  success "版本号已更新并提交"
  
  # 构建
  info "构建项目..."
  bun run build || error "构建失败"
  success "构建完成"
  
  # 发布
  info "发布到 npm..."
  bunx changeset publish || error "发布失败"
  success "发布完成"
  
  # 推送
  info "推送到远程..."
  git push --follow-tags
  success "推送完成"
  
  echo ""
  success "🎉 发布流程全部完成!"
}

# 查看状态
show_status() {
  echo ""
  info "=== 当前状态 ==="
  echo ""
  
  # npm 登录状态
  echo -n "npm 登录: "
  if npm whoami &> /dev/null; then
    echo -e "${GREEN}$(npm whoami)${NC}"
  else
    echo -e "${RED}未登录${NC}"
  fi
  
  # Git 状态
  echo -n "Git 分支: "
  echo -e "${BLUE}$(git branch --show-current)${NC}"
  
  echo -n "未提交更改: "
  local changes=$(git status --porcelain | wc -l | tr -d ' ')
  if [[ $changes -eq 0 ]]; then
    echo -e "${GREEN}无${NC}"
  else
    echo -e "${YELLOW}${changes} 个文件${NC}"
  fi
  
  # Changeset 状态
  echo -n "待处理 Changeset: "
  local changeset_count=$(check_changesets)
  if [[ $changeset_count -eq 0 ]]; then
    echo -e "${YELLOW}无${NC}"
  else
    echo -e "${GREEN}${changeset_count} 个${NC}"
  fi
  
  # 包版本
  echo ""
  info "=== 包版本 ==="
  for pkg in packages/*/package.json; do
    if [[ -f $pkg ]]; then
      local name=$(grep -o '"name": *"[^"]*"' $pkg | cut -d'"' -f4)
      local version=$(grep -o '"version": *"[^"]*"' $pkg | cut -d'"' -f4)
      echo "  $name: $version"
    fi
  done
  echo ""
}

# 主函数
main() {
  # 切换到项目根目录
  cd "$(dirname "$0")/.." || error "无法切换到项目根目录"
  
  # 检查必要命令
  check_command git
  check_command bun
  check_command npm
  
  # 如果有参数，直接执行对应操作
  case "$1" in
    changeset|cs)
      create_changeset
      exit 0
      ;;
    version|v)
      update_version
      exit 0
      ;;
    publish|p)
      publish_packages
      exit 0
      ;;
    release|r)
      full_release
      exit 0
      ;;
    status|s)
      show_status
      exit 0
      ;;
  esac
  
  # 交互式菜单
  while true; do
    show_menu
    case $choice in
      1) create_changeset ;;
      2) update_version ;;
      3) publish_packages ;;
      4) full_release ;;
      5) show_status ;;
      0) 
        info "再见! 👋"
        exit 0
        ;;
      *)
        warn "无效选项，请重新选择"
        ;;
    esac
  done
}

main "$@"
