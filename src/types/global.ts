// 基本位置表示对象
export type basicPosition = {
  X: number
  Y: number
}

// 基本速度对象
export type basicSpeed = {
  VX: number
  VY: number
}

// 绘画实体对象
export interface entityCanvasHandler {
  draw: () => void
  update: (seconds: number) => void
}
