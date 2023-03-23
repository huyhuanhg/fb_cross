export class ObjectHelper {
  static has(object, key) {
    if (typeof key !== 'string' || ! this.isObject(object)) {
      throw new Error('Args type is invalid!')
    }

    if (!key) {
      return true
    }

    this.object = object
    const fullKey = `this.object.${key}`

    if (this.#eval(fullKey)) {
      return true
    }

    const parent = this.#parent(fullKey)

    return !! (this.isObject(parent) && parent.hasOwnProperty(fullKey.replace(/^(.+?)\.(\w+)$/, '$2')))
  }

  static get(object, key) {
    if (typeof key !== 'string' || ! this.isObject(object)) {
      throw new Error('Args type is invalid!')
    }

    if (!key) {
      return object
    }

    this.object = object
    const fullKey = `this.object.${key}`

    return this.#eval(fullKey)
  }

  static set(object, key, value) {
    const fullKey = `this.object.${key}`

    if (this.has(object, key)) {
      const lastKey = fullKey.replace(/^(.+?)\.(\w+)$/, '$2')
      this.#parent(fullKey)[lastKey] = value

      return this.object
    }

    return this.object
  }

  static isObject(objectValue) {
    return objectValue && typeof objectValue === 'object' && objectValue.constructor === Object;
  }

  static #parent(fullKey) {
    const parentKey = fullKey.replace(/(.+?)\.\w+$/, '$1')

    return this.#eval(parentKey)
  }

  static #eval(text) {
    try {
      return eval(text);
    } catch (e) {
      return undefined;
    }
  }
}


const obj = {
  key1: {
    key2: {
      key3: 'value_key_3'
    }
  }
}

const testHasKeyTrue = ObjectHelper.has(obj, 'key1.key2.key3')
const testHasKeyFalse = ObjectHelper.has(obj, 'key1.key2.key4')
const testGetKeyTrue = ObjectHelper.get(obj, 'key1.key2')
const testGetKeyFalse = ObjectHelper.get(obj, 'key1.key2.key4')
const testSetKeyTrue = ObjectHelper.set(obj, 'key1.key2.key3', 'new_value_key_3')

console.log('testHasKeyTrue :>> ', testHasKeyTrue);
console.log('testHasKeyFalse :>> ', testHasKeyFalse);
console.log('testGetKeyTrue :>> ', testGetKeyTrue);
console.log('testGetKeyFalse :>> ', testGetKeyFalse);
console.log('testSetKeyTrue :>> ', testSetKeyTrue);
