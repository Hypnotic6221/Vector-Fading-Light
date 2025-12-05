const friendlyNpcSpawnpointsData = {
  objects: [
    {
      height: 0,
      id: 122,
      name: "",
      point: true,
      rotation: 0,
      type: "",
      visible: true,
      width: 0,
      x: 700,
      y: 8900,
    },
    {
      height: 0,
      id: 123,
      name: "",
      point: true,
      rotation: 0,
      type: "",
      visible: true,
      width: 0,
      x: 500,
      y: 6200,
    },
    {
      height: 0,
      id: 124,
      name: "",
      point: true,
      rotation: 0,
      type: "",
      visible: true,
      width: 0,
      x: 500,
      y: 1200,
    },
    {
      height: 0,
      id: 125,
      name: "",
      point: true,
      rotation: 0,
      type: "",
      visible: true,
      width: 0,
      x: 4500,
      y: 300,
    },
    {
      height: 0,
      id: 126,
      name: "",
      point: true,
      rotation: 0,
      type: "",
      visible: true,
      width: 0,
      x: 9600,
      y: 3600,
    },
    {
      height: 0,
      id: 127,
      name: "",
      point: true,
      rotation: 0,
      type: "",
      visible: true,
      width: 0,
      x: 9300,
      y: 8700,
    },
    {
      height: 0,
      id: 128,
      name: "",
      point: true,
      rotation: 0,
      type: "",
      visible: true,
      width: 0,
      x: 6200,
      y: 9600,
    },
  ],
};

function getFriendlyNpcSpawnpoints() {
  const friendlyNpcSpawnpoints = [];
  friendlyNpcSpawnpointsData.objects.map((spawnPoint) => {
    friendlyNpcSpawnpoints.push({
      x: spawnPoint.x,
      y: spawnPoint.y,
    });
  });
  return friendlyNpcSpawnpoints;
}
