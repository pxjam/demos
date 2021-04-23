export default function getSymmetricObject(arr) {
    return arr.reduce((acc, curr) => {
        acc[curr] = curr
        return acc
    }, {})
}


