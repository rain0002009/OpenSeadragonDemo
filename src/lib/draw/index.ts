import P5 from 'p5'
import { Draw } from './Draw'
import { DrawCircle } from './DrawCircle'
import { DrawRect } from './DrawRect'
import { DrawText } from './DrawText'
import { DrawFree } from './DrawFree'
import { DrawLine } from './DrawLine'
export class DrawMethod {
    public methods: Record<string, InstanceType<typeof Draw>> = {}
    private readonly sk: P5
    constructor (sk:P5) {
        this.sk = sk
        this.add(DrawCircle)
        this.add(DrawRect)
        this.add(DrawText)
        this.add(DrawFree)
        this.add(DrawLine)
    }
    add <T>(DrawItem: typeof Draw){
        const item = new DrawItem(this.sk)
        this.methods[item.drawName] = item
    }
}
