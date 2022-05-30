const API_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

export const executeBatchAlgorithm = async (payload: object) => {
  const response = await fetch(`${process.env.API_URL}/algorithm/`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify(payload),
  });
  return await response.json();
};

export const executeSingleRobot = async (payload: object) => {
  const response = await fetch(`${process.env.API_URL}/single_robot/`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify(payload),
  });
  return await response.json();
};
