const API_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

export const executeBatchAlgorithm = async (payload: object) => {
  const response = await fetch(`${process.env.API_URL}/algorithm/`, {
    method: "POST",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
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

export const executeClearMapJSON = async () => {
  const response = await fetch(`${process.env.API_URL}/clear_map_json/`, {
    method: "POST",
    headers: API_HEADERS,
  });
  return await response.json();
};

export const executeInitializeMapJSON = async (payload: object) => {
  const response = await fetch(`${process.env.API_URL}/initialize_map_json/`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify(payload),
  });
  return await response.json();
};

export const executeGenerateMap = async (payload: object) => {
  const response = await fetch(`${process.env.API_URL}/generate_map/`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify(payload),
  });
  return await response.json();
};
