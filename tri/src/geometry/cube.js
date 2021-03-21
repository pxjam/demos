export default class Cube {
    points = [
        [-1, -1, -1],
        [-1, 1, -1],
        [1, -1, -1],
        [1, 1, -1],
        [-1, -1, 1],
        [-1, 1, 1],
        [1, -1, 1],
        [1, 1, 1]
    ]
    edges = [
        [0, 1],
        [0, 2],
        [0, 4],
        [1, 3],
        [1, 5],
        [2, 3],
        [2, 6],
        [3, 7],
        [4, 5],
        [4, 6],
        [5, 7],
        [6, 7]
    ]
}