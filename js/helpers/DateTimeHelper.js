export class DateTimeHelper {
  constructor(date) {
    this.date = date;
  }

  static instance(date = null) {
    if (date === null) {
      date = undefined;
    }

    let dateInstance = new Date(date);

    if (!JSON.parse(JSON.stringify(dateInstance))) {
      dateInstance = new Date();
    }

    return new this(dateInstance);
  }

  format() {
    return `${this.date.getFullYear()}/${this.date.getMonth()}/${this.date.getDate()} ${this.date.getHours()}:${this.date.getMinutes()}:${this.date.getSeconds()}`;
  }
}
