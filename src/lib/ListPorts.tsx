export async function listPorts(type) {
  return new Promise((resolve, reject) => {
    window.electronAPI.handlePortList((_, newPortList) => {
      console.log("new ports list", newPortList);
      resolve(newPortList);
    });
    window.electronAPI.listPorts(type);
  });
}
