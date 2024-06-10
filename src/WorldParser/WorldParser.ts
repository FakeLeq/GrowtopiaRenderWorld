import { BlockInfo, DroppedItem, ParseData } from "../utils/parseData";
import { TileExtra } from "../utils/iTileExtra";
import { TileFlags } from "../utils/cFlags";
import { ItemInfo } from "../Items/ItemInfo/Items";
import { writeFileSync } from "fs";

export class WorldParser {
  public pos = 0;
  private data: ParseData = {
    worldInfo: {},
    BlockInfo: [],
    DroppedItem: [],
    TileExtraItems: []
  };

  constructor(public world: Buffer) {};
    /**
   * 
   * @private 
   */
    private read8() {
    let val = this.world?.readUint8(this.pos);
    this.pos++
    return val;
  }

  /**
   * 
   * @private 
   */
  private read16() {
    let val = this.world?.readUint16LE(this.pos);
    this.pos += 2;

    return val;
  }

  /**
   * 
   * @private 
   */
  private read32() {
    let val = this.world?.readUint32LE(this.pos);
    this.pos += 4;

    return val;
  }

  private readFloat() {
    let val = this.world.readFloatLE(this.pos);
    this.pos += 4;

    return val;
  }

  /**
   * 
   * @private 
   */
  private readArr(length: number) {
    let arr: any[] = [];

    for(let i = 0; i < length; i++) {
      arr.push(this.read8());
    }

    return arr;
  }

  private readList() {
    let arr: any[] = [];

    let lenght_ = this.read32();

    for(let i = 0; i < lenght_; i++) {
        arr.push(this.read32());
    }
    return arr;
  }

  /**
   * 
   * @private 
   */
  private readString() {
    let length = this.read16();
    let str = "";

    for(let i = 0; i < length; i++) str += String.fromCharCode(this.read8() as number);
    
    return str;
  }

  private parseInfoAndTile() {
    this.pos += 6;

    this.data.worldInfo!.name = this.readString();
    this.data.worldInfo!.width = this.read32();
    this.data.worldInfo!.height = this.read32();
    this.data.worldInfo!.tileCount = this.read32(); // width*height

    if(!this.data.worldInfo?.name || !this.data.worldInfo.width || !this.data.worldInfo.height || !this.data.worldInfo.tileCount) throw new Error("Error happened while getting WorldInfo");

    this.pos += 5;

    for(let i = 0; i < this.data.worldInfo.tileCount; i++) {
      let _block = {} as BlockInfo;

      _block.x = i % this.data.worldInfo.width;
      _block.y = Math.floor(i / this.data.worldInfo.width);

      _block.fgID = this.read16();
      _block.bgID = this.read16();

      _block.parent_block_index = this.read16();
      _block.flags = this.read8();
      this.pos++

      if(_block.flags & TileFlags.TILE_LOCKED) _block.flag_locked_index = this.read16();

      if(_block.flags & TileFlags.TILE_EXTRA) _block.tileExtraType = this.read8(); 

      switch(_block.tileExtraType) {
        case TileExtra.Types.NONE: break;

        case TileExtra.Types.DOOR: {
          _block.tileExtraData = { label: this.readString() } as TileExtra.Door
          this.pos++;
        } break;

        case TileExtra.Types.SIGN: {
          _block.tileExtraData = { label: this.readString() } as TileExtra.Sign
          this.pos += 4;         
        } break;

        case TileExtra.Types.LOCK: {
          let lockSetFlag = this.read8(); // re applied?
          let ownerUID = this.read32();
          let accessedUIDs = this.readList();

          let joinWorldLevel = undefined;

          if(
              ![
                  ItemInfo.Items._SMALL_LOCK,
                  ItemInfo.Items._BIG_LOCK,
                  ItemInfo.Items._HUGE_LOCK,
                  ItemInfo.Items._BUILDERS_LOCK
              ].includes(_block.fgID)
          ) {
              joinWorldLevel = this.read8();
              this.pos += 7;
          }

          _block.tileExtraData = {
              lockSetFlag: lockSetFlag,
              ownerUID: ownerUID,
              accessedCount: accessedUIDs.length,
              accessedUIDs: accessedUIDs,
              joinWorldLevel: joinWorldLevel
          } as TileExtra.Lock
        } break;

        case TileExtra.Types.SEED: {
          _block.tileExtraData = { time: this.read32(), fruitCount: this.read8() } as TileExtra.Seed
        } break;

        case TileExtra.Types.DISPLAY_BLOCK: {
          _block.tileExtraData = { itemID: this.read32() } as TileExtra.Display_Block;
          this.data.TileExtraItems?.push((_block.tileExtraData as TileExtra.Display_Block).itemID!)
        } break;

        case TileExtra.Types.VENDING_MACHINE: {
          _block.tileExtraData = { itemID: this.read32(), price: this.read32() } as TileExtra.Vending_Machine;
        } break;

        case TileExtra.Types.DATA_BEDROCK: {
          this.pos += 21;
        } break;

        case TileExtra.Types.DISPLAY_SHELF: {
          _block.tileExtraData = {
            tr_itemID: this.read32(),
            tl_itemID: this.read32(),
            bl_itemID: this.read32(),
            br_itemID: this.read32(),
          } as TileExtra.Display_Shelf
          this.data.TileExtraItems?.push(
            (_block.tileExtraData as TileExtra.Display_Shelf).tl_itemID! || 0,
            (_block.tileExtraData as TileExtra.Display_Shelf).tr_itemID! || 0,
            (_block.tileExtraData as TileExtra.Display_Shelf).bl_itemID! || 0,
            (_block.tileExtraData as TileExtra.Display_Shelf).br_itemID! || 0,
          )
        } break;
      }
      this.data.BlockInfo?.push(_block);
    }

    writeFileSync("test.txt", JSON.stringify(this.data.BlockInfo, undefined, 2))
  }

  private parseDrops() {
    
    this.pos += 12;

    this.data.worldInfo!.droppedItemCount = this.read32();
    this.data.worldInfo!.lastDroppedItemUID = this.read32();

    for(let i = 0; i < this.data.worldInfo!.droppedItemCount; i++) {
      let _drop = {} as DroppedItem;

      _drop.itemID = this.read16();

      _drop.x = this.readFloat() / 32;
      _drop.y = this.readFloat() / 32;

      _drop.itemCount = this.read8();

      _drop.flags = this.read8();
      _drop.itemUID = this.read32();

      this.data.DroppedItem?.push(_drop);
    }
  }

  private parseExtra() {
    this.data.worldInfo!.weatherBase = this.read16();
    this.pos += 2;
    this.data.worldInfo!.weatherCurrent = this.read16();
    this.pos += 6;
  }

  public async parse() {
    this.parseInfoAndTile();
    this.parseDrops();
    this.parseExtra();
    
    return this.data;
  }
}