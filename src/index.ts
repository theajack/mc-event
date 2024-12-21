import {Eveit, type IJson} from 'eveit';

export const Events = Eveit;

let eventBusId = 0;

const MC_EVENT_TYPE = 'mc-event-bus-port';

interface IPortMessage {
    type: 'emit'|'clear'|'destroy',
    name?: any,
    args?: any,
}

declare type Transferable = any;

declare const __DEV__: boolean;

export class MCEvent<EventMap extends IJson<any> = IJson<any>> extends Eveit<EventMap> {

    static Events = Eveit;

    private static _$: MCEvent;
    static get _ () {
        if (!this._$) this._$ = new MCEvent();
        return this._$;
    }

    port: MessagePort;
    remotePort: MessagePort;

    id: number|string;

    ready: Promise<void>;

    _originEmit: any;

    constructor ({
        id,
        copy = false,
    }: {
        id?: number|string,
        copy?: boolean,
    } = {}) {
        super();
        this.id = typeof id === 'undefined' ? (eventBusId++) : id;

        const {resolve, ready} = withResolve();
        this.ready = ready;
        if (copy) {
            this.waitPort(resolve);
        } else {
            const {port1, port2} = new MessageChannel();
    
            this.port = port1;
            this.remotePort = port2;
            resolve();
        }
        this._initMessage();
        this._originEmit = this.emit.bind(this);
        this.emit = <Key>(name: Key, ...args: EventMap[Key]) => this._newEmit(name, args);
    }

    private _newEmit<Key extends keyof EventMap> (name: Key, args: EventMap[Key], transfers: Transferable[] = []) {
        __DEV__ && console.log('post message');
        // @ts-ignore
        this._originEmit(name, ...args);
        this._postMessage({
            type: 'emit',
            // @ts-ignore
            name,
            args,
        }, transfers);
        return true;
    }

    emitTransfer <Key extends keyof EventMap> (
        name: Key,
        data: {data: EventMap[Key], transfer: Transferable[]}
    ) {
        
        return this._newEmit(name, data.data, data.transfer);
    }

    private _postMessage (data: IPortMessage, transfers: Transferable[] = []) {
        this.port.postMessage(data, transfers);
    }

    async _initMessage () {
        await this.ready;
        // ! 设置一下null，后续才可以通过addEventListener监听
        this.port.onmessage = null;
        __DEV__ && console.log('add message listener');
        this.port.addEventListener('message', e => {
            __DEV__ && console.log('receive message');
            const data = e.data as IPortMessage;

            switch (data.type) {
                case 'emit': this._originEmit(data.name, ...data.args); break;
                case 'clear': {
                    __DEV__ && console.log('receive clear');
                    super.clear(data.name);
                } break;
                case 'destroy': super.destroy(); break;
                default: break;
            }
        });
    }

    static new<EventMap extends Record<any, any>> (id?: string|number) {
        return new MCEvent<EventMap>({id});
    }
    static async copy<EventMap extends Record<any, any>> (id?: string|number) {
        const eveit = new MCEvent<EventMap>({id, copy: true});
        await eveit.ready;
        return eveit;
    }

    into (worker: Worker) {
        const port = this.remotePort;
        worker.postMessage({
            type: MC_EVENT_TYPE,
            id: this.id,
            port,
        }, [port]);
    }

    private waitPort (resolve: ()=>void) {
        const fn = (e: MessageEvent<any>) => {
            const {data} = e;
            if (data.type === MC_EVENT_TYPE) {
                if (typeof data.id === 'undefined' || data.id === this.id) {
                    this.port = data.port;
                    __DEV__ && console.warn('wait port', this.port);
                    self.removeEventListener('message', fn);
                    resolve();
                }
            }
        };
        self.addEventListener('message', fn);
    }

    destroy (): void {
        super.destroy();

        this._postMessage({type: 'destroy'});
    }

    clear<Key extends keyof EventMap> (name: Key): boolean {
        const v = super.clear(name);
        if (v) {
            this._postMessage({type: 'clear', name});
        }
        return v;
    }

}


function withResolve<T = any, Err = any> () {
    let resolve!: (data?: T) => void;
    let reject!: (Err?: Err) => void;
    const ready = new Promise<T>((res, rej) => {
        // @ts-ignore
        resolve = res;
        reject = rej;
    });
    return {ready, resolve, reject};
}

export default MCEvent;