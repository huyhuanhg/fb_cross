export class ArrayHelper {
  static isArray(array) {
    return Array.isArray(array);
  }

  static where(array, [key, value]) {
    return array.find(item => item[key] === value)
  }
}
