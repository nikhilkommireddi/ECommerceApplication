import React from "react";
import SortingViz from "./SortingViz";
import SearchingViz from "./SearchingViz";
import PathfindingViz from "./PathfindingViz";
import NQueensViz from "./NQueensViz";
import HanoiViz from "./HanoiViz";
import TSPViz from "./TSPViz";
import BackpropViz from "./BackpropViz";

// Maps a challenge id to its visualizer.
export const VIZ = {
  sorting: () => <SortingViz />,
  searching: () => <SearchingViz />,
  dijkstra: () => <PathfindingViz defaultAlgo="dijkstra" />,
  astar: () => <PathfindingViz defaultAlgo="astar" />,
  nqueens: () => <NQueensViz />,
  hanoi: () => <HanoiViz />,
  tsp: () => <TSPViz />,
  backprop: () => <BackpropViz />,
};
