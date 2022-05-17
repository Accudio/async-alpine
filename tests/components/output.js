export default function output(message = 'Output loaded') {
  return {
    init() {
      this.$el.innerHTML = message;
    },
  };
}
