import { describe, expect, it } from 'vitest'
import { deepEqual } from './deepEqual'

describe('deepEqual', () => {
  it('should be defined', () => {
    expect(deepEqual).toBeDefined()
  })

  it('number', () => {
    expect(deepEqual(1, 1)).true
    expect(deepEqual(1, 2)).false
    expect(deepEqual(1, '1')).false
  })

  it('string', () => {
    expect(deepEqual('', 'abcd')).false
    expect(deepEqual('abcd', 'abcd')).true
  })

  it('array', () => {
    expect(deepEqual([1, 2], [1, 2])).true
    expect(deepEqual([1, 2], [2, 1])).false
  })

  it('null or undefined', () => {
    expect(deepEqual(null, undefined)).false
    expect(deepEqual(undefined, undefined)).true
    expect(deepEqual(null, null)).true
  })

  it('object', () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).true
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, c: 2 })).false
    expect(deepEqual({ a: 2, b: 1 }, { a: 1, b: 2 })).false
    expect(deepEqual({ a: 2 }, { a: 1, b: 2 })).false
    expect(deepEqual(null, { a: 1, b: 2 })).false
  })

  it('object + array', () => {
    expect(deepEqual({ a: 1, b: { c: { d: 'e' } } }, { a: 1, b: { c: { d: 'e' } } })).true
    expect(deepEqual({ a: 1, b: { c: { d: 'e' } } }, { a: 1, b: { c: 'd' } })).false
    expect(deepEqual([{ a: 1, b: { c: { d: 'e' } } }], [{ a: 1, b: { c: { d: 'e' } } }])).true
  })

  it('object + function', () => {
    const func1 = () => {}
    const func2 = () => {}

    expect(deepEqual(func1, func2)).false
    expect(deepEqual(func1, func1)).true

    expect(deepEqual({ func1, b: { func2 } }, { func1, b: { func2 } })).true
    expect(deepEqual({ func1 }, { func2 })).false
  })

  it('date object', () => {
    const nowTime = Date.now()
    expect(deepEqual(new Date(nowTime), new Date(nowTime))).true
    expect(deepEqual(new Date(nowTime + 1), new Date(nowTime + 2))).false
  })

  it('circular reference object', () => {
    const objA = { a: 1, b: null as any }
    objA.b = objA

    const objACopy = { a: 1, b: null as any }
    objACopy.b = objACopy

    expect(deepEqual(objA, objA)).true
    expect(deepEqual(objA, objACopy)).false

    const obj2 = { a: objA }
    objA.b = obj2

    expect(deepEqual(obj2, obj2)).true
    expect(deepEqual(obj2, objA)).false
  })
})
