const API_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

const executePathPlanning = async (payload) => {
  const response = await fetch(`http://127.0.0.1:8000/plan_path/`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify(payload),
  });
  return await response.json();
};

const executeSingleRobot = async (payload, id) => {
  const response = await fetch(`http://127.0.0.1:8000/single_robot/`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify(payload),
  });
  return await response.json();
};

self.onmessage = async (event) => {
  const { data } = event;
  const args = JSON.parse(data);

  const { operation, payload } = args;

  let response;

  switch (operation) {
    case "PLAN_PATH":
      await executePathPlanning(payload)
        .then((res) => {
          response = res;
        })
        .catch((err) => {
          console.log(err);
        });

      break;

    case "FIND_LEADER":
      await executeSingleRobot(payload).then((res) => {
        response = res;
      });

      break;

    case "NAVIGATE":
      await executeSingleRobot(payload).then((res) => {
        response = res;
      });

      break;

    case "COLLISION":
      await executeSingleRobot(payload).then((res) => {
        response = res;
      });

      break;

    default:
      break;
  }

  self.postMessage({
    operation,
    payload: response,
  });
};
