export default function reduceArrayToObject(arr) {
    return arr.reduce((acc, curr) => {
        acc[curr] = curr
        return acc
    }, {})
}


