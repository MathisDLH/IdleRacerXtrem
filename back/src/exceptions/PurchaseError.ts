export class PurchaseError extends Error {
    constructor(currentMoney: string, neededMoney: string) {
        super(`you need ${neededMoney} but you have ${currentMoney}`);
    }
}