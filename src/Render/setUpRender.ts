import { readFileSync } from "fs";
import { LoadItems } from "../Items/LoadItems";
import { ParseData } from "../utils/parseData";
import { loadImage } from "canvas";
import { Weather } from "../Items/ItemInfo/Weather";

export class setUpRender {
    public LoadItems?: LoadItems;

    public fgTexture?: Map<number, any>;
    public bgTexture?: Map<number, any>;
    public dropTexture?: Map<number, any>;
    public weathers?: Map<number, any>;

    public fgUsed?: {};
    public bgUsed?: {};

    constructor(public itemsDat: Buffer) {
        this.LoadItems = new LoadItems(this.itemsDat!);
        this.LoadItems.start()

        this.fgTexture = new Map();
        this.bgTexture = new Map();
        this.dropTexture = new Map();
        this.weathers = new Map();
    }

    public async LoadTextures(parsedWorld: ParseData) {
        const fg = parsedWorld.BlockInfo!.reduce((data: any, { fgID: key }) => (data[key!] = (data[key!] || 0) + 1, data), {})
        const bg = parsedWorld.BlockInfo!.reduce((data: any, { bgID: key }) => (data[key!] = (data[key!] || 0) + 1, data), {})
        const drops = parsedWorld.DroppedItem!.reduce((data: any, { itemID: key }) => (data[key!] = (data[key!] || 0) + 1, data), {})

        this.loadWeathers();

        Object.entries(drops).forEach(async (x) => {
            this.dropTexture?.set(Number(x[0]), await loadImage("assets/sprites/" + this.LoadItems?.findWithID(Number(x[0])).item_texture?.replace(".rttex", ".png")))
        })
        /* pickup box */ this.dropTexture?.set(-1, await loadImage("assets/sprites/pickup_box.png"));
        /* seeds */ this.dropTexture?.set(-2, await loadImage("assets/sprites/seed.png"));

        Object.entries(fg).forEach(async (x) => {
            this.fgTexture?.set(Number(x[0]), await loadImage("assets/sprites/" + this.LoadItems?.findWithID(Number(x[0])).item_texture?.replace(".rttex", ".png")))
        });

        Object.entries(bg).forEach(async (x) => {
            this.bgTexture?.set(Number(x[0]), await loadImage("assets/sprites/" + this.LoadItems?.findWithID(Number(x[0])).item_texture?.replace(".rttex", ".png")))
        });
        
        this.fgUsed = fg;
        this.bgUsed = bg;
    }

    private async loadWeathers() {
        this.weathers?.set(Weather.SUNNY, await loadImage("assets/weathers/Sunny.png"));
    }
}

/**
 * for(let [key, value] of Object.entries(fg)) {
            if(Number(key) == 0) return;
            this.fgTexture?.set(Number(key), await loadImage(readFileSync("assets/sprites/" + this.LoadItems?.findWithID(Number(key)).item_texture?.replace(".rttex", ".png"))))
        }

        for(let [key, value] of Object.entries(bg)) {
            if(Number(key) == 0) return;
            this.bgTexture?.set(Number(key), await loadImage(readFileSync("assets/sprites/" + this.LoadItems?.findWithID(Number(key)).item_texture?.replace(".rttex", ".png"))))
        }
 */