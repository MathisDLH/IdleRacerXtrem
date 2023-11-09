type EventListenerType = (data: any) => void

type EventMap = Record<string, EventListenerType[]>

const createEventEmitter = (): any => {
  const events: EventMap = {}

  const on = (eventName: string, listener: EventListenerType): void => {
    if (!events[eventName]) {
      events[eventName] = []
    }

    events[eventName].push(listener)
  }

  const emit = (eventName: string, data: any): void => {
    const listeners = events[eventName]

    if (listeners) {
      listeners.forEach((listener) => {
        listener(data)
      })
    }
  }

  const off = (eventName: string, listener: EventListenerType): void => {
    const listeners = events[eventName]

    if (listeners) {
      events[eventName] = listeners.filter((l) => l !== listener)
    }
  }

  return {
    on,
    emit,
    off
  }
}

export const eventEmitter = createEventEmitter()
