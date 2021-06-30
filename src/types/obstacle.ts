import { myClone, creatId } from '../utils'
import { eventBus } from '../composable/core'
import { basicSpeed, basicPosition, entityCanvasHandler } from './global'

// Images...
import pipe_down from '../assets/imgs/pipe_down.png'
import pipe_up from '../assets/imgs/pipe_up.png'

interface obstacleSpawnPosition extends basicPosition {
  height: number
}
interface obstacleCurrentPosition extends basicPosition {
  height: number
}

// 障碍物的状态  move-移动中 stop-停止中
type obstacleMovingStatus = 'move' | 'stop'
// 障碍物可视状态 hidden-当前画布中不可见 visible-在画布中可见
type obstacleVisibilityStatus = 'hidden' | 'visible'
// 障碍物位置 top-顶部部分 bottom-底部部分
type obstaclePlacePosition = 'top' | 'bottom'
// 障碍物基本配置 TODO...
type obstacleConf = {
  // 障碍物（宽度）
  width: number
  // 障碍物间隔高度
  clearance: number
  // 基本速度配置
  speed: basicSpeed
}

// 障碍物基本类型
export class Obstacle implements entityCanvasHandler {
  public id!: string
  public conf!: obstacleConf
  public height!: number
  public placePosition!: obstaclePlacePosition
  public movingStatus!: obstacleMovingStatus
  public visibilityStatus!: obstacleVisibilityStatus
  public originalSpeed!: basicSpeed
  public currentSpeed!: basicSpeed
  public spawnPosition!: obstacleSpawnPosition
  public currentPosition!: obstacleCurrentPosition
  public hasNext!: boolean
  public canvas!: HTMLCanvasElement
  public ctx!: CanvasRenderingContext2D
  obstacleImg!: HTMLImageElement

  constructor(
    id: string,
    conf: obstacleConf,
    height: number,
    placePosition: obstaclePlacePosition,
    movingStatus: obstacleMovingStatus,
    visibilityStatus: obstacleVisibilityStatus,
    spawnPosition: obstacleSpawnPosition,
    currentPosition: obstacleCurrentPosition,
    el: HTMLCanvasElement
  ) {
    this.id = id
    this.conf = conf
    this.height = height
    this.placePosition = placePosition
    this.movingStatus = movingStatus
    this.visibilityStatus = visibilityStatus
    this.originalSpeed = myClone(conf.speed)
    this.currentSpeed = myClone(conf.speed)
    this.spawnPosition = spawnPosition
    this.currentPosition = myClone(spawnPosition)
    this.hasNext = true
    this.ctx = el.getContext('2d')!
    this.canvas = el
    this.obstacleImg = new Image()
    this.obstacleImg.src = placePosition === 'top' ? pipe_down : pipe_up
  }

  public draw() {
    this.ctx.beginPath()
    this.ctx.drawImage(
      this.obstacleImg,
      this.currentPosition.X,
      this.currentPosition.Y,
      this.conf.width,
      this.height
    )
    this.ctx.fill()
    this.ctx.closePath()
  }

  public update(seconds: number) {
    this.currentPosition.X -= this.originalSpeed.VX * seconds
    if (this.currentPosition.X <= -this.conf.width) {
      eventBus.emit('removeObstacle', this.id)
    }
    if (
      this.currentPosition.X <= this.canvas.width - 3 * this.conf.width &&
      this.hasNext
    ) {
      eventBus.emit('createNextObstacle', this.id)
      this.hasNext = false
    }
  }
}

// 完整障碍物
class completeObstacle {
  public id!: string
  public topPart!: Obstacle
  public bottomPart!: Obstacle
  public canvas!: HTMLCanvasElement
  public conf!: obstacleConf
  public randomPosition!: {
    topObstacle: obstacleSpawnPosition
    bottomObstacle: obstacleSpawnPosition
  }
  constructor(el: HTMLCanvasElement) {
    this.canvas = el
    this.conf = {
      width: 100,
      clearance: 150,
      speed: {
        VX: 100,
        VY: 0,
      },
    }
    this.randomPosition = this.createRandomPosition()
    this.id = creatId()
    this.topPart = this.createTopObstacle(this.randomPosition.topObstacle)
    this.bottomPart = this.createBottomObstacle(
      this.randomPosition.bottomObstacle
    )
  }
  private createRandomPosition() {
    let max = 400
    let min = 100
    let randomBottomObstacleHeight = Math.floor(
      Math.random() * (max - min + 1) + min
    )
    let bottomObstacle: obstacleSpawnPosition = {
      X: this.canvas.width,
      Y: this.canvas.height - randomBottomObstacleHeight,
      height: randomBottomObstacleHeight,
    }
    let topObstacle: obstacleSpawnPosition = {
      X: this.canvas.width,
      Y: 0,
      height:
        this.canvas.height - randomBottomObstacleHeight - this.conf.clearance,
    }
    return { topObstacle, bottomObstacle }
  }
  public createTopObstacle(position: obstacleSpawnPosition) {
    return new Obstacle(
      this.id,
      this.conf,
      position.height,
      'top',
      'move',
      'hidden',
      position,
      position,
      this.canvas
    )
  }
  public createBottomObstacle(position: obstacleSpawnPosition) {
    return new Obstacle(
      this.id,
      this.conf,
      position.height,
      'bottom',
      'move',
      'hidden',
      position,
      position,
      this.canvas
    )
  }
  public getCompleteObstacle() {
    return { id: this.id, obstacles: [this.topPart, this.bottomPart] }
  }
}

// 障碍物工厂🍄
export class ObstacleFactory {
  public static instance: ObstacleFactory | undefined
  public ctx: CanvasRenderingContext2D
  public canvas!: HTMLCanvasElement
  public obstaclesSet!: Map<string, Obstacle[]>

  constructor(el: HTMLCanvasElement) {
    this.canvas = el
    this.ctx = el.getContext('2d')!
    this.obstaclesSet = new Map()
  }

  public createObstacle() {
    return new completeObstacle(this.canvas).getCompleteObstacle()
  }

  static getInstance(el: HTMLCanvasElement) {
    if (!ObstacleFactory.instance) {
      ObstacleFactory.instance = new ObstacleFactory(el)
    }
    return ObstacleFactory.instance
  }
}
