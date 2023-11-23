// https://github.com/amendx/vue-dndrop/issues/73
declare module 'vue-dndrop' {
    import {
        type AllowedComponentProps,
        type ComponentCustomProps,
        type ComponentOptionsMixin,
        type DefineComponent,
        type NativeElements,
        type PropType,
        type VNodeProps,
    } from 'vue';

    // type WithTemplateSlots<T, S> = T & {
    //     new (): {
    //         $slots: S;
    //     };
    // };

    export interface DragResult {
        isSource: boolean;
        payload: unknown;
        willAcceptDrop: boolean;
    }

    export interface DropResult {
        addedIndex: number | null;
        element: HTMLElement;
        payload: unknown;
        removedIndex: number | null;
    }

    export interface DropNotAllowedResult {
        payload: unknown;
        container: object;
    }

    export type Tag =
        | keyof NativeElements
        | { [K in keyof NativeElements]: { value: K; props: NativeElements[K] } }[keyof NativeElements];

    export interface ContainerProps {
        orientation?: 'horizontal' | 'vertical';
        behaviour?: 'move' | 'copy' | 'drop-zone' | 'contain';
        tag?: Tag;
        groupName?: string;
        lockAxis?: 'x' | 'y';
        dragHandleSelector?: string;
        nonDragAreaSelector?: string;
        dragBeginDelay?: number;
        animationDuration?: number;
        autoScrollEnabled?: boolean;
        dragClass?: string;
        dropClass?: string;
        removeOnDropOut?: boolean;
        dropPlaceholder?: boolean | Record<string, any>;
        fireRelatedEventsOnly?: boolean;
        getChildPayload?: (index: number) => unknown;
        shouldAcceptDrop?: (sourceContainerOptions: object, payload: unknown) => boolean;
        shouldAnimateDrop?: (sourceContainerOptions: object, payload: unknown) => boolean;
        getGhostParent?: () => HTMLElement;
    }

    export interface ContainerEmits {
        dragStart?: (dragResult: DragResult) => void;
        dragEnd?: (dragResult: DragResult) => void;
        dragEnter?: () => void;
        dragLeave?: () => void;
        dropReady?: (dropResult: DropResult) => void;
        drop?: (dropResult: DropResult) => void;
        dropNotAllowed?: (dropNotAllowedResult: DropNotAllowedResult) => void;
    }

    export const Container: WithTemplateSlots<
        DefineComponent<
            { [K in keyof ContainerProps]-?: { type: PropType<ContainerProps[K]> } },
            object,
            unknown,
            object,
            object,
            ComponentOptionsMixin,
            ComponentOptionsMixin,
            ContainerEmits,
            string,
            VNodeProps & AllowedComponentProps & ComponentCustomProps,
            Readonly<ContainerProps> & { [K in keyof ContainerEmits as `on${Capitalize<K>}`]?: ContainerEmits[K] },
            object,
            object
        >,
        Readonly<{ default: () => any }>
    >;

    export interface DraggableProps {
        dragNotAllowed?: boolean;
        tag?: Tag;
    }

    export const Draggable: WithTemplateSlots<
        DefineComponent<
            { [K in keyof DraggableProps]-?: { type: PropType<DraggableProps[K]> } },
            object,
            unknown,
            object,
            object,
            ComponentOptionsMixin,
            ComponentOptionsMixin,
            object,
            string,
            VNodeProps & AllowedComponentProps & ComponentCustomProps,
            Readonly<DraggableProps>,
            object,
            object
        >,
        Readonly<{ default: () => any }>
    >;
}
