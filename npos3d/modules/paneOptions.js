export let paneOptions = (...args) => {
    return args.reduce((acc, curr) => {
        acc[curr] = curr
        return acc
    }, {})
}