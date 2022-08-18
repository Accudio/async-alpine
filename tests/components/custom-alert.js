export default function customAlert(message = 'Alert loaded') {
  return {
    init() {
      window.alert(message);
    },
  };
}
