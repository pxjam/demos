let timeSum = 0
let timesCount = 0

export default function measure(time0, time1) {
    timeSum += time1 - time0
    timesCount++

    if (timesCount >= 60) {
        console.log(timeSum / 60)
        timeSum = 0
        timesCount = 0
    }
}