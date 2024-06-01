interface Color {
  alpha: number;
  r: number;
  g: number;
  b: number;
}

export interface ItemData {
  version?: number;
  item_count?: number;


  item_id?: number;
  editableType?: number;
  itemCategory?: number;
  actionType?: number;
  hitSoundType?: number;

  item_name?: string;

  item_texture?: string;
  textureHash?: number;

  visualEffect?: number;
  ingredientType?: number;

  textureX?: number;
  textureY?: number;

  spreadType?: number;
  stripeyWallpapaer?: number;
  collisionType?: number;
  
  hitsToBreak?: number;
  restoreTime?: number;

  clothingType?: number;

  rarity?: number;
  maxCapacity?: number;

  extraFile?: string;
  extrafileHash?: number;

  audioVolume?: number;

  petName?: string; 
  petPrefix?: string;
  petSuffix?: string;
  petAbility?: string;

  seedBase?: number;
  seedOverlay?: number;
  treeBase?: number;
  treeLeaves?: number;
  seedColor?: Color;
  seedOverlayColor?: Color;

  ingredient?: number;
  growTime?: number;
  flags2?: number;
  isRayman?: number;

  extraOptions?: string;
  texture2?: string;
  extraOptions2?: string;

  unk1?: number;

  punchOptions?: string;

  unk2?: number;
  bodyPartList?: number[];

  unk3?: number;
  unk4?: number;

  extra_str?: string;
  itemRender?: string;

  unk5?: number;

  itemRendererHash?: number;
}

export class ItemsDat {

  private pos = 0;
  private secretKey = "PBG892FXX982ABC*";

  constructor(private data: { itemsDat: Buffer }) {}

  /**
   * 
   * @private 
   */
  private read8() {
    return this.data.itemsDat?.readUint8(this.pos++);
  }

  /**
   * 
   * @private 
   */
  private read16() {
    let val = this.data.itemsDat?.readUint16LE(this.pos);
    this.pos += 2;

    return val;
  }

  /**
   * 
   * @private 
   */
  private read32() {
    let val = this.data.itemsDat?.readUint32LE(this.pos);
    this.pos += 4;

    return val;
  }

  /**
   * 
   * @private 
   */
  private readArr(length: number) {
    let arr = [];

    for(let i = 0; i < length; i++) {
      arr.push(this.read8());
    }

    return arr;
  }

  /**
   * 
   * @private 
   */
  private readString(encode: boolean, itemID?: number) {
    let length = this.read16();
    let str = "";

    if(encode) {
      for(let i = 0; i < length; i++) {
        const buf = this.read8();
        str += String.fromCharCode(buf! ^ this.secretKey.charCodeAt((itemID! + i) % this.secretKey.length))
      }
    }
    else {
      for(let i = 0; i < length; i++) {
        str += String.fromCharCode(this.read8() as number);
      }
    }
    
    return str;
  }

  public async parse() {
    const arr = [];

    const version = this.read16();
    const itemcount = this.read32();

    for(let i = 0; i < itemcount; i++) {
      let itemData: ItemData = {};

      itemData.item_id = this.read32();

      itemData.editableType = this.read8();
      itemData.itemCategory = this.read8();
  		itemData.actionType = this.read8();
  		itemData.hitSoundType = this.read8();

      itemData.item_name = this.readString(true, itemData.item_id);

      itemData.item_texture = this.readString(false);
      itemData.textureHash = this.read32();
      
      itemData.visualEffect = this.read8();
      itemData.ingredientType = this.read32();
      
      itemData.textureX = this.read8();
      itemData.textureY = this.read8();

      itemData.spreadType = this.read8();
      itemData.stripeyWallpapaer = this.read8();
      itemData.collisionType = this.read8();

      itemData.hitsToBreak = this.read8() / 6;
      itemData.restoreTime = this.read32();

      itemData.clothingType = this.read8();

      itemData.rarity = this.read16();
      itemData.maxCapacity = this.read8();

      itemData.extraFile = this.readString(false);
      itemData.extrafileHash = this.read32();

      itemData.audioVolume = this.read32();

      itemData.petName = this.readString(false);
      itemData.petPrefix = this.readString(false);
      itemData.petSuffix = this.readString(false);
      itemData.petAbility = this.readString(false);

      itemData.seedBase = this.read8();
      itemData.seedOverlay = this.read8();
      itemData.treeBase = this.read8();
      itemData.treeLeaves = this.read8();

      itemData.seedColor = {
        alpha: this.read8(),
        r: this.read8(),
        g: this.read8(),
        b: this.read8(),
      }
      
      itemData.seedOverlayColor = {
        alpha: this.read8(),
        r: this.read8(),
        g: this.read8(),
        b: this.read8()
      }

      itemData.ingredient = this.read32();
      itemData.growTime = this.read32();
      itemData.flags2 = this.read16();
      itemData.isRayman = this.read16();

      itemData.extraOptions = this.readString(false);
      itemData.texture2 = this.readString(false);
      itemData.extraOptions2 = this.readString(false);

      this.pos += 8;
      itemData.unk1 = this.read32();
      this.pos += 68

      if(version >= 11) {
        itemData.punchOptions = this.readString(false);
      }
      if(version >= 12) {
        itemData.unk2 = this.read32();

        itemData.bodyPartList = this.readArr(9);
      }
      if(version >= 13) {
        itemData.unk3 = this.read32();
      }
      if(version >= 14) {
        itemData.unk4 = this.read32();
      }
      if(version >= 15) {
        this.pos += 25;
        itemData.extra_str = this.readString(false);
      } 
      if(version >= 16) {
        itemData.itemRender = this.readString(false);
      }
      if(version >= 17) {
        itemData.unk5 = this.read32();
      }
      if(version >= 18) {
        itemData.itemRendererHash = this.read32();
      }

      arr.push(itemData);
    }

    this.pos = 0;
    return { items: arr, itemcount: itemcount, version: version };
  }
}

export default ItemsDat