let iter = (data) => {
    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }
    data = JSON.parse(data)

    Object.keys(data).forEach(key => {
        if (data[key] !== null && typeof data[key] === 'object') {
            data[key] = iter(data[key])
        }

        if (typeof data[key] === 'string' && !isNaN(data[key]) || typeof data[key] === 'number') {
            let num = parseFloat(data[key])
            num = Number(num.toFixed(4))
            data[key] = num
        }
    })

    return data
}

export default (data) => {
    data = JSON.stringify(iter(data))
    console.log(data)
    return data
}