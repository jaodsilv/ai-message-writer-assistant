export interface UndoAction {
    type: 'delete' | 'create' | 'update' | 'archive' | 'restore';
    collection: string;
    id: string;
    previousData?: any;
}

export class UndoService {
    private stack: UndoAction[] = [];

    push(action: UndoAction) {
        this.stack.push(action);
    }

    pop(): UndoAction | undefined {
        return this.stack.pop();
    }

    get canUndo(): boolean {
        return this.stack.length > 0;
    }
}
