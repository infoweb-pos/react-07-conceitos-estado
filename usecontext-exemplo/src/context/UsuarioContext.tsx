"use client";

import { createContext, useState } from "react";

const Contexto = createContext(null);

const UsuarioContexto = ({children}:{children: React.ReactNode}) => {
    const [usuario, setUsuario] = useState("Minora");
    return (
        <Contexto value={[usuario, setUsuario]}>
            {children}
        </Contexto>
    )
}

export default UsuarioContexto;
export {Contexto};