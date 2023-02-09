import { describe, expect, it } from 'vitest'
import { deepEqual } from './deepEqual'

describe('deepEqual', () => {
  it('should be defined', () => {
    expect(deepEqual).toBeDefined()
  })

  it('number', () => {
    expect(deepEqual(1, 1).equal).true
    expect(deepEqual(1, 2).equal).false
    expect(deepEqual(1, '1').equal).false
  })

  it('string', () => {
    expect(deepEqual('', 'abcd').equal).false
    expect(deepEqual('abcd', 'abcd').equal).true
  })

  it('array', () => {
    expect(deepEqual([1, 2], [1, 2]).equal).true
    expect(deepEqual([1, 2], [2, 1]).equal).false
  })

  it('null or undefined', () => {
    expect(deepEqual(null, undefined).equal).false
    expect(deepEqual(undefined, undefined).equal).true
    expect(deepEqual(null, null).equal).true
  })

  it('object', () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }).equal).true
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, c: 2 }).equal).false
    expect(deepEqual({ a: 2, b: 1 }, { a: 1, b: 2 }).equal).false
    expect(deepEqual({ a: 2 }, { a: 1, b: 2 }).equal).false
    expect(deepEqual(null, { a: 1, b: 2 }).equal).false
  })

  it('object + array', () => {
    expect(deepEqual({ a: 1, b: { c: { d: 'e' } } }, { a: 1, b: { c: { d: 'e' } } }).equal).true
    expect(deepEqual({ a: 1, b: { c: { d: 'e' } } }, { a: 1, b: { c: 'd' } }).equal).false
    expect(deepEqual([{ a: 1, b: { c: { d: 'e' } } }], [{ a: 1, b: { c: { d: 'e' } } }]).equal).true
  })

  it('object + function', () => {
    const func1 = () => {}
    const func2 = () => {}

    expect(deepEqual(func1, func2).equal).false
    expect(deepEqual(func1, func1).equal).true

    expect(deepEqual({ func1, b: { func2 } }, { func1, b: { func2 } }).equal).true
    expect(deepEqual({ func1 }, { func2 }).equal).false
  })

  it('date object', () => {
    const nowTime = Date.now()
    expect(deepEqual(new Date(nowTime), new Date(nowTime)).equal).true
    expect(deepEqual(new Date(nowTime + 1), new Date(nowTime + 2)).equal).false
  })

  it('circular reference object', () => {
    const objA = { a: 1, b: null as any }
    objA.b = objA

    const objACopy = { a: 1, b: null as any }
    objACopy.b = objACopy

    expect(deepEqual(objA, objA).equal).true
    expect(deepEqual(objA, objACopy).equal).false

    const obj2 = { a: objA }
    objA.b = obj2

    expect(deepEqual(obj2, obj2).equal).true
    expect(deepEqual(obj2, objA).equal).false
  })

  it('detection of the same object pointer', () => {
    const objA = { item: { v: 0 } }
    const objB = { ...objA }
    const res = deepEqual(objA, objB)
    expect(objA.item === objB.item).true
    expect(res.equal).true
    expect(res.pointersEqual).true
  })
})
