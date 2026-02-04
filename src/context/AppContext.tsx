import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EstadoSesion, RolUsuario, Usuario } from '../types/auth';
import { CCAService } from '../servicios/CCAService';

interface AppContextType {
  sesion: EstadoSesion;
  cambiarRol: (nuevoRol: RolUsuario) => void;
  iniciarSesion: (usuario: Usuario) => void;
  cerrarSesion: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [sesion, setSesion] = useState<EstadoSesion>({
    estaAutenticado: false,
    usuario: null,
  });

  const cambiarRol = (nuevoRol: RolUsuario) => {
    if (sesion.usuario) {
      setSesion({
        ...sesion,
        usuario: { ...sesion.usuario, rol: nuevoRol },
      });
    }
  };



  const iniciarSesion = (usuario: Usuario) => {
    // Inicializar CCA al iniciar sesión
    CCAService.getOrCreateCCA(usuario.id, '1sec');
    setSesion({ estaAutenticado: true, usuario });
  };

  const cerrarSesion = () => {
    setSesion({ estaAutenticado: false, usuario: null });
  };

  return (
    <AppContext.Provider value={{ sesion, cambiarRol, iniciarSesion, cerrarSesion }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};