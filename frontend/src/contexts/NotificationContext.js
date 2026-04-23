import { createContext } from "react";

// On sépare la création du contexte dans un fichier .js pur 
// pour satisfaire les contraintes strictes du Fast Refresh.
export const NotificationContext = createContext();
