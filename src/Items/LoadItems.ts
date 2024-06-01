import ItemsDat, { ItemData } from "./ItemsDat";

export class LoadItems {
    constructor(public ItemsDatLocation: Buffer, public customItemLocation?: Buffer) {}
    private data?: ItemData[] = [];

    public async start() {
        const itemsDat = await new ItemsDat({ itemsDat: this.ItemsDatLocation }).parse();
        this.data = itemsDat.items;
    }

    public findWithID(itemID: number) {
        return this.data!.find(({ item_id }) => item_id == itemID) || {};
    }

    public getItems() {
        return this.data || [];
    }
}