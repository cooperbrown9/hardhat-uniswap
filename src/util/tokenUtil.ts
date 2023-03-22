import { BigNumber } from 'bignumber.js'

const Q192 = BigNumber(2).exponentiatedBy(192)


export function calculateSqrtPriceX96(price: number, token0Dec: number, token1Dec: number) {
    const _price = BigNumber(price).shiftedBy(token1Dec - token0Dec)
    const ratioX96 = _price.multipliedBy(Q192)
    const sqrtPriceX96 = ratioX96.sqrt()
    return sqrtPriceX96
}

export function getNearestUsableTick(currentTick: number, space: number) {
    // 0 is always a valid tick
    if (currentTick == 0) {
        return 0
    }
    // Determines direction
    const direction = (currentTick >= 0) ? 1 : -1
    // Changes direction
    currentTick *= direction
    // Calculates nearest tick based on how close the current tick remainder is to space / 2
    let nearestTick = (currentTick % space <= space / 2) ? currentTick - (currentTick % space) : currentTick + (space - (currentTick % space))
    // Changes direction back
    nearestTick *= direction

    return nearestTick
}
