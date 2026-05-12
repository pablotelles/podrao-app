export class EditFieldNotEditableError extends Error {
  readonly code = 'EDIT_FIELD_NOT_EDITABLE';
  constructor(fieldName: string) {
    super(`O campo "${fieldName}" não pode ser editado pela comunidade`);
    this.name = 'EditFieldNotEditableError';
  }
}
