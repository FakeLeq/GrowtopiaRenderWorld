import { ItemInfo } from "../Items/ItemInfo/Items";
import { arr, arr2 } from "../utils/Utils";
import { TileFlags } from "../utils/cFlags";
import { TileExtra } from "../utils/iTileExtra";
import { ParseData } from "../utils/parseData";
import { setUpRender } from "./setUpRender";
import { createCanvas } from "canvas";

export class RenderWorld {
    private setUpRender?: setUpRender;

    public parsedWorld?: ParseData;
    public arrtest?: any[] = [];

    constructor(data: { parsedWorld: ParseData, itemsDat: Buffer }) {
        this.parsedWorld = data.parsedWorld;

        this.setUpRender = new setUpRender(data.itemsDat);
        //this.setUpRender.LoadItems?.start();

        //this.setUpRender?.LoadTextures(this.parsedWorld.BlockInfo!)
    }

    public async start() {
        await Promise.all([ this.setUpRender?.LoadTextures(this.parsedWorld!) ])
    }

    public getWorldInfo() {
        return this.parsedWorld?.worldInfo;
    }

    private findTile(x: number, y: number) {
        return this.parsedWorld?.BlockInfo?.find(z => z.x == x && z.y == y);
    }

    public async render() {
        const canvas = createCanvas(this.parsedWorld?.worldInfo?.width! * 32, this.parsedWorld?.worldInfo?.height! * 32);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(this.setUpRender?.weathers?.get(this.parsedWorld?.worldInfo?.weatherCurrent!), 0, 0, 1920, 1080, 0, 0, this.parsedWorld?.worldInfo?.width! * 32, this.parsedWorld?.worldInfo?.height! * 32);

        /**
         * drawImage(Iamge, textureX, textureY, crop width, crop height, diplayX, displayY, display width, dislay height)
         */

        this.parsedWorld?.BlockInfo!.forEach(async (x) => {
            // BACKGROUND
            if(x.bgID != ItemInfo.Items._BLANK) {
                const i_bg = this.setUpRender?.LoadItems?.findWithID(x.bgID!);

                let offSetXBG = i_bg!.textureX!;
                let offSetYBG = i_bg!.textureY!;
                switch(i_bg?.spreadType) {
                    case 2: {
                        let top = this.findTile(x.x!, x.y! - 1)?.bgID == x.bgID;
                        let left_top = this.findTile(x.x! - 1, x.y! - 1)?.bgID == x.bgID;
                        let right_top = this.findTile(x.x! + 1, x.y! - 1)?.bgID == x.bgID;
    
                        let left = this.findTile(x.x! - 1, x.y!)?.bgID == x.bgID;
                        let right = this.findTile(x.x! + 1, x.y!)?.bgID == x.bgID;
    
                        let bottom = this.findTile(x.x!, x.y! + 1)?.bgID == x.bgID;
                        let left_bottom = this.findTile(x.x! - 1, x.y! + 1)?.bgID == x.bgID;
                        let right_bottom = this.findTile(x.x! + 1, x.y! + 1)?.bgID == x.bgID;
    
                        if(!left || !top) left_top = false;
                        if(!left || !bottom) left_bottom = false;
                        if(!right || !top) right_top = false;
                        if(!right || !bottom) right_bottom = false;
    
                        let tableIndex = 
                        Number(left_top) + (2 * Number(top)) + (4 * Number(right_top))
                        + 8 * Number(left) + 16 * Number(right)
                        + 32 * Number(left_bottom) + 64 * Number(bottom) + 128 * Number(right_bottom);

                        offSetXBG += arr[tableIndex] % 8;
                        offSetYBG += Math.floor(arr[tableIndex] / 8) ;
                        break;
                    }
                }

                ctx.drawImage(
                    this.setUpRender?.bgTexture?.get(x.bgID!),
                    offSetXBG * 32,
                    offSetYBG * 32,
                    32, 32,
                    x.x! * 32,
                    x.y! * 32,
                    32, 32
                )
            }
            // BACKGROUND

            if(x.fgID != ItemInfo.Items._BLANK) {
                /// FOREGROUND

                const i_fg = this.setUpRender?.LoadItems?.findWithID(x.fgID!);
                let offSetXFG = i_fg!.textureX!;
                let offSetYFG = i_fg!.textureY!;
    
                switch(i_fg?.spreadType) {
                    case 2: {
                        let top = this.findTile(x.x!, x.y! - 1)?.fgID == x.fgID;
                        let left_top = this.findTile(x.x! - 1, x.y! - 1)?.fgID == x.fgID;
                        let right_top = this.findTile(x.x! + 1, x.y! - 1)?.fgID == x.fgID;
    
                        let left = this.findTile(x.x! - 1, x.y!)?.fgID == x.fgID;
                        let right = this.findTile(x.x! + 1, x.y!)?.fgID == x.fgID;
    
                        let bottom = this.findTile(x.x!, x.y! + 1)?.fgID == x.fgID;
                        let left_bottom = this.findTile(x.x! - 1, x.y! + 1)?.fgID == x.fgID;
                        let right_bottom = this.findTile(x.x! + 1, x.y! + 1)?.fgID == x.fgID;
    
                        if(!left || !top) left_top = false;
                        if(!left || !bottom) left_bottom = false;
                        if(!right || !top) right_top = false;
                        if(!right || !bottom) right_bottom = false;
    
                        let tableIndex = 
                        Number(left_top) + (2 * Number(top)) + (4 * Number(right_top))
                        + 8 * Number(left) + 16 * Number(right)
                        + 32 * Number(left_bottom) + 64 * Number(bottom) + 128 * Number(right_bottom);
    
                        offSetXFG += arr[tableIndex] % 8;
                        offSetYFG += Math.floor(arr[tableIndex] / 8) ;
                        break;
                    }

                    case 3: {
                        let left = this.findTile(x.x! - 1, x.y!)?.fgID == x.fgID;
                        let right = this.findTile(x.x! + 1, x.y!)?.fgID == x.fgID;
    
                        if(!left && !right) offSetXFG += 3;
                        else if(!left && right) offSetXFG += 0;
                        else if(left && !right) offSetXFG += 2;
                        else if(left && right) offSetXFG += 1;

                        break;
                    }

                    case 5: {
                        let top = this.findTile(x.x!, x.y! - 1)?.fgID == x.fgID;
                        let left = this.findTile(x.x! - 1, x.y!)?.fgID == x.fgID;
                        let right = this.findTile(x.x! + 1, x.y!)?.fgID == x.fgID;
                        let bottom = this.findTile(x.x!, x.y! + 1)?.fgID == x.fgID;
                        
                        let tableIndex = Number(top) + 2 * Number(left) + 4 * Number(right) + 8 * Number(bottom);

                        offSetXFG += arr2[tableIndex] % 8;
                        offSetYFG += Math.floor(arr2[tableIndex] / 8);
                    }
                }

                if(x.tileExtraType! & TileFlags.TILE_EXTRA) {
                    switch(x.tileExtraType) {
                        case TileExtra.Types.LOCK: {
                            offSetXFG += 2;
                        }
                    }
                }
    
                ctx.drawImage(
                    this.setUpRender?.fgTexture?.get(x.fgID!),
                    offSetXFG * 32,
                    offSetYFG * 32,
                    32, 32,
                    x.x! * 32,
                    x.y! * 32,
                    32, 32
                )
            }
            
        })

        this.parsedWorld?.DroppedItem?.forEach(async (x) => {
            const i_item = this.setUpRender?.LoadItems?.findWithID(x.itemID!);

            if(i_item?.actionType != 19) {
                let pickUpBoxX = 0;

                switch(i_item?.spreadType) {
                    case 2: {
                        i_item.textureX! += 4;
                        i_item.textureY! += 1;
                    } break;
                }
    
                switch(i_item?.actionType) {
                    case ItemInfo.ItemType.LOCK: pickUpBoxX = 6; break;
                }
    
                ctx.drawImage(
                    this.setUpRender?.dropTexture?.get(x.itemID!), 
                    i_item?.textureX! * 32, 
                    i_item?.textureY! * 32, 
                    32, 32,
                    x.x! * 32,
                    x.y! * 32,
                    20, 20
                )
    
                ctx.drawImage(
                    this.setUpRender?.dropTexture?.get(-1),
                    pickUpBoxX * 20,
                    0,
                    20, 20,
                    x.x! * 32 - 4,
                    x.y! * 32 - 4,
                    28, 28
                )
            }
            else {
               
            }

            if(x.itemCount! > 1) {
                ctx.font = "18px serif"
                ctx.fillStyle = "white"
                ctx.fillText(String(x.itemCount), (x.x! * 32) + 12, (x.y! * 32) + 20)
            }
        })

        return canvas.toBuffer();
    }
}