import { useEffect, useState } from 'react';

const solution = ['H', 'U', 'S', 'T', 'L', 'O', 'O', 'P', ''];
const grid_size = 3;

interface Node {
  state: string[];
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

const getMovableTiles = (index: number): number[] => {
  const moves: number[] = [];
  const row = Math.floor(index / grid_size);
  const col = index % grid_size;
  if (row > 0) moves.push(index - grid_size);
  if (row < grid_size - 1) moves.push(index + grid_size);
  if (col > 0) moves.push(index - 1);
  if (col < grid_size - 1) moves.push(index + 1);
  return moves;
};

const isPuzzleSolved = (state: string[]): boolean => {
  const tempState = [...state];
  const tempSolution = [...solution];
  for (let i = 0; i < tempState.length; i++) {
    if (tempState[i] !== 'O' && tempState[i] !== tempSolution[i]) {
      return false;
    }
  }
  const oPositionsState = tempState.reduce((acc: number[], val, idx) => {
    if (val === 'O') acc.push(idx);
    return acc;
  }, []);
  const oPositionsSolution = tempSolution.reduce((acc: number[], val, idx) => {
    if (val === 'O') acc.push(idx);
    return acc;
  }, []);
  return (
    (oPositionsState.includes(oPositionsSolution[0]) && oPositionsState.includes(oPositionsSolution[1]))
  );
};

const calculateManhattanDistance = (state: string[]): number => {
  let distance = 0;
  for (let i = 0; i < state.length; i++) {
    const letter = state[i];
    if (letter !== '') {
      if (letter === 'O') {
        const solIndex1 = solution.indexOf('O');
        const solIndex2 = solution.lastIndexOf('O');
        const dist1 = Math.abs(Math.floor(i / grid_size) - Math.floor(solIndex1 / grid_size)) + Math.abs((i % grid_size) - (solIndex1 % grid_size));
        const dist2 = Math.abs(Math.floor(i / grid_size) - Math.floor(solIndex2 / grid_size)) + Math.abs((i % grid_size) - (solIndex2 % grid_size));
        distance += Math.min(dist1, dist2);
      } else {
        const solIndex = solution.indexOf(letter);
        const curRow = Math.floor(i / grid_size);
        const curCol = i % grid_size;
        const solRow = Math.floor(solIndex / grid_size);
        const solCol = solIndex % grid_size;
        distance += Math.abs(curRow - solRow) + Math.abs(curCol - solCol);
      }
    }
  }
  return distance;
};

const findSolutionPath = (node: Node): string[][] => {
  const path: string[][] = [];
  let current: Node | null = node;
  while (current && current.parent) {
    path.unshift(current.state);
    current = current.parent;
  }
  return path;
};

const SlidingPuzzle = () => {
  const [currentState, setCurrentState] = useState<string[]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [message, setMessage] = useState('');

  const scramblePuzzle = () => {
    setIsSolving(false);
    let scrambledState = [...solution];
    let emptyIndex = 8;
    // Perform exactly 4 random moves to guarantee a 4-move solution
    for (let i = 0; i < 4; i++) {
      const movableTiles = getMovableTiles(emptyIndex);
      const randomMove = movableTiles[Math.floor(Math.random() * movableTiles.length)];
      [scrambledState[randomMove], scrambledState[emptyIndex]] = [scrambledState[emptyIndex], scrambledState[randomMove]];
      emptyIndex = randomMove;
    }
    if (isPuzzleSolved(scrambledState)) {
      scramblePuzzle();
    } else {
      setCurrentState(scrambledState);
    }
  };

  const animateSolution = async (path: string[][]) => {
    for (const state of path) {
      setCurrentState([...state]);
      await new Promise(r => setTimeout(r, 200));
    }
  };

  const solvePuzzle = async () => {
    if (isSolving || isPuzzleSolved(currentState)) return;
    setIsSolving(true);
    setMessage('Solving...');

    const openSet = new Map<string, Node>();
    const startNode: Node = {
      state: [...currentState],
      g: 0,
      h: calculateManhattanDistance(currentState),
      f: calculateManhattanDistance(currentState),
      parent: null,
    };
    openSet.set(startNode.state.toString(), startNode);
    let solutionFound = false;

    for (let i = 0; i < 200000; i++) {
      if (openSet.size === 0) break;
      
      if (i % 500 === 0) {
        await new Promise(r => setTimeout(r, 0));
      }

      let currentNode: Node | null = null;
      let minF = Infinity;

      for (const node of openSet.values()) {
        if (node.f < minF) {
          minF = node.f;
          currentNode = node;
        }
      }

      if (!currentNode) break;

      if (isPuzzleSolved(currentNode.state)) {
        const path = findSolutionPath(currentNode);
        await animateSolution(path);
        solutionFound = true;
        break;
      }

      openSet.delete(currentNode.state.toString());
      const emptyIndex = currentNode.state.indexOf('');
      const movableTiles = getMovableTiles(emptyIndex);

      for (const move of movableTiles) {
        const neighborState = [...currentNode.state];
        [neighborState[move], neighborState[emptyIndex]] = [neighborState[emptyIndex], neighborState[move]];

        const g = currentNode.g + 1;
        const h = calculateManhattanDistance(neighborState);
        const neighborNode: Node = { state: neighborState, g, h, f: g + h, parent: currentNode };
        const neighborStateStr = neighborState.toString();

        if (openSet.has(neighborStateStr) && g >= openSet.get(neighborStateStr)!.g) {
          continue;
        }
        openSet.set(neighborStateStr, neighborNode);
      }
    }

    setIsSolving(false);
    if (solutionFound) {
      setMessage('Solved! 🎉');
    } else {
      setMessage('Solution not found. Try again.');
    }
  };

  const startAutoPlay = async () => {
    for (let i = 0; i < 3; i++) {
      setMessage(`Starting round ${i + 1}...`);
      await new Promise(r => setTimeout(r, 800));
      scramblePuzzle();
      await new Promise(r => setTimeout(r, 1000));
      await solvePuzzle();
      await new Promise(r => setTimeout(r, 1000));
      await solvePuzzle();
      await new Promise(r => setTimeout(r, 1500));
    }
    setMessage('Auto-play complete!');
  };
  
  useEffect(() => {
    setCurrentState([...solution]);
    startAutoPlay();
  }, []);

  return (
    <div className="hidden md:flex flex-col items-center h-screen justify-center p-4 font-heading">
      <div className="grid grid-cols-3 gap-3 w-[500px] h-[500px] p-4 bg-background-800 rounded-2xl">
        {currentState.map((letter, index) => (
          <div
            key={index}
            className={`flex justify-center items-center text-6xl font-bold rounded-lg font-headline ${
              letter === ""
                ? " text-[#D4AF37] font-semibold shadow-[inset_0_2px_6px_rgba(0,0,0,0.3)]"
                : " text-[#D4AF37] shadow-[inset_0_2px_6px_rgba(0,0,0,0.3)] cursor-pointer hover:scale-105 transition"
            }`}
          >
            {letter === "" ? (
              <span className="animate-pulse">_</span>
            ) : (
              letter.replace(/[0-9]/g, "")
            )}
          </div>
        ))}
      </div>
      <div id="message-box" className="message-box mt-6 p-4 text-center text-lg font-medium rounded-lg h-12">
        {message}
      </div>
    </div>
  );
};

export default SlidingPuzzle;