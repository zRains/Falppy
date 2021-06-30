import { basicPosition, basicSpeed, entityCanvasHandler } from './global'
import { myClone } from '../utils'

// Images...
import bird0_0 from '../assets/imgs/bird0_0.png'
import bird0_1 from '../assets/imgs/bird0_1.png'
import bird0_2 from '../assets/imgs/bird0_2.png'

// 小鸟的运行状态  padding-准备开始 doom-被摧毁  running-运行中
type birdStatus = 'padding' | 'doom' | 'running'
// 小鸟朝向 balance-平衡状态 up-上升状态 down-匀速下降状态 recovery-下降恢复状态
type birdDirection = 'balance' | 'up' | 'down' | 'recovery'
// 小鸟基本配置 TODO...
type birdConf = {
  // 小鸟大小
  size: number
  // 基本速度配置
  speed: basicSpeed
  // 上升时间
  upDuration: number
  // 上升递减速度
  ySpeedDecrease: number
  // 归属
  ascription: 'self' | 'others'
}
// 小鸟生成位置
interface birdSpawnPosition extends basicPosition {}
// 小鸟当前位置
interface birdCurrentPosition extends basicPosition {}

// 小鸟基本对象
export class Bird implements entityCanvasHandler {
  public id!: string
  public state!: birdStatus
  public originalSpeed!: basicSpeed
  public currentSpeed!: basicSpeed
  public conf!: birdConf
  public direction!: birdDirection
  public spawnPosition!: birdSpawnPosition
  public currentPosition!: birdCurrentPosition
  public ctx!: CanvasRenderingContext2D

  public birdImg!: HTMLImageElement
  constructor(
    id: string,
    conf: birdConf,
    status: birdStatus,
    direction: birdDirection,
    spawnPosition: birdSpawnPosition,
    currentPosition: birdCurrentPosition,
    ctx: CanvasRenderingContext2D
  ) {
    this.id = id
    this.conf = conf
    this.state = status
    this.direction = direction
    this.originalSpeed = myClone(conf.speed)
    this.currentSpeed = myClone(conf.speed)
    this.spawnPosition = spawnPosition
    this.currentPosition = myClone(spawnPosition)
    this.ctx = ctx
    this.birdImg = new Image()
    this.birdImg.src = bird0_1
  }

  public upper() {
    // TODO...
    this.currentSpeed.VY = this.originalSpeed.VY
    this.direction = 'up'
  }

  public draw() {
    this.ctx.fillStyle = '#2980b9'
    this.ctx.beginPath()
    // 暂时先用⚪代替小鸟
    this.ctx.drawImage(
      this.birdImg,
      this.currentPosition.X,
      this.currentPosition.Y,
      this.conf.size,
      this.conf.size
    )
    this.ctx.fill()
    this.ctx.closePath
  }

  public update(seconds: number) {
    if (this.direction !== 'balance') {
      if (this.direction === 'down') {
        this.currentPosition.Y += this.originalSpeed.VY * seconds
      } else if (this.direction === 'recovery') {
        this.currentSpeed.VY += 15
        if (this.currentSpeed.VY >= this.originalSpeed.VY) {
          this.currentSpeed.VY = this.originalSpeed.VY
          this.direction = 'down'
        }
        this.currentPosition.Y += this.currentSpeed.VY * seconds
      } else if (this.direction === 'up') {
        this.currentSpeed.VY -= 15
        this.birdImg.src = bird0_2
        if (this.currentSpeed.VY <= 0) {
          this.currentSpeed.VY = 0
          this.direction = 'recovery'
          this.birdImg.src = bird0_0
        }
        this.currentPosition.Y -= this.currentSpeed.VY * seconds
      }
    }
  }
}

// 小鸟工厂🥩
export class BirdFactory {
  public ctx: CanvasRenderingContext2D
  public static instance: BirdFactory | undefined
  public myBird!: Bird
  public birds!: Bird[]

  constructor(el: HTMLCanvasElement) {
    this.ctx = el.getContext('2d')!
    this.birds = []
  }

  public createBird(
    id: string,
    conf: birdConf,
    status: birdStatus = 'padding',
    direction: birdDirection = 'down',
    spawnPosition: birdSpawnPosition,
    currentPosition?: birdCurrentPosition
  ) {
    if (!currentPosition) currentPosition = spawnPosition
    const bird = new Bird(
      id,
      conf,
      status,
      direction,
      spawnPosition,
      currentPosition,
      this.ctx
    )
    if (conf.ascription === 'self') this.myBird = bird
    else this.birds.push(bird)
    return { id, bird }
  }

  public getAllBirds() {
    return [this.myBird, ...this.birds]
  }

  static getInstance(el: HTMLCanvasElement) {
    if (!BirdFactory.instance) {
      BirdFactory.instance = new BirdFactory(el)
    }
    return BirdFactory.instance
  }
}
