import type { NextPage } from "next";
import { useRouter } from "next/router";
import Canvas from "../components/Canvas";
import { MAP_1 } from "../maps/map_1";
import { MAP_2 } from "../maps/map_2";
import { MAP_3 } from "../maps/map_3";

const App: NextPage = () => {
  const router = useRouter();
  const { map } = router.query;

  if (!map) {
    return null;
  }

  // Get map from router parameter
  const mapIndex = parseInt(map[0], 10);

  // Initialize map array
  const maps = [MAP_1, MAP_2, MAP_3];

  return <Canvas map={maps[mapIndex]} />;
};

export default App;
