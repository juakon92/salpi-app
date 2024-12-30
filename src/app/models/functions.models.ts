export namespace ModelsFunctions {
  export interface RequestSetRole {
    roles: {
      admin?: boolean
      client?: boolean
      dealer?: boolean
    },
    uid: string // Identificador único del usuario
  }

  export interface ResponseSetRole {
    ok: boolean
  }
}
