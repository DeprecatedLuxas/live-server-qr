import { workspace } from "vscode";
import { IHttps } from "./types";
import ip from 'ip';

export const createLanAdress = (path?: string) => {
    return LiveServerConfig.getHttps.enable ? "https://" : "http://" + ip.address() + ':' + LiveServerConfig.getPort + "/" + path;
};


export class LiveServerConfig {

    public static get configuration() {
        return workspace.getConfiguration('liveServer.settings');
    }

    private static getSettings<T>(val: string): T {
        return LiveServerConfig.configuration.get(val) as T;
    }


    public static get getPort(): number {
        return LiveServerConfig.getSettings<number>('port');
    }

    public static get getHttps(): IHttps {
        return LiveServerConfig.getSettings<IHttps>('https') || {} as IHttps;
    }
}