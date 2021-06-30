// 简单深拷贝
export function myClone<T>(target: T): T {
  return Object.assign({}, target)
}

// 生成障碍物id
export function creatId() {
  return Number(Math.random().toString().substr(3, 3) + Date.now()).toString(36)
}
