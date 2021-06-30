import { Ref, onMounted } from 'vue'
import { Bird, BirdFactory } from '../types/bird'
import { Obstacle, ObstacleFactory } from '../types/obstacle'
import { EventBus } from '../types/eventBus'
import { creatId } from '../utils'

// Images...
import bg_night from '../assets/imgs/bg_night.png'
import land from '../assets/imgs/land.png'

export const eventBus = EventBus.getInstance()
type gameStatus = 'padding' | 'running' | 'endding'
const gameSetting = {
  activationKeys: [' ', 'w', 'ArrowUp'],
  confirmKeys: [' '],
}

class GameBoard {
  public ctx!: CanvasRenderingContext2D
  public birdFactory!: BirdFactory
  public boardWidth!: number
  public boardHeight!: number
  public status!: gameStatus
  public birds!: Map<string, Bird>
  public obstacles!: Map<string, Obstacle[]>
  public startTime: number | undefined
  public isCounting!: boolean
  public bgImge!: HTMLImageElement

  constructor(
    el: HTMLCanvasElement,
    birdFactory: BirdFactory,
    boardWidth: number,
    boardHeight: number
  ) {
    this.ctx = el.getContext('2d')!
    this.birdFactory = birdFactory
    this.boardWidth = boardWidth
    this.boardHeight = boardHeight
    this.birds = new Map()
    this.obstacles = new Map()
    this.startTime
    this.status = 'running'
    this.bgImge = new Image()
    this.bgImge.src = bg_night
  }

  public addBirdEntity(birdEntity: { id: string; bird: Bird }) {
    this.birds.set(birdEntity.id, birdEntity.bird)
  }

  public addObstacleEntities(obstacleEntities: {
    id: string
    obstacles: Obstacle[]
  }) {
    this.obstacles.set(obstacleEntities.id, obstacleEntities.obstacles)
  }

  public removeObstacleEntities(id: string) {
    this.obstacles.delete(id)
  }

  public getAllBirdEntities() {
    return Array.from(this.birds.values())
  }

  public getAllObstacleEntities() {
    const allCompleteObstacles = Array.from(this.obstacles.values())
    const allObstacles: Obstacle[] = []
    allCompleteObstacles.forEach(_obstacles => allObstacles.push(..._obstacles))
    return allObstacles
  }

  public run() {
    window.requestAnimationFrame(this.process.bind(this))
  }

  public getMyBird() {
    return this.birdFactory.myBird
  }

  public process(now: number) {
    const allBirdCanvasEntities = this.getAllBirdEntities()
    const allObstacleCanvasEntities = this.getAllObstacleEntities()
    if (!this.startTime) this.startTime = now
    let seconds = (now - this.startTime) / 1000
    this.startTime = now
    // 绘画实体更新
    for (let i = 0; i < allBirdCanvasEntities.length; i++)
      allBirdCanvasEntities[i].update(seconds)
    for (let i = 0; i < allObstacleCanvasEntities.length; i++)
      allObstacleCanvasEntities[i].update(seconds)
    this.ctx.clearRect(0, 0, this.boardWidth, this.boardHeight)

    // 碰撞检测
    this.clashCheck()

    // 背景绘制
    // this.ctx.drawImage(this.bgImge, 0, 0, this.boardWidth / 4, this.boardHeight)

    // 绘画实体
    for (let i = 0; i < allObstacleCanvasEntities.length; i++)
      allObstacleCanvasEntities[i].draw()
    for (let i = 0; i < allBirdCanvasEntities.length; i++)
      allBirdCanvasEntities[i].draw()

    // 更新Canvas
    if (this.status === 'running')
      window.requestAnimationFrame(this.process.bind(this))
  }

  public clashCheck() {
    const allObstacleEntities = this.getAllObstacleEntities()
    const myBird = this.getMyBird()
    const myBirdCurrentX = myBird.currentPosition.X
    const myBirdCurrentY = myBird.currentPosition.Y
    const myBirdSize = myBird.conf.size
    // 开始判定
    if (
      myBirdCurrentX >= allObstacleEntities[0].currentPosition.X - myBirdSize &&
      myBirdCurrentX <=
        allObstacleEntities[0].currentPosition.X +
          allObstacleEntities[0].conf.width
    ) {
      this.isCounting = true
      if (
        myBirdCurrentY <= allObstacleEntities[0].height ||
        myBirdCurrentY >=
          this.boardHeight - myBirdSize - allObstacleEntities[1].height
      ) {
        this.status = 'endding'
      }
    } else if (
      myBirdCurrentX >
      allObstacleEntities[0].currentPosition.X +
        allObstacleEntities[0].conf.width
    ) {
      if (this.isCounting) {
        console.log('+1')
        this.isCounting = false
      }
    }
  }
}

// 游戏入口
function Flappy(el: HTMLCanvasElement) {
  const birdFactory = BirdFactory.getInstance(el)
  const obstacleFactory = ObstacleFactory.getInstance(el)
  const gameBoard = new GameBoard(el, birdFactory, el.width, el.height)
  let tmpCreatorId: string = ''
  const keyBordEvent = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return
    if (gameSetting.activationKeys.includes(event.key)) {
      gameBoard.getMyBird().upper()
    }
  }
  document.addEventListener('keydown', keyBordEvent)
  const myBird = birdFactory.createBird(
    creatId(),
    {
      size: 70,
      speed: {
        VX: 0,
        VY: 400,
      },
      upDuration: 300,
      ySpeedDecrease: 15,
      ascription: 'self',
    },
    undefined,
    undefined,
    { X: 100, Y: 100 }
  )
  gameBoard.addBirdEntity(myBird)
  gameBoard.addObstacleEntities(obstacleFactory.createObstacle())
  eventBus.on('removeObstacle', (id: string) => {
    gameBoard.removeObstacleEntities(id)
  })
  eventBus.on('createNextObstacle', (id: string) => {
    if (tmpCreatorId !== id)
      gameBoard.addObstacleEntities(obstacleFactory.createObstacle())
    tmpCreatorId = id
  })
  gameBoard.run()
}

export function initFlappy(refEl: Ref<HTMLCanvasElement | undefined>) {
  onMounted(() => {
    const el: HTMLCanvasElement = refEl.value!
    let width = window.innerWidth
    let height = window.innerHeight
    el.width = width
    el.height = height
    Flappy(el)
  })
}
