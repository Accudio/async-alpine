export default function alert(message = 'Alert loaded') {
  return {
    init() {
      window.alert(message);
    },
  };
}
