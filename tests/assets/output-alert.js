export default function outputAlert(message = 'Alert loaded') {
  return {
    init() {
      window.alert(message)
      this.$el.innerHTML = message;
    },
  };
}
