import {
    HasSettings
} from "essex.powerbi.base";

/**
 * Represents the state of the timebrush
 */
export default class NetworkNavigatorVisualState extends HasSettings {
    public selectedNodeIndex?: number;

    /**
     * The current zoom scale
     */
    public scale?: number = 1;

    /**
     * The current pan translation
     */
    public translate?: [number, number] = [0, 0];

    /**
     * The node text filter being applied
     */
    public textFilter?: string = "";
}
