export class EventBus {
  public static instance: EventBus
  public eventList: { [name: string]: Function[] }
  constructor() {
    this.eventList = {}
  }

  public on(event: string, fn: Function) {
    this.eventList[event]
      ? this.eventList[event].push(fn)
      : (this.eventList[event] = [fn])
  }

  public emit(event: string, ...arg: any) {
    this.eventList[event] &&
      this.eventList[event].forEach(fn => {
        fn(...arg)
      })
  }

  public static getInstance() {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus()
    }
    return EventBus.instance
  }
}
