export default function complex() {
  return {
    loaded: false,
    toggle: false,
    model: '',
    numbers: [],

    init() {
      this.loaded = true
      for (let i = 0; i < 10; i++) {
        this.numbers.push(i)
      }
    },
  };
}
