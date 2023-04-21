import { action, computed, makeObservable, observable, runInAction } from 'mobx'

interface IReadableVar<T> {
  $value: T
}

interface IWritableVar<T> extends IReadableVar<T> {
  set(value: T): void
}

export class WritableVar<T> implements IWritableVar<T> {
  // @ts-ignore
  @observable public $value: T = undefined

  constructor(initial: T) {
    makeObservable(this)

    this.$value = initial
  }

  @action public set(value: T) {
    runInAction(() => {
      this.$value = value
    })
  }
}

export class ReadableVar<T> implements IReadableVar<T> {
  @computed public get $value() {
    return this.rxVar.$value
  }

  constructor(private readonly rxVar: IReadableVar<T>) {
    makeObservable(this)
  }
}
