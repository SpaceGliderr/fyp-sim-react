const API_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

const executePathPlanning = async (payload) => {
  const response = await fetch(`http://127.0.0.1:8000/plan_path/`, {
    method: "POST",
    headers: API_HEADERS,
    body: payload,
  });
  return await response.json();
};

self.onmessage = (event) => {
  const { data } = event;
  const test = JSON.parse(data);
  console.log(`Worker for robot ID ${test.id} started`);

  const response = executePathPlanning(data);

  response.then((res) => {
    console.log(`Response for robot ID ${test.id} received`);
    console.log(res);
  });

  self.postMessage(`Robot ${data} has finished executing`);
};
