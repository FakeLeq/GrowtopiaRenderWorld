export interface ParseData {
    worldInfo?: WorldInfo;
    BlockInfo?: BlockInfo[];

    DroppedItem?: DroppedItem[];
}

interface WorldInfo {
    name?: string;
    width?: number;
    height?: number;
    tileCount?: number; // = width*height

    droppedItemCount?: number;
    lastDroppedItemUID?: number;

    weatherBase?: number;
    weatherCurrent?: number;
}

export interface BlockInfo {
    x?: number;
    y?: number;

    fgID?: number;
    bgID?: number;

    parent_block_index?: number;
    flags?: number;
    flag_locked_index?: number;

    tileExtraType?: number;
    tileExtraData?: {}
}

export interface DroppedItem {
    itemID?: number;

    x?: number;
    y?: number;

    itemCount?: number;

    flags?: number;
    itemUID?: number;
}