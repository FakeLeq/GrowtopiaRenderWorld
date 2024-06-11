import { readFileSync, readdir, readdirSync } from "fs";
import { LoadItems } from "../Items/LoadItems";
import { ParseData } from "../utils/parseData";
import { loadImage } from "canvas";
import { Weather } from "../Items/ItemInfo/Weather";
import { TileExtraRender } from "../utils/Utils";

export class setUpRender {
    public LoadItems: LoadItems;

    public fgTexture: Map<number, any>;
    public bgTexture: Map<number, any>;
    public dropTexture: Map<number, any>;
    public weathers: Map<number, any>;
    public TileExtraItems: Map<number, TileExtraRender>

    public fgUsed?: {};
    public bgUsed?: {};

    constructor(public itemsDat: Buffer) {
        this.LoadItems = new LoadItems(this.itemsDat!);
        this.LoadItems.start()

        this.fgTexture = new Map();
        this.bgTexture = new Map();
        this.dropTexture = new Map();
        this.weathers = new Map();
        this.TileExtraItems = new Map();
    }

    public async LoadTextures(parsedWorld: ParseData) {
        const fg = parsedWorld.BlockInfo!.reduce((data: any, { fgID: key }) => (data[key!] = (data[key!] || 0) + 1, data), {})
        const bg = parsedWorld.BlockInfo!.reduce((data: any, { bgID: key }) => (data[key!] = (data[key!] || 0) + 1, data), {})
        const drops = parsedWorld.DroppedItem!.reduce((data: any, { itemID: key }) => (data[key!] = (data[key!] || 0) + 1, data), {})
        const tileExtraItems = parsedWorld.TileExtraItems?.filter((val, i) => parsedWorld.TileExtraItems?.indexOf(val) == i);

        //this.loadWeathers();

        /*Object.entries(drops).forEach(async (x) => {
            this.dropTexture?.set(Number(x[0]), await loadImage("assets/sprites/" + this.LoadItems?.findWithID(Number(x[0])).item_texture?.replace(".rttex", ".png")))
        })*/
        /* pickup box */ this.dropTexture?.set(-1, await loadImage("assets/sprites/pickup_box.png"));
        /* seeds */ this.dropTexture?.set(-2, await loadImage("assets/sprites/seed.png"));

        Object.entries(fg).forEach(async (x) => {
            this.fgTexture?.set(Number(x[0]), await loadImage("assets/sprites/" + this.LoadItems?.findWithID(Number(x[0])).item_texture?.replace(".rttex", ".png")))
        });

        Object.entries(bg).forEach(async (x) => {
            this.bgTexture?.set(Number(x[0]), await loadImage("assets/sprites/" + this.LoadItems?.findWithID(Number(x[0])).item_texture?.replace(".rttex", ".png")))
        });

        for(const tItems of tileExtraItems!) {
            const i_item = this.LoadItems.findWithID(tItems);

            this.TileExtraItems.set(Number(tItems), {
                image: await loadImage("assets/sprites/" + i_item.item_texture?.replace(".rttex", ".png")),
                x: i_item.textureX!,
                y: i_item.textureY!
            });
        }
        
        this.fgUsed = fg;
        this.bgUsed = bg;
    }

    private async loadWeathers() {
        const dirFiles = readdirSync("assets/weathers")

        this.weathers.set(Weather.DEFAULT, await loadImage("assets/weathers/4.png"));
        for(const weathers of dirFiles) {
            this.weathers.set(Number(weathers.replace(".png", "")), await loadImage("assets/weathers/" + weathers));
        }
    }
}