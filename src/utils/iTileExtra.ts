export namespace TileExtra {
    export interface Door {
        label?: string;
    }

    export interface Sign {
        label?: string;
    }

    export interface Lock {
        lockSetFlag?: number;

        ownerUID?: number;
        accessedCount?: number;
        accessedUIDs?: [];

        joinWorldLevel?: number;
    }

    export interface Seed {
        time?: number;
        fruitCount?: number;
    }

    export interface Display_Block {
        itemID?: number;
    }

    export interface Vending_Machine {
        itemID?: number;
        price?: number;
    }

    export interface Display_Shelf {
        tl_itemID?: number;
        tr_itemID?: number;
        bl_itemID?: number;
        br_itemID?: number;
    }

    export enum Types {
        NONE = 0,
        DOOR = 1,
        SIGN = 2,
        LOCK = 3,
        SEED = 4,

        DISPLAY_BLOCK = 23,
        VENDING_MACHINE = 24,

        DATA_BEDROCK = 42,

        DISPLAY_SHELF = 43,
        VIP_ENTRANCE = 44
    }
}