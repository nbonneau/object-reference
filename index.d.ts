export function ObjectReference(opts?: ObjectReferenceOptions): ObjectReferenceClass;

export interface ObjectReferenceOptions {
    referenceCharKey?: string;
    recursive?: boolean;
    global?: object;
}

export class ObjectReferenceClass {
    setOptions(opts: ObjectReferenceOptions): ObjectReferenceClass;

    parse(data: Array<any>|Object): ObjectReferenceClass;

    parseReferences(value: string, referenceCharKey?: string): string;

    getReferenceKeys(value: string, referenceCharKey?: string): Array<string>;

    hasReferences(value: string, referenceCharKey?: string): boolean;

    isValidReference(value: string, referenceCharKey?: string): boolean;
}