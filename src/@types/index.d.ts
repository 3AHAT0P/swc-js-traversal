export interface Specifier {
  name: string;
  typeOnly: boolean;
  localName: string | null;
}

export interface ImportAssert {
  type: 'json';
}

export interface RelationNode {
  specifiers: Specifier[];
  typeOnly: boolean;
  asserts: null | ImportAssert;
}
